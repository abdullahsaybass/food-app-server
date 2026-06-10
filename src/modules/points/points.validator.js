// ─────────────────────────────────────────────
// 🔥 POINTS VALIDATOR
// ─────────────────────────────────────────────
import Joi from 'joi';
import { POINTS_TRANSACTION_TYPE } from './points.constants.js';
import { ValidationError } from '../../utils/apiError.js';

const validate = (schema) => (req, res, next) => {
  const target = req.method === 'GET' ? req.query : req.body;
  const { error, value } = schema.validate(target, { abortEarly: false, stripUnknown: true });

  if (error) {
    return next(new ValidationError(error.details.map((d) => d.message)));
  }

  if (req.method === 'GET') Object.assign(req.query, value);
  else req.body = value;

  next();
};

// Admin: manually credit points to a user
export const validateAdminCredit = validate(
  Joi.object({
    points: Joi.number().integer().min(1).required(),
    note:   Joi.string().trim().max(300).allow('').optional(),
  })
);

// Admin: manually debit points from a user
export const validateAdminDebit = validate(
  Joi.object({
    points: Joi.number().integer().min(1).required(),
    note:   Joi.string().trim().max(300).allow('').optional(),
  })
);

// Admin: award invite bonus
export const validateInviteBonus = validate(
  Joi.object({
    points: Joi.number().integer().min(1).optional(),  // if omitted, uses config default
    note:   Joi.string().trim().max(300).allow('').optional(),
  })
);

// User: validate/check redeem at checkout
export const validateRedeemCheck = validate(
  Joi.object({
    orderTotal:      Joi.number().min(0).required(),
    requestedPoints: Joi.number().integer().min(1).optional(),
  })
);

// Query: points history filter
export const validateHistoryQuery = validate(
  Joi.object({
    page:  Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
    type:  Joi.string()
      .valid(...Object.values(POINTS_TRANSACTION_TYPE))
      .optional(),
  })
);

// Admin: update config
export const validateUpdateConfig = validate(
  Joi.object({
    purchasePointsPerUnit: Joi.number().min(0).optional(),
    referralGivePoints:    Joi.number().integer().min(0).optional(),
    referralGetPoints:     Joi.number().integer().min(0).optional(),
    inviteBonusPoints:     Joi.number().integer().min(0).optional(),
    redeemPointsPerUnit:   Joi.number().min(0.01).optional(),
    maxRedeemPercent:      Joi.number().min(0).max(100).optional(),
    minRedeemPoints:       Joi.number().integer().min(0).optional(),
    pointsExpiryDays:      Joi.number().integer().min(0).optional(),
  }).min(1)
);