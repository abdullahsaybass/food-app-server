// ─────────────────────────────────────────────
// 🔥 POINTS REPOSITORY
// ─────────────────────────────────────────────
import mongoose from 'mongoose';
import { PointsWallet, PointsTransaction, PointsConfig } from './points.model.js';
import { DEFAULT_POINTS_CONFIG } from './points.constants.js';

// ──────────────────────────────────────────────
// WALLET
// ──────────────────────────────────────────────

// Get or create wallet for a user
export const getOrCreateWallet = async (userId) => {
  let wallet = await PointsWallet.findOne({ user: userId });
  if (!wallet) {
    const code = await generateUniqueReferralCode(userId);
    wallet = await PointsWallet.create({ user: userId, referralCode: code });
  }
  return wallet;
};

export const findWalletByUser = (userId) =>
  PointsWallet.findOne({ user: userId });

export const findWalletByReferralCode = (code) =>
  PointsWallet.findOne({ referralCode: code.toUpperCase() });

// Atomic balance update — prevents negative balance
export const incrementBalance = (userId, delta) =>
  PointsWallet.findOneAndUpdate(
    { user: userId, balance: { $gte: delta < 0 ? Math.abs(delta) : 0 } },
    {
      $inc: {
        balance:       delta,
        totalEarned:   delta > 0 ? delta : 0,
        totalRedeemed: delta < 0 ? Math.abs(delta) : 0,
      },
    },
    { new: true, upsert: false }
  );

export const markFirstOrderRewarded = (userId) =>
  PointsWallet.findOneAndUpdate(
    { user: userId },
    { $set: { firstOrderRewarded: true } },
    { new: true }
  );

export const setReferredBy = (userId, referrerId) =>
  PointsWallet.findOneAndUpdate(
    { user: userId, referredBy: null },
    { $set: { referredBy: referrerId } },
    { new: true }
  );

// ──────────────────────────────────────────────
// TRANSACTION
// ──────────────────────────────────────────────

export const createTransaction = (data) => PointsTransaction.create(data);

export const findTransactionsByUser = async ({ userId, page = 1, limit = 20, type }) => {
  const filter = { user: userId };
  if (type) filter.type = type;

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    PointsTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PointsTransaction.countDocuments(filter),
  ]);

  return { transactions, total };
};

// check if purchase points already awarded for an order
export const findPurchaseTransaction = (userId, orderId) =>
  PointsTransaction.findOne({
    user:           userId,
    type:           'purchase',
    referenceId:    orderId,
    referenceModel: 'Order',
  });

// ──────────────────────────────────────────────
// CONFIG  (singleton)
// ──────────────────────────────────────────────

export const getConfig = async () => {
  let config = await PointsConfig.findOne();
  if (!config) config = await PointsConfig.create({});
  return config;
};

export const updateConfig = (data, adminId) =>
  PointsConfig.findOneAndUpdate(
    {},
    { $set: { ...data, updatedBy: adminId } },
    { new: true, upsert: true }
  );

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

// Generate a unique 8-char uppercase referral code
async function generateUniqueReferralCode(userId) {
  const base  = userId.toString().slice(-4).toUpperCase();
  const rand  = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  let   code  = `${base}${rand()}`;
  let   tries = 0;

  while (await PointsWallet.exists({ referralCode: code })) {
    code = `${base}${rand()}`;
    if (++tries > 10) code = `REF${Date.now().toString(36).toUpperCase()}`;
  }

  return code;
}