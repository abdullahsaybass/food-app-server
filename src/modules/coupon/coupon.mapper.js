// ─────────────────────────────────────────────
// 🔥 COUPON MAPPER
// ─────────────────────────────────────────────

export const toCouponDTO = (coupon) => {
  if (!coupon) return null;

  const c = coupon.toObject ? coupon.toObject() : coupon;

  return {
    id:   c._id,

    // ───────── Identity ─────────
    code:        c.code,
    description: c.description ?? '',

    // ───────── Discount ─────────
    discountType:      c.discountType,
    discountValue:     c.discountValue     ?? 0,
    maxDiscount: c.maxDiscount ?? 0,

    // ───────── Eligibility ─────────
    minOrderValue:        c.minOrderValue        ?? 0,
    applicableProducts:   c.applicableProducts   ?? [],
    applicableCategories: c.applicableCategories ?? [],

    // ───────── Usage ─────────
    usageLimit:        c.usageLimit        ?? 0,
    usageLimitPerUser: c.usageLimitPerUser ?? 1,
    usedCount:         c.usedCount         ?? 0,

    // ───────── Scheduling ─────────
    startDate: c.startDate ?? null,
    endDate:   c.endDate   ?? null,

    // ───────── Status (including virtuals) ─────────
    isActive:       c.isActive,
    isDeleted:      c.isDeleted,
    isExpired:      c.isExpired      ?? false,
    isLimitReached: c.isLimitReached ?? false,

    // ───────── Audit ─────────
    createdBy: c.createdBy,
    updatedBy: c.updatedBy ?? null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
};

export const toCouponListDTO = (coupons, pagination) => ({
  coupons: coupons.map(toCouponDTO),
  pagination,
});

// Lightweight DTO returned after a successful /apply call
export const toCouponApplyDTO = (coupon, discountAmount) => ({
  code:         coupon.code,
  discountType: coupon.discountType,
  discountValue: coupon.discountValue,
  discountAmount,           // actual ₹ saved
  message:      `Coupon applied! You save MVR ${discountAmount.toFixed(2)}.`,
});