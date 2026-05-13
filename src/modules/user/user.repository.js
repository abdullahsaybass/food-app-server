import User from "../user/user.model.js";

// ─── Auth ────────────────────────────────────────────────────────────────
export const findByEmailWithPassword = (email) =>
  User.findByEmailWithPassword(email);

// ─── Profile lookups ─────────────────────────────────────────────────────
export const findById = (id) =>
  User.findById(id);

export const findPhoneExcluding = (phone, excludeId) =>
  User.findOne({ phone, _id: { $ne: excludeId } });

// ─── Profile writes ──────────────────────────────────────────────────────
export const updateById = (id, data) =>
  User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });

export const deactivateById = (id) =>
  User.findByIdAndUpdate(id, { isActive: false }, { new: true });

// ─── Address operations ──────────────────────────────────────────────────
export const pushAddress = (userId, address) =>
  User.findByIdAndUpdate(
    userId,
    { $push: { addresses: address } },
    { new: true, runValidators: true }
  );

export const updateAddressFields = (userId, addressId, data) => {
  const setPayload = {};
  Object.keys(data).forEach((key) => {
    setPayload[`addresses.$.${key}`] = data[key];
  });

  return User.findOneAndUpdate(
    { _id: userId, "addresses._id": addressId },
    { $set: setPayload },
    { new: true, runValidators: true }
  );
};

export const pullAddress = (userId, addressId) =>
  User.findByIdAndUpdate(
    userId,
    { $pull: { addresses: { _id: addressId } } },
    { new: true }
  );

// ─── Admin ───────────────────────────────────────────────────────────────
export const findAllUsers = (filter = {}) =>
  User.find(filter).select("-__v -refreshToken -password");

export const findByEmail = (email) =>
  User.findOne({ email });

export const createUser = (data) =>
  User.create(data);