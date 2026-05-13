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