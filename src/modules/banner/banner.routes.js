// ─────────────────────────────────────────────
// 🔥 BANNER ROUTES
// ─────────────────────────────────────────────
import { Router } from 'express';
import { protect, adminOnly } from '../../middleware/auth.middleware.js';
import {
  validateCreateBanner,
  validateUpdateBanner,
  validateListBanners,
} from './banner.validator.js';
import * as bannerController from './banner.controller.js';
import { upload, uploadToCloud, deleteFromCloudinary } from '../../middleware/upload.middleware.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { BadRequestError } from '../../utils/apiError.js';

const router = Router();

// ───────────────────────────────────────────────────────────────
// PUBLIC
// GET /api/banners/live?position=home_top
// ───────────────────────────────────────────────────────────────
router.get('/live', bannerController.getLiveBanners);

// ───────────────────────────────────────────────────────────────
// ADMIN — image upload (mirrors category/product upload pattern)
// POST   /api/banners/upload-image   (multipart/form-data, field name: "images")
// DELETE /api/banners/upload-image/:publicId
// ───────────────────────────────────────────────────────────────
router.post(
  '/upload-image',
  protect,
  adminOnly,
  (req, res, next) => { req.uploadFolder = 'banners'; next(); },
  upload.array('images', 1),
  uploadToCloud,
  asyncHandler(async (req, res) => {
    const image = req.uploadedImages?.[0];
    if (!image) throw new BadRequestError('No file uploaded');
    res.status(200).json({ success: true, url: image.url, publicId: image.publicId });
  })
);

router.delete(
  '/upload-image/:publicId',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const publicId = decodeURIComponent(req.params.publicId);
    await deleteFromCloudinary(publicId);
    res.status(200).json({ success: true, message: 'Image deleted' });
  })
);

// ───────────────────────────────────────────────────────────────
// PROTECTED — any logged-in user can view banners
// GET /api/banners
// GET /api/banners/:id
// ───────────────────────────────────────────────────────────────
router.get('/',    protect, validateListBanners, bannerController.listBanners);
router.get('/:id', protect, bannerController.getBanner);

// ───────────────────────────────────────────────────────────────
// ADMIN ONLY
// POST   /api/banners
// PUT    /api/banners/:id
// PATCH  /api/banners/:id/deactivate
// DELETE /api/banners/:id
// ───────────────────────────────────────────────────────────────
router.post(  '/',                   protect, adminOnly, validateCreateBanner, bannerController.createBanner);
router.put(   '/:id',                protect, adminOnly, validateUpdateBanner, bannerController.updateBanner);
router.patch( '/:id/deactivate',     protect, adminOnly, bannerController.deactivateBanner);
router.delete('/:id',                protect, adminOnly, bannerController.deleteBanner);

export default router;