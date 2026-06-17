// modules/category/category.model.js
import mongoose from "mongoose";
import slugify from "slugify";

// ─────────────────────────────────────────────
// 🔥 CATEGORY SCHEMA
// Image + Banner are both OPTIONAL — a category
// can exist with neither, either, or both.
// ─────────────────────────────────────────────
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    // Auto-generated slug-like identifier from `name` (e.g. "Dal" → "dal").
    // NOT validated against any fixed enum — categories are fully dynamic
    // and admin-created, so `key` can be any unique lowercase slug.
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Category tile / icon image — NOT mandatory ──────────────────────────
    image: {
      url:      { type: String, default: null },
      publicId: { type: String, default: null },
      altText:  { type: String, default: "" },
    },

    // ── Category banner (shown on category screen header) — NOT mandatory ──
    banner: {
      url:      { type: String, default: null },
      publicId: { type: String, default: null },
      altText:  { type: String, default: "" },
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Auto-generate slug ─────────────────────────────────────────────────────
categorySchema.pre("validate", function () {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  if (!this.key) {
    this.key = slugify(this.name, { lower: true, strict: true }).replace(/-/g, "_");
  }
});

categorySchema.index({ isActive: 1, isDeleted: 1, sortOrder: 1 });

const Category = mongoose.model("Category", categorySchema);
export default Category;