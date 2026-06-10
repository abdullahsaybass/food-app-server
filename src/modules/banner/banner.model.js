// ─────────────────────────────────────────────
// 🔥 BANNER MODEL
// ─────────────────────────────────────────────
import mongoose from 'mongoose';
import { BANNER_POSITIONS, BANNER_TYPES } from './banner.constants.js';

const bannerSchema = new mongoose.Schema(
  {
    // ───────── Basic Info ─────────
    title: {
      type:     String,
      required: true,
      trim:     true,
    },

    subtitle: {
      type:    String,
      trim:    true,
      default: '',
    },

    description: {
      type:    String,
      trim:    true,
      default: '',
    },

    // ───────── Media ─────────
    type: {
      type:    String,
      enum:    Object.values(BANNER_TYPES),
      default: BANNER_TYPES.IMAGE,
    },

    image: {
      url:      { type: String, required: true },
      publicId: { type: String, default: '' },
      altText:  { type: String, default: '' },
    },

    // ───────── Link ─────────
    linkUrl: {
      type:    String,
      trim:    true,
      default: '',
    },

    linkText: {
      type:    String,
      trim:    true,
      default: '',
    },

    // ───────── Placement ─────────
    position: {
      type:     String,
      enum:     Object.values(BANNER_POSITIONS),
      required: true,
      index:    true,
    },

    sortOrder: {
      type:    Number,
      default: 0,
      min:     0,
    },

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
// 🔥 VIRTUAL — isLive (within schedule window)
// ─────────────────────────────────────────────
bannerSchema.virtual('isLive').get(function () {
  if (!this.isActive || this.isDeleted) return false;
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate   && now > this.endDate)   return false;
  return true;
});

bannerSchema.set('toJSON',   { virtuals: true });
bannerSchema.set('toObject', { virtuals: true });

// ─────────────────────────────────────────────
// 🔥 INDEXES
// ─────────────────────────────────────────────
bannerSchema.index({ position: 1, isActive: 1, sortOrder: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;