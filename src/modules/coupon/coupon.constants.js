// ─────────────────────────────────────────────
// 🔥 COUPON CONSTANTS
// ─────────────────────────────────────────────

export const COUPON_DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',  // e.g. 10%
  FLAT:       'flat',        // e.g. ₹50 off
  FREE_SHIP:  'free_shipping',
};

export const COUPON_MESSAGES = {
  CREATED:       'Coupon created successfully.',
  UPDATED:       'Coupon updated successfully.',
  DELETED:       'Coupon deleted successfully.',
  FETCHED:       'Coupon fetched successfully.',
  LIST_FETCHED:  'Coupons fetched successfully.',
  NOT_FOUND:     'Coupon not found.',
  ALREADY_EXISTS:'A coupon with this code already exists.',
  EXPIRED:       'This coupon has expired.',
  NOT_STARTED:   'This coupon is not yet active.',
  INACTIVE:      'This coupon is inactive.',
  LIMIT_REACHED: 'This coupon has reached its usage limit.',
  USER_LIMIT:    'You have already used this coupon the maximum number of times.',
  MIN_ORDER:     'Order total does not meet the minimum order value for this coupon.',
  UNAUTHORIZED:  'You are not authorized to perform this action.',
  VALID:         'Coupon is valid.',
};

export const DEFAULT_PAGE  = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT     = 100;