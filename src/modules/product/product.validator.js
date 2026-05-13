import Joi from "joi";
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from "./product.constants.js";
import { ValidationError } from "../../utils/apiError.js"; // adjust path

const imageSchema = Joi.object({
  url: Joi.string().uri().required(),
  altText: Joi.string().allow("").optional(),
});

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().trim().max(1000).allow("").optional(),
  sku: Joi.string().trim().uppercase().alphanum().min(3).max(50).required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().integer().min(0).required(),
  unit: Joi.string()
    .valid(...Object.values(PRODUCT_UNITS))
    .required(),
  category: Joi.string()
    .valid(...Object.values(PRODUCT_CATEGORIES))
    .required(),
  images: Joi.array().items(imageSchema).max(10).optional(),
  stockThreshold: Joi.number().integer().min(0).default(10).optional(),
  isActive: Joi.boolean().optional(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).optional(),
  description: Joi.string().trim().max(1000).allow("").optional(),
  sku: Joi.string().trim().uppercase().alphanum().min(3).max(50).optional(),
  price: Joi.number().min(0).optional(),
  quantity: Joi.number().integer().min(0).optional(),
  unit: Joi.string()
    .valid(...Object.values(PRODUCT_UNITS))
    .optional(),
  category: Joi.string()
    .valid(...Object.values(PRODUCT_CATEGORIES))
    .optional(),
  images: Joi.array().items(imageSchema).max(10).optional(),
  stockThreshold: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

const listProductsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string()
    .valid(...Object.values(PRODUCT_CATEGORIES))
    .optional(),
  isActive: Joi.boolean().optional(),
  lowStock: Joi.boolean().optional(),
  search: Joi.string().trim().optional(),
  sortBy: Joi.string()
    .valid("name", "price", "quantity", "createdAt", "category")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

const validate = (schema) => (req, res, next) => {
  const target = req.method === "GET" ? req.query : req.body;

  const { error, value } = schema.validate(target, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message);

    // ✅ Use your ValidationError
    return next(new ValidationError(messages));
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