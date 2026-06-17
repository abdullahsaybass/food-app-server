import Joi from "joi";
import { PRODUCT_UNITS } from "./product.constants.js";
import { ValidationError } from "../../utils/apiError.js";

// ✅ Reusable ObjectId validator
const objectId = Joi.string().hex().length(24);

const imageSchema = Joi.object({
  url: Joi.string().uri().required(),
  publicId: Joi.string().allow("").optional(),
  altText: Joi.string().allow("").optional(),
});

const variantSchema = Joi.object({
  unit: Joi.string().valid(...Object.values(PRODUCT_UNITS)).required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().integer().min(0).required(),
  weight: Joi.number().min(0).default(0),
  weightUnit: Joi.string().valid("kg", "g", "ml", "L").default("kg"),
  piecesCount: Joi.number().integer().min(0).default(0),
  packetQuantity: Joi.number().integer().min(0).default(0),
  caseQuantity: Joi.number().integer().min(0).default(0),
  manufactureDate: Joi.date().allow(null).optional(),
  expiryDate: Joi.date().allow(null).optional(),
  sku: Joi.string().trim().uppercase().min(3).max(100).optional(),
  minOrderQuantity: Joi.number().integer().min(1).default(1),
  bulkPrice: Joi.number().min(0).default(0),
  stockThreshold: Joi.number().integer().min(0).default(10),
});

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  shortDescription: Joi.string().trim().max(300).allow("").optional(),
  description: Joi.string().trim().max(3000).allow("").optional(),

  // ✅ category is now a Category _id
  category: objectId.required().messages({
    "string.length": "category must be a valid Category ID",
    "string.hex": "category must be a valid Category ID",
    "any.required": "category is required",
  }),

  brand: Joi.string().trim().max(100).allow("").optional(),
  quality: Joi.string().trim().max(100).allow("").optional(),
  countryOrigin: Joi.string().trim().max(100).allow("").optional(),
  storageInstruction: Joi.string().trim().max(500).allow("").optional(),
  usageInstruction: Joi.string().trim().max(500).allow("").optional(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  variants: Joi.array().items(variantSchema).min(1).required(),
  images: Joi.array().items(imageSchema).max(10).optional(),
  featured: Joi.boolean().optional(),
  bestSeller: Joi.boolean().optional(),
  newArrival: Joi.boolean().optional(),
  halal: Joi.boolean().optional(),
  frozen: Joi.boolean().optional(),
  fresh: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  discountPercentage: Joi.number().min(0).max(100).default(0),
  supplier: objectId.optional(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).optional(),
  shortDescription: Joi.string().trim().max(300).allow("").optional(),
  description: Joi.string().trim().max(3000).allow("").optional(),

  // ✅ category is now a Category _id
  category: objectId.optional().messages({
    "string.length": "category must be a valid Category ID",
    "string.hex": "category must be a valid Category ID",
  }),

  brand: Joi.string().trim().max(100).allow("").optional(),
  quality: Joi.string().trim().max(100).allow("").optional(),
  countryOrigin: Joi.string().trim().max(100).allow("").optional(),
  storageInstruction: Joi.string().trim().max(500).allow("").optional(),
  usageInstruction: Joi.string().trim().max(500).allow("").optional(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  variants: Joi.array().items(variantSchema).min(1).optional(),
  images: Joi.array().items(imageSchema).max(10).optional(),
  featured: Joi.boolean().optional(),
  bestSeller: Joi.boolean().optional(),
  newArrival: Joi.boolean().optional(),
  halal: Joi.boolean().optional(),
  frozen: Joi.boolean().optional(),
  fresh: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  discountPercentage: Joi.number().min(0).max(100).optional(),
  supplier: objectId.optional(),
}).min(1);

const listProductsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  // ✅ filter by category _id
  category: objectId.optional().messages({
    "string.length": "category must be a valid Category ID",
    "string.hex": "category must be a valid Category ID",
  }),

  featured: Joi.boolean().optional(),
  bestSeller: Joi.boolean().optional(),
  newArrival: Joi.boolean().optional(),
  halal: Joi.boolean().optional(),
  frozen: Joi.boolean().optional(),
  fresh: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  inStock: Joi.boolean().optional(),
  lowStock: Joi.boolean().optional(),
  search: Joi.string().trim().optional(),
  sortBy: Joi.string()
    .valid("name", "category", "createdAt", "featured", "bestSeller", "newArrival", "rating", "totalSold", "isActive")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

const validate = (schema) => (req, res, next) => {
  const target = req.method === "GET" ? req.query : req.body;
  const { error, value } = schema.validate(target, { abortEarly: false, stripUnknown: true });

  if (error) {
    return next(new ValidationError(error.details.map((d) => d.message)));
  }

  if (req.method === "GET") {
    Object.assign(req.query, value);
  } else {
    req.body = value;
  }

  next();
};

export const validateGetCategories = (req, res, next) => next();
export const validateCreateProduct = validate(createProductSchema);
export const validateUpdateProduct = validate(updateProductSchema);
export const validateListProducts = validate(listProductsSchema);