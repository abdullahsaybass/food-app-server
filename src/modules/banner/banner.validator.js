// ─────────────────────────────────────────────
// 🔥 BANNER VALIDATOR
// ─────────────────────────────────────────────
import Joi from 'joi';
import { BANNER_POSITIONS, BANNER_TYPES } from './banner.constants.js';
import { ValidationError } from '../../utils/apiError.js';

// ─────────────────────────────────────────────
// image sub-schema
// ─────────────────────────────────────────────
const imageSchema = Joi.object({
  url:      Joi.string().uri().required(),
  publicId: Joi.string().allow('').optional(),
  altText:  Joi.string().allow('').optional(),
});

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────
const createBannerSchema = Joi.object({
  title: Joi.string().trim().min(2).max(150).required(),

  subtitle: Joi.string().trim().max(200).allow('').optional(),

  description: Joi.string().trim().max(1000).allow('').optional(),

  type: Joi.string()
    .valid(...Object.values(BANNER_TYPES))
    .default(BANNER_TYPES.IMAGE),

  image: imageSchema.required(),

  linkUrl:  Joi.string().uri().allow('').optional(),
  linkText: Joi.string().trim().max(100).allow('').optional(),

  position: Joi.string()
    .valid(...Object.values(BANNER_POSITIONS))
    .required(),

  sortOrder: Joi.number().integer().min(0).default(0),

  startDate: Joi.date().allow(null).optional(),
  endDate:   Joi.date().min(Joi.ref('startDate')).allow(null).optional(),

  isActive: Joi.boolean().default(true),
});

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────
const updateBannerSchema = Joi.object({
  title:       Joi.string().trim().min(2).max(150).optional(),
  subtitle:    Joi.string().trim().max(200).allow('').optional(),
  description: Joi.string().trim().max(1000).allow('').optional(),

  type: Joi.string().valid(...Object.values(BANNER_TYPES)).optional(),

  image: imageSchema.optional(),

  linkUrl:   Joi.string().uri().allow('').optional(),
  linkText:  Joi.string().trim().max(100).allow('').optional(),

  position: Joi.string().valid(...Object.values(BANNER_POSITIONS)).optional(),

  sortOrder: Joi.number().integer().min(0).optional(),

  startDate: Joi.date().allow(null).optional(),
  endDate:   Joi.date().allow(null).optional(),

  isActive: Joi.boolean().optional(),
}).min(1);

// ─────────────────────────────────────────────
// LIST
// ─────────────────────────────────────────────
const listBannersSchema = Joi.object({
  page:     Joi.number().integer().min(1).default(1),
  limit:    Joi.number().integer().min(1).max(100).default(10),
  position: Joi.string().valid(...Object.values(BANNER_POSITIONS)).optional(),
  isActive: Joi.boolean().optional(),
  sortBy:   Joi.string().valid('sortOrder', 'createdAt', 'title').default('sortOrder'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

// ─────────────────────────────────────────────
// MIDDLEWARE FACTORY
// ─────────────────────────────────────────────
const validate = (schema) => (req, res, next) => {
  const target = req.method === 'GET' ? req.query : req.body;

  const { error, value } = schema.validate(target, {
    abortEarly:    false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message);
    return next(new ValidationError(messages));
  }

  if (req.method === 'GET') {
    Object.assign(req.query, value);
  } else {
    req.body = value;
  }

  next();
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
export const validateCreateBanner = validate(createBannerSchema);
export const validateUpdateBanner = validate(updateBannerSchema);
export const validateListBanners  = validate(listBannersSchema);