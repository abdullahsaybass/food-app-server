// ─────────────────────────────────────────────
// 🔥 COUPON ROUTES
// ─────────────────────────────────────────────
import { Router } from 'express';
import { protect, adminOnly } from '../../middleware/auth.middleware.js';
import {
  validateCreateCoupon,
  validateUpdateCoupon,
  validateApplyCoupon,
  validateListCoupons,
} from './coupon.validator.js';
import * as couponController from './coupon.controller.js';

const router = Router();

// ───────────────────────────────────────────────────────────────
// PUBLIC — any user (logged-in) can apply a coupon at checkout
// POST /api/coupons/apply
// ───────────────────────────────────────────────────────────────
router.post('/apply', protect, validateApplyCoupon, couponController.applyCoupon);

// ───────────────────────────────────────────────────────────────
// ADMIN — list and view coupons
// GET  /api/coupons
// GET  /api/coupons/:id
// ───────────────────────────────────────────────────────────────
router.get('/',    protect, adminOnly, validateListCoupons, couponController.listCoupons);
router.get('/:id', protect, adminOnly, couponController.getCoupon);

// ───────────────────────────────────────────────────────────────
// ADMIN — create / update / delete
// POST   /api/coupons
// PUT    /api/coupons/:id
// PATCH  /api/coupons/:id/deactivate
// DELETE /api/coupons/:id
// ───────────────────────────────────────────────────────────────
router.post(  '/',                 protect, adminOnly, validateCreateCoupon, couponController.createCoupon);
router.put(   '/:id',              protect, adminOnly, validateUpdateCoupon, couponController.updateCoupon);
router.patch( '/:id/deactivate',   protect, adminOnly, couponController.deactivateCoupon);
router.delete('/:id',              protect, adminOnly, couponController.deleteCoupon);

export default router;