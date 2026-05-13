// src/features/cart/cart.validator.js

import Joi from 'joi';

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors:  error.details.map((d) => d.message),
    });
  }
  next();
};

// POST /api/cart/sync
// Body: { items: [{ productId, quantity }] }
export const validateSyncCart = validate(
  Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          quantity:  Joi.number().integer().min(1).required(),
        })
      )
      .required(),
  })
);

// POST /api/cart/items
// Body: { productId, quantity }
export const validateAddItem = validate(
  Joi.object({
    productId: Joi.string().required(),
    quantity:  Joi.number().integer().min(1).default(1),
  })
);

// PATCH /api/cart/items/:productId
// Body: { quantity }
export const validateUpdateItem = validate(
  Joi.object({
    quantity: Joi.number().integer().min(1).required(),
  })
);