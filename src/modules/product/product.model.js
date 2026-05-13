import mongoose from "mongoose";
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from "./product.constants.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // 🔥 SKU (auto-generated if not provided)
    sku: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // 🔥 SEO slug
    slug: {
      type: String,
      unique: true,
    },

    // 🔥 Price (safe decimals)
    price: {
      type: Number,
      required: true,
      min: 0,
      set: (v) => Math.round(v * 100) / 100,
    },

    // 🔥 Stock
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    unit: {
      type: String,
      enum: Object.values(PRODUCT_UNITS),
      required: true,
    },

    category: {
      type: String,
      enum: Object.values(PRODUCT_CATEGORIES),
      required: true,
    },

    // 🔥 Images (Cloudinary ready)
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        altText: { type: String, default: "" },
      },
    ],

    // 🔥 Stock alert
    stockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔥 Soft delete (future safe)
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // 🔥 Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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


// ─────────────────────────────────────────────
// 🔥 AUTO GENERATE SKU + SLUG
// ─────────────────────────────────────────────
productSchema.pre("validate", function () {
  // SKU
  if (!this.sku) {
    const namePart = this.name.replace(/\s+/g, "-").toUpperCase();
    const unitPart = this.unit.toUpperCase();

    this.sku = `${namePart}-${unitPart}`;
  }

  // SLUG
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }
});


// ─────────────────────────────────────────────
// 🔥 VIRTUAL FIELD
// ─────────────────────────────────────────────
productSchema.virtual("isLowStock").get(function () {
  return this.quantity <= this.stockThreshold;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });


// ─────────────────────────────────────────────
// 🔥 INDEXES (NO DUPLICATES)
// ─────────────────────────────────────────────
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ quantity: 1 });
productSchema.index({ name: "text", description: "text" });


// ─────────────────────────────────────────────
// 🔥 EXPORT
// ─────────────────────────────────────────────
const Product = mongoose.model("Product", productSchema);

export default Product;