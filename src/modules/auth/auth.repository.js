import User from "../user/user.model.js";

export const findByEmailWithPassword = (email) =>
  User.findByEmailWithPassword(email);

export const saveRefreshToken = (userId, token) =>
  User.findByIdAndUpdate(userId, { refreshToken: token });

export const removeRefreshToken = (userId) =>
  User.findByIdAndUpdate(userId, { refreshToken: null });

export const findByEmail = (email) =>
  User.findOne({ email });

export const findById = (id) =>
  User.findById(id);

export const createUser = (data) =>
  User.create(data);

export const findDuplicate = (email, phone) =>
  User.findOne({ $or: [{ email }, { phone }] });

export const setResetToken = (userId, token, expiry) =>
  User.findByIdAndUpdate(userId, {
    passwordResetToken: token,
    passwordResetExpires: expiry,
  });

export const findByResetToken = (token) =>
  User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

// ─── Google OAuth ─────────────────────────────────────────────────────────────
export const findByGoogleId = (googleId) =>
  User.findOne({ googleId });

// Find by email (Google user linking) or create a brand-new Google user
export const findOrCreateGoogleUser = async ({ googleId, email, name, profilePic }) => {
  // 1. Already signed in with Google before
  let user = await User.findOne({ googleId });
  if (user) return { user, isNew: false };

  // 2. Email exists (regular account) — link Google to it
  user = await User.findOne({ email });
  if (user) {
    user.googleId = googleId;
    if (!user.profilePic?.url && profilePic) {
      user.profilePic = { url: profilePic, publicId: null };
    }
    await user.save();
    return { user, isNew: false };
  }

  // 3. New user — create account without password
  user = await User.create({
    name,
    email,
    googleId,
    profilePic: profilePic ? { url: profilePic, publicId: null } : undefined,
    // phone left empty — user can add later from profile
  });

  return { user, isNew: true };
};