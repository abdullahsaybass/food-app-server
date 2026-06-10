// ─────────────────────────────────────────────
// 🔥 POINTS MAPPER
// ─────────────────────────────────────────────
import { CREDIT_TYPES } from './points.constants.js';

export const toWalletDTO = (wallet) => {
  if (!wallet) return null;
  const w = wallet.toObject ? wallet.toObject() : wallet;
  return {
    id:                 w._id,
    user:               w.user,
    balance:            w.balance       ?? 0,
    totalEarned:        w.totalEarned   ?? 0,
    totalRedeemed:      w.totalRedeemed ?? 0,
    referralCode:       w.referralCode,
    referredBy:         w.referredBy    ?? null,
    firstOrderRewarded: w.firstOrderRewarded,
    createdAt:          w.createdAt,
    updatedAt:          w.updatedAt,
  };
};

export const toTransactionDTO = (tx) => {
  if (!tx) return null;
  const t = tx.toObject ? tx.toObject() : tx;
  return {
    id:             t._id,
    user:           t.user,
    type:           t.type,
    direction:      CREDIT_TYPES.has(t.type) ? 'credit' : 'debit',
    points:         t.points,
    balanceAfter:   t.balanceAfter,
    referenceId:    t.referenceId    ?? null,
    referenceModel: t.referenceModel ?? null,
    note:           t.note           ?? '',
    createdBy:      t.createdBy      ?? null,
    expiresAt:      t.expiresAt      ?? null,
    createdAt:      t.createdAt,
  };
};

export const toConfigDTO = (config) => {
  if (!config) return null;
  const c = config.toObject ? config.toObject() : config;
  return {
    id:                    c._id,
    purchasePointsPerUnit: c.purchasePointsPerUnit,
    referralGivePoints:    c.referralGivePoints,
    referralGetPoints:     c.referralGetPoints,
    inviteBonusPoints:     c.inviteBonusPoints,
    redeemPointsPerUnit:   c.redeemPointsPerUnit,
    maxRedeemPercent:      c.maxRedeemPercent,
    minRedeemPoints:       c.minRedeemPoints,
    pointsExpiryDays:      c.pointsExpiryDays,
    updatedBy:             c.updatedBy ?? null,
    updatedAt:             c.updatedAt,
  };
};