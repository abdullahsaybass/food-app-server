import mongoose from "mongoose";
import slugify from "slugify";

import {
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
} from "./product.constants.js";

// ─────────────────────────────────────────────
// 🔥 VARIANT SCHEMA
// ─────────────────────────────────────────────
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

      set: (v) =>
        Math.round(v * 100) / 100,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
        weight: {
      type: Number,
      default: 0,
      min: 0,
    },

    weightUnit: {
      type: String,
      enum: ["kg", "g", "ml", "L"],
      default: "kg",
    },

    piecesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    packetQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    caseQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

   

    // SKU
    sku: {
      type: String,
      uppercase: true,
      trim: true,
    },

    // Wholesale
    minOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    bulkPrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    stockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

// ─────────────────────────────────────────────
// 🔥 PRODUCT SCHEMA
// ─────────────────────────────────────────────
const productSchema =
  new mongoose.Schema(
    {
      // BASIC INFO
      name: {
        type: String,
        required: true,
        trim: true,
      },

      slug: {
        type: String,
        unique: true,
        index: true,
      },

      description: {
        type: String,
        trim: true,
        default: "",
      },

      category: {
        type: String,
        enum: Object.values(
          PRODUCT_CATEGORIES
        ),
        required: true,
        index: true,
      },

      tags: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ],

      // VARIANTS
      variants: {
        type: [variantSchema],

        validate: {
          validator: (v) =>
            v.length > 0,

          message:
            "At least one variant is required",
        },
      },

      // IMAGES
      images: [
        {
          url: {
            type: String,
            required: true,
          },

          publicId: {
            type: String,
          },

          altText: {
            type: String,
            default: "",
          },
        },
      ],

      // STATUS
      featured: {
        type: Boolean,
        default: false,
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

      // DISCOUNT
      discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      
           // PRODUCT INFO
      shortDescription: {
        type: String,
        trim: true,
        default: "",
      },

      brand: {
        type: String,
        trim: true,
        default: "",
      },

      quality: {
        type: String,
        trim: true,
        default: "",
      },

      countryOrigin: {
        type: String,
        trim: true,
        default: "",
      },

      storageInstruction: {
        type: String,
        trim: true,
        default: "",
      },

      usageInstruction: {
        type: String,
        trim: true,
        default: "",
      },

      // PRODUCT FLAGS
      halal: {
        type: Boolean,
        default: false,
      },

      frozen: {
        type: Boolean,
        default: false,
      },

      fresh: {
        type: Boolean,
        default: false,
      },

      bestSeller: {
        type: Boolean,
        default: false,
      },

      newArrival: {
        type: Boolean,
        default: false,
      },

      // ANALYTICS
      rating: {
        type: Number,
        default: 0,
      },

      totalReviews: {
        type: Number,
        default: 0,
      },

      totalSold: {
        type: Number,
        default: 0,
      },

      totalViews: {
        type: Number,
        default: 0,
      },

      // AUDIT
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
// 🔥 AUTO GENERATE SLUG + SKU
// ─────────────────────────────────────────────
productSchema.pre(
  "validate",
  function () {

    // SLUG
    if (!this.slug) {

      this.slug =
        slugify(this.name, {
          lower: true,
          strict: true,
        }) +
        "-" +
        Date.now();

    }

    // VARIANT SKU
    this.variants.forEach(
      (variant) => {

        if (!variant.sku) {

          variant.sku =
            `${slugify(this.name, {
              upper: true,
              strict: true,
            })}-${variant.unit.toUpperCase()}-${Date.now()}-${Math.floor(
              Math.random() * 1000
            )}`;

        }

      }
    );

  }
);

// ─────────────────────────────────────────────
// 🔥 VIRTUALS
// ─────────────────────────────────────────────

// TOTAL STOCK
productSchema.virtual(
  "totalStock"
).get(function () {

  return this.variants.reduce(
    (total, variant) =>
      total + variant.quantity,
    0
  );

});

// LOW STOCK
productSchema.virtual(
  "lowStockVariants"
).get(function () {

  return this.variants.filter(
    (variant) =>
      variant.quantity <=
      variant.stockThreshold
  );

});

// IN STOCK
productSchema.virtual(
  "inStock"
).get(function () {

  return this.totalStock > 0;

});

productSchema.set("toJSON", {
  virtuals: true,
});

productSchema.set("toObject", {
  virtuals: true,
});

// ─────────────────────────────────────────────
// 🔥 INDEXES
// ─────────────────────────────────────────────

// SEARCH
productSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

// FILTERING
productSchema.index({
  category: 1,
  isActive: 1,
});

// FEATURED
productSchema.index({
  featured: 1,
});

// SUPPLIER
productSchema.index({
  supplier: 1,
});

// VARIANT SKU
productSchema.index({
  "variants.sku": 1,
});

// ─────────────────────────────────────────────
// 🔥 EXPORT
// ─────────────────────────────────────────────
const Product = mongoose.model(
  "Product",
  productSchema
);

export default Product;