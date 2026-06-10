import Joi from "joi";

import {
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
} from "./product.constants.js";

import { ValidationError }
  from "../../utils/apiError.js";

// ─────────────────────────────────────────────
// 🔥 IMAGE SCHEMA
// ─────────────────────────────────────────────
const imageSchema = Joi.object({
  url: Joi.string()
    .uri()
    .required(),

  publicId: Joi.string()
    .allow("")
    .optional(),

  altText: Joi.string()
    .allow("")
    .optional(),
});

// ─────────────────────────────────────────────
// 🔥 VARIANT SCHEMA
// ─────────────────────────────────────────────
const variantSchema = Joi.object({
  unit: Joi.string()
    .valid(
      ...Object.values(
        PRODUCT_UNITS
      )
    )
    .required(),

  price: Joi.number()
    .min(0)
    .required(),

  quantity: Joi.number()
    .integer()
    .min(0)
    .required(),

  weight: Joi.number()
    .min(0)
    .default(0),

  weightUnit: Joi.string()
    .valid(
      "kg",
      "g",
      "ml",
      "L"
    )
    .default("kg"),

  piecesCount: Joi.number()
    .integer()
    .min(0)
    .default(0),

  packetQuantity: Joi.number()
    .integer()
    .min(0)
    .default(0),

  caseQuantity: Joi.number()
    .integer()
    .min(0)
    .default(0),

  manufactureDate: Joi.date()
    .allow(null)
    .optional(),

  expiryDate: Joi.date()
    .allow(null)
    .optional(),

  sku: Joi.string()
    .trim()
    .uppercase()
    .min(3)
    .max(100)
    .optional(),

  minOrderQuantity:
    Joi.number()
      .integer()
      .min(1)
      .default(1),

  bulkPrice: Joi.number()
    .min(0)
    .default(0),

  stockThreshold:
    Joi.number()
      .integer()
      .min(0)
      .default(10),
});

// ─────────────────────────────────────────────
// 🔥 CREATE PRODUCT
// ─────────────────────────────────────────────
const createProductSchema =
  Joi.object({

    // ───────── Basic Info ─────────
    name: Joi.string()
      .trim()
      .min(2)
      .max(150)
      .required(),

    shortDescription:
      Joi.string()
        .trim()
        .max(300)
        .allow("")
        .optional(),

    description:
      Joi.string()
        .trim()
        .max(3000)
        .allow("")
        .optional(),

    category: Joi.string()
      .valid(
        ...Object.values(
          PRODUCT_CATEGORIES
        )
      )
      .required(),

    brand: Joi.string()
      .trim()
      .max(100)
      .allow("")
      .optional(),

    quality: Joi.string()
      .trim()
      .max(100)
      .allow("")
      .optional(),

    countryOrigin:
      Joi.string()
        .trim()
        .max(100)
        .allow("")
        .optional(),

    storageInstruction:
      Joi.string()
        .trim()
        .max(500)
        .allow("")
        .optional(),

    usageInstruction:
      Joi.string()
        .trim()
        .max(500)
        .allow("")
        .optional(),

    tags: Joi.array()
      .items(
        Joi.string()
          .trim()
          .lowercase()
      )
      .optional(),

    // ───────── Variants ─────────
    variants: Joi.array()
      .items(
        variantSchema
      )
      .min(1)
      .required(),

    // ───────── Images ─────────
    images: Joi.array()
      .items(imageSchema)
      .max(10)
      .optional(),

    // ───────── Product Status ─────────
    featured:
      Joi.boolean()
        .optional(),

    bestSeller:
      Joi.boolean()
        .optional(),

    newArrival:
      Joi.boolean()
        .optional(),

    halal:
      Joi.boolean()
        .optional(),

    frozen:
      Joi.boolean()
        .optional(),

    fresh:
      Joi.boolean()
        .optional(),

    isActive:
      Joi.boolean()
        .optional(),

    // ───────── Discount ─────────
    discountPercentage:
      Joi.number()
        .min(0)
        .max(100)
        .default(0),

    // ───────── Supplier ─────────
    supplier:
      Joi.string()
        .hex()
        .length(24)
        .optional(),
  });

// ─────────────────────────────────────────────
// 🔥 UPDATE PRODUCT
// ─────────────────────────────────────────────
const updateProductSchema =
  Joi.object({

    name: Joi.string()
      .trim()
      .min(2)
      .max(150)
      .optional(),

    shortDescription:
      Joi.string()
        .trim()
        .max(300)
        .allow("")
        .optional(),

    description:
      Joi.string()
        .trim()
        .max(3000)
        .allow("")
        .optional(),

    category: Joi.string()
      .valid(
        ...Object.values(
          PRODUCT_CATEGORIES
        )
      )
      .optional(),

    brand: Joi.string()
      .trim()
      .max(100)
      .allow("")
      .optional(),

    quality: Joi.string()
      .trim()
      .max(100)
      .allow("")
      .optional(),

    countryOrigin:
      Joi.string()
        .trim()
        .max(100)
        .allow("")
        .optional(),

    storageInstruction:
      Joi.string()
        .trim()
        .max(500)
        .allow("")
        .optional(),

    usageInstruction:
      Joi.string()
        .trim()
        .max(500)
        .allow("")
        .optional(),

    tags: Joi.array()
      .items(
        Joi.string()
          .trim()
          .lowercase()
      )
      .optional(),

    variants: Joi.array()
      .items(
        variantSchema
      )
      .min(1)
      .optional(),

    images: Joi.array()
      .items(imageSchema)
      .max(10)
      .optional(),

    featured:
      Joi.boolean()
        .optional(),

    bestSeller:
      Joi.boolean()
        .optional(),

    newArrival:
      Joi.boolean()
        .optional(),

    halal:
      Joi.boolean()
        .optional(),

    frozen:
      Joi.boolean()
        .optional(),

    fresh:
      Joi.boolean()
        .optional(),

    isActive:
      Joi.boolean()
        .optional(),

    discountPercentage:
      Joi.number()
        .min(0)
        .max(100)
        .optional(),

    supplier:
      Joi.string()
        .hex()
        .length(24)
        .optional(),
  }).min(1);

// ─────────────────────────────────────────────
// 🔥 LIST PRODUCTS
// ─────────────────────────────────────────────
const listProductsSchema =
  Joi.object({

    page: Joi.number()
      .integer()
      .min(1)
      .default(1),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10),

    category: Joi.string()
      .valid(
        ...Object.values(
          PRODUCT_CATEGORIES
        )
      )
      .optional(),

    featured:
      Joi.boolean()
        .optional(),

    bestSeller:
      Joi.boolean()
        .optional(),

    newArrival:
      Joi.boolean()
        .optional(),

    halal:
      Joi.boolean()
        .optional(),

    frozen:
      Joi.boolean()
        .optional(),

    fresh:
      Joi.boolean()
        .optional(),

    isActive:
      Joi.boolean()
        .optional(),

    inStock:
      Joi.boolean()
        .optional(),

    lowStock:
      Joi.boolean()
        .optional(),

    search: Joi.string()
      .trim()
      .optional(),

    sortBy: Joi.string()
      .valid(
        "name",
        "category",
        "createdAt",
        "featured",
        "bestSeller",
        "newArrival",
        "rating",
        "totalSold",
        "isActive"
      )
      .default(
        "createdAt"
      ),

    sortOrder:
      Joi.string()
        .valid(
          "asc",
          "desc"
        )
        .default("desc"),
  });

// ─────────────────────────────────────────────
// 🔥 VALIDATION MIDDLEWARE
// ─────────────────────────────────────────────
const validate =
  (schema) =>
  (req, res, next) => {

    const target =
      req.method === "GET"
        ? req.query
        : req.body;

    const {
      error,
      value,
    } = schema.validate(
      target,
      {
        abortEarly: false,

        stripUnknown: true,
      }
    );

    if (error) {

      const messages =
        error.details.map(
          (d) => d.message
        );

      return next(
        new ValidationError(
          messages
        )
      );
    }

    if (
      req.method === "GET"
    ) {

      Object.assign(
        req.query,
        value
      );

    } else {

      req.body = value;

    }

    next();
  };

// ─────────────────────────────────────────────
// 🔥 EXPORTS
// ─────────────────────────────────────────────
export const validateGetCategories =
  (req, res, next) =>
    next();

export const validateCreateProduct =
  validate(
    createProductSchema
  );

export const validateUpdateProduct =
  validate(
    updateProductSchema
  );

export const validateListProducts =
  validate(
    listProductsSchema
  );