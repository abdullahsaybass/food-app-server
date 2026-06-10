// ─────────────────────────────────────────────
// 🔥 COUPON VALIDATOR
// ─────────────────────────────────────────────
import Joi from 'joi';
import { COUPON_DISCOUNT_TYPES } from './coupon.constants.js';
import { ValidationError } from '../../utils/apiError.js';

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────
const createCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .min(3)
    .max(30)
    .pattern(/^[A-Z0-9_-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Code must contain only letters, numbers, hyphens, or underscores',
    }),

  description: Joi.string().trim().max(500).allow('').optional(),

  discountType: Joi.string()
    .valid(...Object.values(COUPON_DISCOUNT_TYPES))
    .required(),

  discountValue: Joi.when('discountType', {
    is:        COUPON_DISCOUNT_TYPES.FREE_SHIP,
    then:      Joi.number().default(0),
    otherwise: Joi.number().min(0.01).required(),
  }),

  maxDiscountAmount: Joi.when('discountType', {
    is:        COUPON_DISCOUNT_TYPES.PERCENTAGE,
    then:      Joi.number().min(0).default(0),
    otherwise: Joi.number().default(0),
  }),

  minOrderValue: Joi.number().min(0).default(0),

  applicableProducts: Joi.array()
    .items(Joi.string().hex().length(24))
    .optional(),

  applicableCategories: Joi.array()
    .items(Joi.string().trim())
    .optional(),

  usageLimit:        Joi.number().integer().min(0).default(0),
  usageLimitPerUser: Joi.number().integer().min(0).default(1),

  startDate: Joi.date().allow(null).optional(),
  endDate:   Joi.date().min(Joi.ref('startDate')).allow(null).optional(),

  isActive: Joi.boolean().default(true),
});

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────
const updateCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .min(3)
    .max(30)
    .pattern(/^[A-Z0-9_-]+$/)
    .optional(),

  description: Joi.string().trim().max(500).allow('').optional(),

  discountType: Joi.string()
    .valid(...Object.values(COUPON_DISCOUNT_TYPES))
    .optional(),

  discountValue:     Joi.number().min(0).optional(),
  maxDiscountAmount: Joi.number().min(0).optional(),
  minOrderValue:     Joi.number().min(0).optional(),

  applicableProducts:   Joi.array().items(Joi.string().hex().length(24)).optional(),
  applicableCategories: Joi.array().items(Joi.string().trim()).optional(),

  usageLimit:        Joi.number().integer().min(0).optional(),
  usageLimitPerUser: Joi.number().integer().min(0).optional(),

  startDate: Joi.date().allow(null).optional(),
  endDate:   Joi.date().allow(null).optional(),

  isActive: Joi.boolean().optional(),
}).min(1);

// ─────────────────────────────────────────────
// APPLY (validate coupon code at checkout)
// ─────────────────────────────────────────────
const applyCouponSchema = Joi.object({
  code:       Joi.string().trim().uppercase().required(),
  orderTotal: Joi.number().min(0).required(),
});

// ─────────────────────────────────────────────
// LIST
// ─────────────────────────────────────────────
const listCouponsSchema = Joi.object({
  page:      Joi.number().integer().min(1).default(1),
  limit:     Joi.number().integer().min(1).max(100).default(10),
  isActive:  Joi.boolean().optional(),
  sortBy:    Joi.string().valid('createdAt', 'code', 'endDate', 'usedCount').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search:    Joi.string().trim().optional(),
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
export const validateCreateCoupon = validate(createCouponSchema);
export const validateUpdateCoupon = validate(updateCouponSchema);
export const validateApplyCoupon  = validate(applyCouponSchema);
export const validateListCoupons  = validate(listCouponsSchema);