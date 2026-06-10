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

const router = Router();

// ───────────────────────────────────────────────────────────────
// PUBLIC
// GET /api/banners/live?position=home_top
// ───────────────────────────────────────────────────────────────
router.get('/live', bannerController.getLiveBanners);

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