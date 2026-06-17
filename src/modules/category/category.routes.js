// modules/category/category.routes.js
import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "./category.controller.js";
import {
  validateCreateCategory,
  validateUpdateCategory,
} from "./category.validator.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";
import { upload, uploadToCloud, deleteFromCloudinary } from "../../middleware/upload.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { BadRequestError } from "../../utils/apiError.js";

const router = Router();

// ── Public routes ──────────────────────────────────────────────────────────
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// ── Image upload (admin only) ────────────────────────────────────────────
// POST /api/categories/upload-image   (multipart/form-data, field name: "images")
router.post(
  "/upload-image",
  protect,
  restrictTo("admin", "superadmin"),
  (req, res, next) => { req.uploadFolder = "grocify/categories"; next(); },
  upload.array("images", 1),
  uploadToCloud,
  asyncHandler(async (req, res) => {
    const image = req.cloudinaryImages?.[0];
    if (!image) {
      throw new BadRequestError("No file uploaded");
    }
    res.status(200).json({ success: true, url: image.url, publicId: image.publicId });
  })
);

// DELETE /api/categories/upload-image/:publicId
router.delete(
  "/upload-image/:publicId",
  protect,
  restrictTo("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const publicId = decodeURIComponent(req.params.publicId);
    await deleteFromCloudinary(publicId);
    res.status(200).json({ success: true, message: "Image deleted" });
  })
);

// ── Admin routes ───────────────────────────────────────────────────────────
router.post("/",     protect, restrictTo("admin", "superadmin"), validateCreateCategory, createCategory);
router.patch("/:id", protect, restrictTo("admin", "superadmin"), validateUpdateCategory, updateCategory);
router.delete("/:id", protect, restrictTo("admin", "superadmin"), deleteCategory);

export default router;