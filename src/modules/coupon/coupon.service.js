// ─────────────────────────────────────────────
// 🔥 COUPON SERVICE
// ─────────────────────────────────────────────
import * as repo from './coupon.repository.js';
import {
  COUPON_MESSAGES,
  COUPON_DISCOUNT_TYPES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
} from './coupon.constants.js';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../../utils/apiError.js';
// ✅ fix
import { buildPaginationMeta } from '../../utils/pagination.js';

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────
export const createCoupon = async (data, userId) => {
  // Check duplicate code
  const existing = await repo.findByCode(data.code);
  if (existing) throw new ConflictError(COUPON_MESSAGES.ALREADY_EXISTS);

  return repo.create({ ...data, createdBy: userId });
};

// ─────────────────────────────────────────────
// GET ONE
// ─────────────────────────────────────────────
export const getCouponById = async (id) => {
  const coupon = await repo.findById(id);
  if (!coupon) throw new NotFoundError('Coupon');
  return coupon;
};

// ─────────────────────────────────────────────
// GET ALL  (admin — paginated)
// ─────────────────────────────────────────────
export const getAllCoupons = async (query = {}) => {
  const {
    page      = DEFAULT_PAGE,
    limit     = DEFAULT_LIMIT,
    isActive,
    sortBy    = 'createdAt',
    sortOrder = 'desc',
    search,
  } = query;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive;
  if (search)                  filter.code = { $regex: search.toUpperCase(), $options: 'i' };

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (page - 1) * limit;

  const { coupons, total } = await repo.findAll({ filter, sort, skip, limit });

  return {
    coupons,
    pagination: buildPaginationMeta({ page, limit, total }),
  };
};

// ─────────────────────────────────────────────
// VALIDATE & APPLY  (called at checkout)
// Returns: { coupon, discountAmount }
// ─────────────────────────────────────────────
export const applyCoupon = async (code, orderTotal, userId) => {
  const coupon = await repo.findByCode(code);

  // — existence
  if (!coupon) throw new NotFoundError('Coupon');

  // — active
  if (!coupon.isActive) throw new BadRequestError(COUPON_MESSAGES.INACTIVE);

  // — schedule
  const now = new Date();
  if (coupon.startDate && now < coupon.startDate)
    throw new BadRequestError(COUPON_MESSAGES.NOT_STARTED);
  if (coupon.endDate && now > coupon.endDate)
    throw new BadRequestError(COUPON_MESSAGES.EXPIRED);

  // — total usage limit
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)
    throw new BadRequestError(COUPON_MESSAGES.LIMIT_REACHED);

  // — per-user limit
  if (userId && coupon.usageLimitPerUser > 0) {
    const userEntry = coupon.userUsage.find(
      (u) => u.user.toString() === userId.toString()
    );
    if (userEntry && userEntry.count >= coupon.usageLimitPerUser)
      throw new BadRequestError(COUPON_MESSAGES.USER_LIMIT);
  }

  // — minimum order value
  if (coupon.minOrderValue > 0 && orderTotal < coupon.minOrderValue)
    throw new BadRequestError(COUPON_MESSAGES.MIN_ORDER);

  // — calculate discount
  let discountAmount = 0;

  if (coupon.discountType === COUPON_DISCOUNT_TYPES.PERCENTAGE) {
    discountAmount = (orderTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else if (coupon.discountType === COUPON_DISCOUNT_TYPES.FLAT) {
    discountAmount = Math.min(coupon.discountValue, orderTotal);
  } else if (coupon.discountType === COUPON_DISCOUNT_TYPES.FREE_SHIP) {
    discountAmount = 0; // caller handles shipping waiver
  }

  discountAmount = Math.round(discountAmount * 100) / 100;

  return { coupon, discountAmount };
};

// ─────────────────────────────────────────────
// RECORD USAGE  (call after order is placed)
// ─────────────────────────────────────────────
export const recordCouponUsage = async (code, userId) => {
  const coupon = await repo.findByCode(code);
  if (!coupon) return;
  await repo.incrementUserUsage(coupon._id, userId);
};

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────
export const updateCoupon = async (id, data, userId) => {
  // If code is changing, check for duplicate
  if (data.code) {
    const existing = await repo.findByCode(data.code);
    if (existing && existing._id.toString() !== id)
      throw new ConflictError(COUPON_MESSAGES.ALREADY_EXISTS);
  }

  const coupon = await repo.updateById(id, { ...data, updatedBy: userId });
  if (!coupon) throw new NotFoundError('Coupon');
  return coupon;
};

// ─────────────────────────────────────────────
// SOFT DELETE
// ─────────────────────────────────────────────
export const softDeleteCoupon = async (id, userId) => {
  const coupon = await repo.softDeleteById(id, userId);
  if (!coupon) throw new NotFoundError('Coupon');
  return coupon;
};

// ─────────────────────────────────────────────
// HARD DELETE
// ─────────────────────────────────────────────
export const deleteCoupon = async (id) => {
  const coupon = await repo.deleteById(id);
  if (!coupon) throw new NotFoundError('Coupon');
};