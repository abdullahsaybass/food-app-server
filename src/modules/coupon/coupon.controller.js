// ─────────────────────────────────────────────
// 🔥 COUPON CONTROLLER
// ─────────────────────────────────────────────
import asyncHandler from '../../utils/asyncHandler.js';
import * as couponService from './coupon.service.js';
import { toCouponDTO, toCouponListDTO, toCouponApplyDTO } from './coupon.mapper.js';
import { COUPON_MESSAGES } from './coupon.constants.js';

// ─────────────────────────────────────────────
// POST /api/coupons
// ─────────────────────────────────────────────
export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: COUPON_MESSAGES.CREATED,
    data:    toCouponDTO(coupon),
  });
});

// ─────────────────────────────────────────────
// GET /api/coupons
// ─────────────────────────────────────────────
export const listCoupons = asyncHandler(async (req, res) => {
  const { coupons, pagination } = await couponService.getAllCoupons(req.query);

  res.status(200).json({
    success: true,
    message: COUPON_MESSAGES.LIST_FETCHED,
    data:    toCouponListDTO(coupons, pagination),
  });
});

// ─────────────────────────────────────────────
// GET /api/coupons/:id
// ─────────────────────────────────────────────
export const getCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.getCouponById(req.params.id);

  res.status(200).json({
    success: true,
    message: COUPON_MESSAGES.FETCHED,
    data:    toCouponDTO(coupon),
  });
});

// ─────────────────────────────────────────────
// POST /api/coupons/apply
// Body: { code, orderTotal }
// Called at checkout — validates & returns discount amount
// ─────────────────────────────────────────────
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body;
  const userId = req.user?.id ?? null;

  const { coupon, discountAmount } = await couponService.applyCoupon(
    code,
    orderTotal,
    userId
  );

  res.status(200).json({
    success: true,
    message: COUPON_MESSAGES.VALID,
    data:    toCouponApplyDTO(coupon, discountAmount),
  });
});

// ─────────────────────────────────────────────
// PUT /api/coupons/:id
// ─────────────────────────────────────────────
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body, req.user.id);

  res.status(200).json({
    success: true,
    message: COUPON_MESSAGES.UPDATED,
    data:    toCouponDTO(coupon),
  });
});

// ─────────────────────────────────────────────
// PATCH /api/coupons/:id/deactivate
// ─────────────────────────────────────────────
export const deactivateCoupon = asyncHandler(async (req, res) => {
  await couponService.softDeleteCoupon(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: COUPON_MESSAGES.DELETED,
  });
});

// ─────────────────────────────────────────────
// DELETE /api/coupons/:id
// ─────────────────────────────────────────────
export const deleteCoupon = asyncHandler(async (req, res) => {
  await couponService.deleteCoupon(req.params.id);

  res.status(200).json({
    success: true,
    message: COUPON_MESSAGES.DELETED,
  });
});