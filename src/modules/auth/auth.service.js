import jwt    from "jsonwebtoken";
import crypto from "crypto";
import { JWT_EXPIRES_IN, MESSAGES } from "./auth.constants.js";
import * as repo from "./auth.repository.js";

// ─── Token helpers ────────────────────────────────────────────────────────────
const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || JWT_EXPIRES_IN,
  });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerUser = async ({ name, phone, email, password }) => {
  const existing = await repo.findDuplicate(email, phone);
  if (existing) {
    return {
      conflict: true,
      message:
        existing.email === email ? MESSAGES.EMAIL_TAKEN : MESSAGES.PHONE_TAKEN,
    };
  }

  const user = await repo.createUser({ name, phone, email, password });

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await repo.saveRefreshToken(user._id, refreshToken);

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return { user: userObj, accessToken, refreshToken };
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  const user = await repo.findByEmailWithPassword(email);

  if (!user) {
    return { unauthorized: true, message: MESSAGES.INVALID_CREDENTIALS };
  }
  if (!user.isActive) {
    return { forbidden: true, message: MESSAGES.ACCOUNT_DEACTIVATED };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return { unauthorized: true, message: MESSAGES.INVALID_CREDENTIALS };
  }

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await repo.saveRefreshToken(user._id, refreshToken);

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return { user: userObj, accessToken, refreshToken };
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logoutUser = async (userId) => {
  await repo.removeRefreshToken(userId);
};

// ─── Refresh access token ─────────────────────────────────────────────────────
export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await repo.findById(decoded.id);
    if (!user || !user.refreshToken) return { unauthorized: true };
    if (user.refreshToken !== refreshToken) return { unauthorized: true };

    // Rotate both tokens
    const newAccessToken  = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    await repo.saveRefreshToken(user._id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch {
    return { unauthorized: true };
  }
};

// ─── Forgot password ──────────────────────────────────────────────────────────
export const forgotPassword = async (email) => {
  const user = await repo.findByEmail(email);

  if (!user) {
    return { success: true, message: MESSAGES.PASSWORD_RESET_EMAIL_SENT };
  }

  const resetToken  = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const expiry      = Date.now() + 15 * 60 * 1000;

  await repo.setResetToken(user._id, hashedToken, expiry);

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  console.log("RESET URL:", resetUrl);

  return { success: true, message: MESSAGES.PASSWORD_RESET_EMAIL_SENT };
};

// ─── Reset password ───────────────────────────────────────────────────────────
export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await repo.findByResetToken(hashedToken);
  if (!user) {
    return { unauthorized: true, message: MESSAGES.PASSWORD_RESET_INVALID };
  }

  user.password             = newPassword;
  user.passwordResetToken   = null;
  user.passwordResetExpires = null;

  await user.save();

  return { success: true, message: MESSAGES.PASSWORD_RESET_SUCCESS };
};