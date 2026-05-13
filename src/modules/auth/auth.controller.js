import jwt    from "jsonwebtoken";
import crypto from "crypto";
import { JWT_EXPIRES_IN, MESSAGES } from "./auth.constants.js";
import * as repo from "./auth.repository.js";
import * as authService from "./auth.service.js";

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
export const register = async ({ name, phone, email, password }) => {
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



// ─── LOGIN ───────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Find user WITH password
    const user = await repo.findByEmailWithPassword(email);

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 2. Check active
    if (!user.isActive) {
      return res.status(403).json({
        message: "Account deactivated",
      });
    }

    // 3. Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 4. Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Update last login
    user.lastLogin = new Date();
    await user.save();

    // 6. Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: user.toSafeObject(),
    });

  } catch (error) {
    next(error);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (userId) => {
  await repo.removeRefreshToken(userId);
};

// ─── Refresh access token ─────────────────────────────────────────────────────
export const refreshToken = async (refreshToken) => {
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
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// ─── Reset password ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const result = await authService.resetPassword(token, password);

    if (result.unauthorized) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);

  } catch (err) {
    next(err);
  }
};