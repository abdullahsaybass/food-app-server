// ─────────────────────────────────────────────
// 🔥 POINTS CONSTANTS
// ─────────────────────────────────────────────

// Transaction types — every credit/debit to a user's wallet
export const POINTS_TRANSACTION_TYPE = {
  // ── Earning ──────────────────────────────────
  PURCHASE:       'purchase',        // points earned when an order is delivered
  REFERRAL_GIVE:  'referral_give',   // referrer earns points when referee places first order
  REFERRAL_GET:   'referral_get',    // new user earns points for using a referral code
  INVITE_BONUS:   'invite_bonus',    // admin manually awards invite bonus
  ADMIN_CREDIT:   'admin_credit',    // admin manually credits points

  // ── Spending ─────────────────────────────────
  REDEEM:         'redeem',          // user redeems points against an order
  ADMIN_DEBIT:    'admin_debit',     // admin manually deducts points
  EXPIRED:        'expired',         // points expired (future use)
};

// Which transaction types are credits (+) vs debits (-)
export const CREDIT_TYPES = new Set([
  POINTS_TRANSACTION_TYPE.PURCHASE,
  POINTS_TRANSACTION_TYPE.REFERRAL_GIVE,
  POINTS_TRANSACTION_TYPE.REFERRAL_GET,
  POINTS_TRANSACTION_TYPE.INVITE_BONUS,
  POINTS_TRANSACTION_TYPE.ADMIN_CREDIT,
]);

export const DEBIT_TYPES = new Set([
  POINTS_TRANSACTION_TYPE.REDEEM,
  POINTS_TRANSACTION_TYPE.ADMIN_DEBIT,
  POINTS_TRANSACTION_TYPE.EXPIRED,
]);

// ── Default config (overridden by PointsConfig in DB) ──────────────────────────
export const DEFAULT_POINTS_CONFIG = {
  purchasePointsPerUnit:  1,      // 1 point per ₹1 spent
  referralGivePoints:     100,    // referrer earns 100 pts when referee's 1st order is placed
  referralGetPoints:      50,     // new user earns 50 pts for using a referral code at signup
  inviteBonusPoints:      200,    // admin-triggered invite bonus
  redeemPointsPerUnit:    1,      // 1 point = ₹1 discount
  maxRedeemPercent:       20,     // user can redeem at most 20% of order total in points
  minRedeemPoints:        50,     // minimum points needed to redeem
  pointsExpiryDays:       365,    // points expire after 365 days (0 = never)
};

export const POINTS_MESSAGES = {
  CREDITED:           'Points credited successfully.',
  DEBITED:            'Points debited successfully.',
  REDEEMED:           'Points redeemed successfully.',
  INSUFFICIENT:       'Insufficient points balance.',
  MIN_REDEEM:         'You need at least {min} points to redeem.',
  MAX_REDEEM_EXCEED:  'You can redeem at most {max}% of the order total.',
  HISTORY_FETCHED:    'Points history fetched successfully.',
  BALANCE_FETCHED:    'Points balance fetched successfully.',
  CONFIG_UPDATED:     'Points configuration updated successfully.',
  CONFIG_FETCHED:     'Points configuration fetched successfully.',
  NOT_FOUND:          'Points wallet not found.',
  ALREADY_REWARDED:   'Purchase points already awarded for this order.',
};