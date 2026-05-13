import express from "express";
import { protect, adminOnly, superAdminOnly } from "../../middleware/auth.middleware.js";
import {
  validateUpdateProfile,
  validateUpdateProfilePic,
  validateAddAddress,
  validateUpdateAddress,
  validateAdminUpdateUser,
} from "./user.validator.js";
import {
  getMe,
  updateMe,
  deleteMe,
  updateProfilePic,
  removeProfilePic,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
  getUserById,
  adminUpdateUser,
  adminDeleteUser,
  seedAdmin,
} from "./user.controller.js";
import { upload } from '../../middleware/upload.middleware.js';

// ─── User router — /api/users ─────────────────────────────────────────────────
export const userRouter = express.Router();

// My profile
userRouter.get("/me",          protect, getMe);
userRouter.put("/me",          protect, validateUpdateProfile, updateMe);
userRouter.delete("/me",       protect, deleteMe);

// Profile picture
userRouter.put(
  '/me/profile-pic',
  protect,
  upload.single('profilePic'),  // ✅ multer — parses file into req.file
  validateUpdateProfilePic,     // ✅ uploads to cloudinary → sets req.validatedBody
  updateProfilePic              // ✅ controller
);
userRouter.delete("/me/profile-pic", protect, removeProfilePic);

// Addresses
userRouter.post("/me/addresses",              protect, validateAddAddress,  addAddress);
userRouter.put("/me/addresses/:addressId",    protect, validateUpdateAddress, updateAddress);
userRouter.delete("/me/addresses/:addressId", protect, deleteAddress);

// ─── Admin router — /api/admin/users ─────────────────────────────────────────
export const adminUserRouter = express.Router();

adminUserRouter.post("/seed",    seedAdmin);
adminUserRouter.get("/",         protect, adminOnly,      getAllUsers);
adminUserRouter.get("/:id",      protect, adminOnly,      getUserById);
adminUserRouter.put("/:id",      protect, adminOnly,      validateAdminUpdateUser, adminUpdateUser);
adminUserRouter.delete("/:id",   protect, superAdminOnly, adminDeleteUser);