// ─────────────────────────────────────────────
// 🔥 POINTS SERVICE
// ─────────────────────────────────────────────
import * as repo from './points.repository.js';
import {
  POINTS_TRANSACTION_TYPE,
  POINTS_MESSAGES,
} from './points.constants.js';
import { BadRequestError, NotFoundError } from '../../utils/apiError.js';
import { buildPaginationMeta } from '../../utils/pagination.js';

// ──────────────────────────────────────────────
// INTERNAL HELPER — credit points atomically
// ──────────────────────────────────────────────
const _credit = async ({ userId, type, points, referenceId, referenceModel, note, createdBy, config }) => {
  const wallet = await repo.getOrCreateWallet(userId);

  const expiresAt = config?.pointsExpiryDays > 0
    ? new Date(Date.now() + config.pointsExpiryDays * 86400 * 1000)
    : null;

  const updated = await repo.incrementBalance(userId, points);
  if (!updated) throw new BadRequestError('Failed to credit points — wallet not found.');

  await repo.createTransaction({
    user:           userId,
    type,
    points,
    balanceAfter:   updated.balance,
    referenceId:    referenceId ?? null,
    referenceModel: referenceModel ?? null,
    note:           note ?? '',
    createdBy:      createdBy ?? null,
    expiresAt,
  });

  return updated;
};

// ──────────────────────────────────────────────
// INTERNAL HELPER — debit points atomically
// ──────────────────────────────────────────────
const _debit = async ({ userId, type, points, referenceId, referenceModel, note, createdBy }) => {
  const wallet = await repo.findWalletByUser(userId);
  if (!wallet || wallet.balance < points)
    throw new BadRequestError(POINTS_MESSAGES.INSUFFICIENT);

  const updated = await repo.incrementBalance(userId, -points);
  if (!updated) throw new BadRequestError(POINTS_MESSAGES.INSUFFICIENT);

  await repo.createTransaction({
    user:           userId,
    type,
    points,
    balanceAfter:   updated.balance,
    referenceId:    referenceId ?? null,
    referenceModel: referenceModel ?? null,
    note:           note ?? '',
    createdBy:      createdBy ?? null,
  });

  return updated;
};

// ──────────────────────────────────────────────
// 1. PURCHASE POINTS — call after order is delivered
// ──────────────────────────────────────────────
export const awardPurchasePoints = async (userId, orderId, orderTotal) => {
  // idempotent — don't double-award
  const already = await repo.findPurchaseTransaction(userId, orderId);
  if (already) return null;

  const config    = await repo.getConfig();
  const points    = Math.floor(orderTotal * config.purchasePointsPerUnit);
  if (points <= 0) return null;

  return _credit({
    userId,
    type:           POINTS_TRANSACTION_TYPE.PURCHASE,
    points,
    referenceId:    orderId,
    referenceModel: 'Order',
    note:           `Earned for order #${orderId}`,
    config,
  });
};

// ──────────────────────────────────────────────
// 2. REFERRAL POINTS — call after referee places first order
// ──────────────────────────────────────────────
export const awardReferralPoints = async (refereeUserId, orderId) => {
  const refereeWallet = await repo.findWalletByUser(refereeUserId);
  if (!refereeWallet || refereeWallet.firstOrderRewarded) return;

  const config = await repo.getConfig();

  // Mark first order rewarded first (prevent race)
  await repo.markFirstOrderRewarded(refereeUserId);

  // Give referee their sign-up bonus
  if (config.referralGetPoints > 0) {
    await _credit({
      userId:         refereeUserId,
      type:           POINTS_TRANSACTION_TYPE.REFERRAL_GET,
      points:         config.referralGetPoints,
      referenceId:    orderId,
      referenceModel: 'Order',
      note:           'Referral sign-up bonus',
      config,
    });
  }

  // Give referrer their reward
  if (refereeWallet.referredBy && config.referralGivePoints > 0) {
    await _credit({
      userId:         refereeWallet.referredBy,
      type:           POINTS_TRANSACTION_TYPE.REFERRAL_GIVE,
      points:         config.referralGivePoints,
      referenceId:    refereeUserId,
      referenceModel: 'User',
      note:           `Referral reward — your referee placed their first order`,
      config,
    });
  }
};

// ──────────────────────────────────────────────
// 3. INVITE BONUS — admin triggers per user
// ──────────────────────────────────────────────
export const awardInviteBonus = async (userId, adminId, customPoints, note) => {
  const config = await repo.getConfig();
  const points = customPoints ?? config.inviteBonusPoints;

  if (points <= 0) throw new BadRequestError('Invite bonus points must be greater than 0.');

  return _credit({
    userId,
    type:      POINTS_TRANSACTION_TYPE.INVITE_BONUS,
    points,
    note:      note ?? 'Invite bonus awarded by admin',
    createdBy: adminId,
    config,
  });
};

// ──────────────────────────────────────────────
// 4. ADMIN MANUAL CREDIT
// ──────────────────────────────────────────────
export const adminCreditPoints = async (userId, points, note, adminId) => {
  if (!points || points <= 0) throw new BadRequestError('Points must be a positive number.');
  const config = await repo.getConfig();

  return _credit({
    userId,
    type:      POINTS_TRANSACTION_TYPE.ADMIN_CREDIT,
    points,
    note:      note ?? 'Admin credit',
    createdBy: adminId,
    config,
  });
};

// ──────────────────────────────────────────────
// 5. ADMIN MANUAL DEBIT
// ──────────────────────────────────────────────
export const adminDebitPoints = async (userId, points, note, adminId) => {
  if (!points || points <= 0) throw new BadRequestError('Points must be a positive number.');

  return _debit({
    userId,
    type:      POINTS_TRANSACTION_TYPE.ADMIN_DEBIT,
    points,
    note:      note ?? 'Admin debit',
    createdBy: adminId,
  });
};

// ──────────────────────────────────────────────
// 6. VALIDATE REDEEM (at checkout — does NOT deduct yet)
// Returns { pointsToUse, discountAmount }
// ──────────────────────────────────────────────
export const validateRedeem = async (userId, orderTotal, requestedPoints) => {
  const config = await repo.getConfig();
  const wallet = await repo.findWalletByUser(userId);

  if (!wallet || wallet.balance < config.minRedeemPoints)
    throw new BadRequestError(
      POINTS_MESSAGES.MIN_REDEEM.replace('{min}', config.minRedeemPoints)
    );

  const maxFromOrder  = Math.floor((orderTotal * config.maxRedeemPercent) / 100);
  const maxUsable     = Math.min(wallet.balance, maxFromOrder);
  const pointsToUse   = Math.min(requestedPoints ?? maxUsable, maxUsable);

  if (pointsToUse <= 0)
    throw new BadRequestError(
      POINTS_MESSAGES.MAX_REDEEM_EXCEED.replace('{max}', config.maxRedeemPercent)
    );

  const discountAmount = Math.round(pointsToUse * config.redeemPointsPerUnit * 100) / 100;

  return { pointsToUse, discountAmount, config };
};

// ──────────────────────────────────────────────
// 7. APPLY REDEEM (after order is confirmed)
// ──────────────────────────────────────────────
export const applyRedeem = async (userId, orderId, pointsToUse) => {
  return _debit({
    userId,
    type:           POINTS_TRANSACTION_TYPE.REDEEM,
    points:         pointsToUse,
    referenceId:    orderId,
    referenceModel: 'Order',
    note:           `Redeemed against order #${orderId}`,
  });
};

// ──────────────────────────────────────────────
// 8. APPLY REFERRAL CODE at signup
// ──────────────────────────────────────────────
export const applyReferralCodeAtSignup = async (newUserId, referralCode) => {
  if (!referralCode) return;

  const referrerWallet = await repo.findWalletByReferralCode(referralCode);
  if (!referrerWallet) return; // silently ignore invalid codes

  // Don't let user refer themselves
  if (referrerWallet.user.toString() === newUserId.toString()) return;

  await repo.setReferredBy(newUserId, referrerWallet.user);
};

// ──────────────────────────────────────────────
// 9. GET WALLET (public — for user profile)
// ──────────────────────────────────────────────
export const getWallet = async (userId) => {
  return repo.getOrCreateWallet(userId);
};

// ──────────────────────────────────────────────
// 10. GET TRANSACTION HISTORY
// ──────────────────────────────────────────────
export const getHistory = async (userId, query = {}) => {
  const page  = Math.max(1, parseInt(query.page,  10) || 1);
  const limit = Math.min(50, parseInt(query.limit, 10) || 20);
  const type  = query.type || undefined;

  const { transactions, total } = await repo.findTransactionsByUser({
    userId, page, limit, type,
  });

  return {
    transactions,
    pagination: buildPaginationMeta({ total, page, limit }),
  };
};

// ──────────────────────────────────────────────
// 11. GET CONFIG
// ──────────────────────────────────────────────
export const getConfig = async () => repo.getConfig();

// ──────────────────────────────────────────────
// 12. UPDATE CONFIG (admin only)
// ──────────────────────────────────────────────
export const updateConfig = async (data, adminId) => {
  return repo.updateConfig(data, adminId);
};