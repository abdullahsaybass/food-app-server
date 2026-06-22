// ─────────────────────────────────────────────
// 🔥 COUPON MODEL
// ─────────────────────────────────────────────
import mongoose from 'mongoose';
import { COUPON_DISCOUNT_TYPES } from './coupon.constants.js';

const couponSchema = new mongoose.Schema(
  {
    // ───────── Identity ─────────
    code: {
      type:      String,
      required:  true,
      unique:    true,
      uppercase: true,
      trim:      true,
      index:     true,
    },

    description: {
      type:    String,
      trim:    true,
      default: '',
    },

    // ───────── Discount ─────────
    discountType: {
      type:     String,
      enum:     Object.values(COUPON_DISCOUNT_TYPES),
      required: true,
    },

    discountValue: {
      // percentage: 1-100 | flat: amount | free_shipping: 0
      type:    Number,
      default: 0,
      min:     0,
    },

    maxDiscount: {
      // cap for percentage discounts (e.g. max ₹200 off)
      type:    Number,
      default: 0,
      min:     0,
    },

    // ───────── Eligibility ─────────
    minOrderValue: {
      type:    Number,
      default: 0,
      min:     0,
    },

    // null = applies to all products, array = specific product IDs
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'Product',
      },
    ],

    // null = applies to all categories, array = specific category slugs
    applicableCategories: [
      {
        type: String,
        trim: true,
      },
    ],

    // ───────── Usage Limits ─────────
    usageLimit: {
      // total uses across all users (0 = unlimited)
      type:    Number,
      default: 0,
      min:     0,
    },

    usageLimitPerUser: {
      // max uses per single user (0 = unlimited)
      type:    Number,
      default: 1,
      min:     0,
    },

    usedCount: {
      type:    Number,
      default: 0,
      min:     0,
    },

    // track per-user usage: [{ user: ObjectId, count: Number }]
    userUsage: [
      {
        user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        count: { type: Number, default: 1 },
        _id:   false,
      },
    ],

    // ───────── Scheduling ─────────
    startDate: {
      type:    Date,
      default: null,
    },

    endDate: {
      type:    Date,
      default: null,
    },

    // ───────── Status ─────────
    isActive: {
      type:    Boolean,
      default: true,
      index:   true,
    },

    isDeleted: {
      type:    Boolean,
      default: false,
      index:   true,
    },

    // ───────── Audit ─────────
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─────────────────────────────────────────────
// 🔥 VIRTUAL — isExpired
// ─────────────────────────────────────────────
couponSchema.virtual('isExpired').get(function () {
  return this.endDate ? new Date() > this.endDate : false;
});

// ─────────────────────────────────────────────
// 🔥 VIRTUAL — isLimitReached
// ─────────────────────────────────────────────
couponSchema.virtual('isLimitReached').get(function () {
  return this.usageLimit > 0 && this.usedCount >= this.usageLimit;
});

couponSchema.set('toJSON',   { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

// ─────────────────────────────────────────────
// 🔥 INDEXES
// ─────────────────────────────────────────────
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, endDate: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;