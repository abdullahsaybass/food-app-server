// modules/category/category.validator.js
import Joi from "joi";
import { ValidationError } from "../../utils/apiError.js";

const imageSchema = Joi.object({
  url:      Joi.string().required(), // was: Joi.string().uri().required() — local storage returns relative paths like "/uploads/categories/abc.webp", which .uri() rejects
  publicId: Joi.string().allow("", null).default(null),
  altText:  Joi.string().allow("").default(""),
});

const createCategorySchema = Joi.object({
  name:        Joi.string().trim().min(2).max(60).required(),
  key:         Joi.string().trim().lowercase().optional(),
  description: Joi.string().trim().allow("").max(300).default(""),

  // ── Image & Banner are OPTIONAL, and may be explicitly null ───────────
  image:  imageSchema.allow(null).optional(),
  banner: imageSchema.allow(null).optional(),

  sortOrder: Joi.number().integer().min(0).default(0),
  isActive:  Joi.boolean().default(true),
});

const updateCategorySchema = Joi.object({
  name:        Joi.string().trim().min(2).max(60),
  description: Joi.string().trim().allow("").max(300),

  image:  imageSchema.allow(null),
  banner: imageSchema.allow(null),

  sortOrder: Joi.number().integer().min(0),
  isActive:  Joi.boolean(),
}).min(1);

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) return next(new ValidationError(error.details.map((d) => d.message)));
  req.validatedBody = value;
  next();
};

export const validateCreateCategory = validate(createCategorySchema);
export const validateUpdateCategory = validate(updateCategorySchema);