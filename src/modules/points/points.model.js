// ─────────────────────────────────────────────
// 🔥 POINTS MODELS
// Three collections:
//  1. PointsWallet   — one per user, holds balance
//  2. PointsTransaction — every credit/debit ledger entry
//  3. PointsConfig   — single admin-controlled config doc
// ─────────────────────────────────────────────
import mongoose from 'mongoose';
import {
  POINTS_TRANSACTION_TYPE,
  DEFAULT_POINTS_CONFIG,
} from './points.constants.js';

// ─────────────────────────────────────────────
// 1. POINTS WALLET
// ─────────────────────────────────────────────
const pointsWalletSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true,
      index:    true,
    },

    balance: {
      type:    Number,
      default: 0,
      min:     0,
    },

    totalEarned: {
      type:    Number,
      default: 0,
      min:     0,
    },

    totalRedeemed: {
      type:    Number,
      default: 0,
      min:     0,
    },

    // referral code this user owns (auto-generated on wallet creation)
    referralCode: {
      type:   String,
      unique: true,
      index:  true,
    },

    // who referred this user (ObjectId of the referrer)
    referredBy: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },

    // has this user placed their first order yet?
    // (used to gate the referral_give bonus — fires only once)
    firstOrderRewarded: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const PointsWallet = mongoose.model('PointsWallet', pointsWalletSchema);

// ─────────────────────────────────────────────
// 2. POINTS TRANSACTION (ledger)
// ─────────────────────────────────────────────
const pointsTransactionSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    type: {
      type:     String,
      enum:     Object.values(POINTS_TRANSACTION_TYPE),
      required: true,
    },

    points: {
      // always positive — sign determined by type (credit/debit)
      type:     Number,
      required: true,
      min:      1,
    },

    // balance after this transaction
    balanceAfter: {
      type:    Number,
      required: true,
      min:     0,
    },

    // reference to what triggered this (order ID, admin ID, etc.)
    referenceId: {
      type:    mongoose.Schema.Types.ObjectId,
      default: null,
    },

    referenceModel: {
      type:    String,              // 'Order' | 'User' | null
      default: null,
    },

    note: {
      type:    String,
      trim:    true,
      default: '',
    },

    // admin who triggered credit/debit (null if system)
    createdBy: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },

    // expiry (future: point expiry feature)
    expiresAt: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

pointsTransactionSchema.index({ user: 1, createdAt: -1 });
pointsTransactionSchema.index({ type: 1 });
pointsTransactionSchema.index({ referenceId: 1 });

export const PointsTransaction = mongoose.model('PointsTransaction', pointsTransactionSchema);

// ─────────────────────────────────────────────
// 3. POINTS CONFIG  (singleton — only one doc)
// ─────────────────────────────────────────────
const pointsConfigSchema = new mongoose.Schema(
  {
    // purchase: points per ₹1 spent
    purchasePointsPerUnit: {
      type:    Number,
      default: DEFAULT_POINTS_CONFIG.purchasePointsPerUnit,
      min:     0,
    },

    // referral: how many points referrer earns when referee places first order
    referralGivePoints: {
      type:    Number,
      default: DEFAULT_POINTS_CONFIG.referralGivePoints,
      min:     0,
    },

    // referral: how many points new user earns when they sign up with a referral code
    referralGetPoints: {
      type:    Number,
      default: DEFAULT_POINTS_CONFIG.referralGetPoints,
      min:     0,
    },

    // invite: admin-triggered bonus points per invite action
    inviteBonusPoints: {
      type:    Number,
      default: DEFAULT_POINTS_CONFIG.inviteBonusPoints,
      min:     0,
    },

    // redemption: 1 point = how much ₹ discount
    redeemPointsPerUnit: {
      type:    Number,
      default: DEFAULT_POINTS_CONFIG.redeemPointsPerUnit,
      min:     0.01,
    },

    // max % of order total that can be offset by points
    maxRedeemPercent: {
      type:    Number,
      default: DEFAULT_POINTS_CONFIG.maxRedeemPercent,
      min:     0,
      max:     100,
    },

    // minimum points balance required to redeem
    minRedeemPoints: {
      type:    Number,
      default: DEFAULT_POINTS_CONFIG.minRedeemPoints,
      min:     0,
    },

    // 0 = never expire
    pointsExpiryDays: {
      type:    Number,
      default: DEFAULT_POINTS_CONFIG.pointsExpiryDays,
      min:     0,
    },

    updatedBy: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const PointsConfig = mongoose.model('PointsConfig', pointsConfigSchema);