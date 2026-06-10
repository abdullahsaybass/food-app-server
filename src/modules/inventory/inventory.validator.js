// ─────────────────────────────────────────────
// 🔥 INVENTORY VALIDATOR
// ─────────────────────────────────────────────
import Joi from 'joi';
import { ValidationError } from '../../utils/apiError.js';

const validate = (schema) => (req, res, next) => {
  const target = req.method === 'GET' ? req.query : req.body;
  const { error, value } = schema.validate(target, { abortEarly: false, stripUnknown: true });
  if (error) return next(new ValidationError(error.details.map((d) => d.message)));
  if (req.method === 'GET') Object.assign(req.query, value);
  else req.body = value;
  next();
};

// PATCH /api/inventory/:productId/adjust
export const validateAdjust = validate(
  Joi.object({
    unit:  Joi.string().trim().required(),
    delta: Joi.number().integer().not(0).required()
      .messages({ 'any.invalid': 'delta cannot be 0' }),
    note:  Joi.string().trim().max(300).allow('').optional(),
  })
);

// PATCH /api/inventory/:productId/set
export const validateSet = validate(
  Joi.object({
    unit:     Joi.string().trim().required(),
    quantity: Joi.number().integer().min(0).required(),
    note:     Joi.string().trim().max(300).allow('').optional(),
  })
);

// PATCH /api/inventory/:productId/threshold
export const validateThreshold = validate(
  Joi.object({
    unit:      Joi.string().trim().required(),
    threshold: Joi.number().integer().min(0).required(),
  })
);

// POST /api/inventory/bulk
export const validateBulk = validate(
  Joi.object({
    updates: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().hex().length(24).required(),
          unit:      Joi.string().trim().required(),
          quantity:  Joi.number().integer().min(0).required(),
        })
      )
      .min(1)
      .required(),
  })
);