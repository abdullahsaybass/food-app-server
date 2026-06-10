import { MESSAGES } from "./user.constants.js";
import * as repo    from "./user.repository.js";

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getMe = async (userId) => {
  const user = await repo.findById(userId);

  if (!user) {
    return { notFound: true, message: "User not found" };
  }

  return { user };
};

// ─── UPDATE PROFILE ─────────────────────────
export const updateProfile = async (userId, data) => {
  if (data.phone) {
    const phoneOwner = await repo.findPhoneExcluding(data.phone, userId);
    if (phoneOwner) {
      return { conflict: true, message: MESSAGES.PHONE_IN_USE };
    }
  }

  const user = await repo.updateById(userId, data);

  if (!user) {
    return { notFound: true, message: MESSAGES.USER_NOT_FOUND };
  }

  return { user };
};

export const deactivateAccount = async (userId) => {
  await repo.deactivateById(userId);
};

// ─── Profile picture ──────────────────────────────────────────────────────────
export const updateProfilePic = async (userId, { url, publicId }) => {
  const user = await repo.updateById(userId, {
    "profilePic.url":      url,
    "profilePic.publicId": publicId,
  });
  return { user };
};

export const removeProfilePic = async (userId) => {
  const user = await repo.updateById(userId, {
    "profilePic.url":      null,
    "profilePic.publicId": null,
  });
  return { user };
};

// ─── Addresses ────────────────────────────────────────────────────────────────
export const addAddress = async (userId, addressData) => {
  const user = await repo.findById(userId);
  if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);

  if (user.addresses.length >= 5) {
    return { limitReached: true, message: MESSAGES.ADDRESS_LIMIT };
  }

  user.addresses.push(addressData);
  await user.save();

  return { addresses: user.addresses };
};

export const updateAddress = async (userId, addressId, updateData) => {
  const user = await repo.findById(userId);
  if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);

  const address = user.addresses.id(addressId);
  if (!address) {
    return { notFound: true, message: MESSAGES.ADDRESS_NOT_FOUND };
  }

  Object.assign(address, updateData);
  await user.save();

  return { addresses: user.addresses };
};

export const deleteAddress = async (userId, addressId) => {
  const user = await repo.findById(userId);
  if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);

  const address = user.addresses.id(addressId);
  if (!address) {
    return { notFound: true, message: MESSAGES.ADDRESS_NOT_FOUND };
  }

  address.deleteOne();
  await user.save();

  return { addresses: user.addresses };
};

// ─── Admin: user management ───────────────────────────────────────────────────
export const getAllUsers = async (role) => {
  const filter = role ? { role } : {};
  const users  = await repo.findAllUsers(filter);
  return { users };
};

export const getUserById = async (id) => {
  const user = await repo.findById(id);
  if (!user) return { notFound: true, message: MESSAGES.USER_NOT_FOUND };
  return { user };
};

export const adminUpdateUser = async (id, data) => {
  const user = await repo.updateById(id, data);
  if (!user) return { notFound: true, message: MESSAGES.USER_NOT_FOUND };
  return { user };
};

export const adminDeleteUser = async (id) => {
  const user = await repo.deactivateById(id);
  if (!user) return { notFound: true, message: MESSAGES.USER_NOT_FOUND };
  return { success: true };
};

// ─── Seed admin ───────────────────────────────────────────────────────────────
export const seedAdmin = async (data) => {
  const email = data.email;

  const existing = await repo.findByEmail(email);
  if (existing) {
    return { message: "Admin already exists" };
  }

  const user = await repo.createUser({
    name: data.name || "Admin",
    email,
    password: data.password || "Admin@123",
    role: "admin",
    // 🚫 no phone
  });

  return { user };
};

export const getAddresses = async (userId) => {
  const user = await repo.findById(userId);

  if (!user) {
    return {
      notFound: true,
      message: MESSAGES.USER_NOT_FOUND,
    };
  }

  return {
    addresses: user.addresses || [],
  };
};
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await repo.findByIdWithPassword(userId);
  if (!user) return { notFound: true, message: MESSAGES.USER_NOT_FOUND };

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return { unauthorized: true, message: "Current password is incorrect" };

  user.password = newPassword;
  await user.save();
  return { success: true };
};