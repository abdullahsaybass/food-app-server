import mongoose from "mongoose";
import slugify from "slugify";

import { PRODUCT_UNITS } from "./product.constants.js";

const variantSchema = new mongoose.Schema(
  {
    unit: {
      type: String,
      enum: Object.values(PRODUCT_UNITS),
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      set: (v) => Math.round(v * 100) / 100,
    },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    weight: { type: Number, default: 0, min: 0 },
    weightUnit: { type: String, enum: ["kg", "g", "ml", "L"], default: "kg" },
    piecesCount: { type: Number, default: 0, min: 0 },
    packetQuantity: { type: Number, default: 0, min: 0 },
    caseQuantity: { type: Number, default: 0, min: 0 },
    sku: { type: String, uppercase: true, trim: true },
    minOrderQuantity: { type: Number, default: 1, min: 1 },
    bulkPrice: { type: Number, min: 0, default: 0 },
    stockThreshold: { type: Number, default: 10, min: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, trim: true, default: "" },

    // ✅ Connected to Category collection
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    tags: [{ type: String, trim: true, lowercase: true }],
    variants: {
      type: [variantSchema],
      validate: { validator: (v) => v.length > 0, message: "At least one variant is required" },
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        altText: { type: String, default: "" },
      },
    ],

    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },

    shortDescription: { type: String, trim: true, default: "" },
    brand: { type: String, trim: true, default: "" },
    quality: { type: String, trim: true, default: "" },
    countryOrigin: { type: String, trim: true, default: "" },
    storageInstruction: { type: String, trim: true, default: "" },
    usageInstruction: { type: String, trim: true, default: "" },

    halal: { type: Boolean, default: false },
    frozen: { type: Boolean, default: false },
    fresh: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },

    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, versionKey: false }
);

productSchema.pre("validate", function () {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + "-" + Date.now();
  }
  this.variants.forEach((variant) => {
    if (!variant.sku) {
      variant.sku = `${slugify(this.name, { upper: true, strict: true })}-${variant.unit.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
  });
});

productSchema.virtual("totalStock").get(function () {
  return this.variants.reduce((total, v) => total + v.quantity, 0);
});
productSchema.virtual("lowStockVariants").get(function () {
  return this.variants.filter((v) => v.quantity <= v.stockThreshold);
});
productSchema.virtual("inStock").get(function () {
  return this.totalStock > 0;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ "variants.sku": 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;