// modules/order/order.validator.js
import Joi from "joi";
import { ValidationError } from "../../utils/apiError.js";
import { ORDER_STATUS, PAYMENT_STATUS } from "./order.constants.js";

// ── Schemas ────────────────────────────────────────────────────────────────────
const orderItemSchema = Joi.object({
  product:  Joi.string().hex().length(24).required().messages({
    "string.hex":   "Product ID must be a valid ObjectId.",
    "any.required": "Product is required.",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.min":   "Quantity must be at least 1.",
    "any.required": "Quantity is required.",
  }),
});

const shippingAddressSchema = Joi.object({
  label:      Joi.string().valid("home", "work", "other").default("home"),
  fullName:   Joi.string().trim().min(2).max(100).required(),
  phone:      Joi.string().trim().pattern(/^[6-9]\d{9}$/).required().messages({
    "string.pattern.base": "Enter a valid 10-digit phone number.",
  }),
  street:     Joi.string().trim().min(2).max(200).required(),
  city:       Joi.string().trim().min(2).max(100).required(),
  state:      Joi.string().trim().min(2).max(100).required(),
  postalCode: Joi.string().trim().pattern(/^\d{6}$/).required().messages({
    "string.pattern.base": "Postal code must be 6 digits.",
  }),
  country:    Joi.string().trim().max(100).default("India"),
});

const placeOrderSchema = Joi.object({
  items:           Joi.array().items(orderItemSchema).min(1).required().messages({
    "array.min":    "Order must have at least one item.",
    "any.required": "Items are required.",
  }),
  addressId:       Joi.string().hex().length(24).optional(),
  shippingAddress: shippingAddressSchema.optional(),
});

const cancelOrderSchema = Joi.object({
  cancelReason: Joi.string().trim().max(500).optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ORDER_STATUS)).required().messages({
    "any.only": `Status must be one of: ${Object.values(ORDER_STATUS).join(", ")}.`,
  }),
});

// ── User order history query ───────────────────────────────────────────────────
const userOrdersQuerySchema = Joi.object({
  page:   Joi.number().integer().min(1).default(1),
  limit:  Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string().valid(...Object.values(ORDER_STATUS)).optional(),
});

// ── Admin orders query (richer) ────────────────────────────────────────────────
const adminOrdersQuerySchema = Joi.object({
  page:          Joi.number().integer().min(1).default(1),
  limit:         Joi.number().integer().min(1).max(100).default(20),
  status:        Joi.string().valid(...Object.values(ORDER_STATUS)).optional(),
  paymentStatus: Joi.string().valid(...Object.values(PAYMENT_STATUS)).optional(),
  search:        Joi.string().trim().max(100).optional(), // orderNumber / name / phone
  sortBy:        Joi.string().valid("createdAt", "totalAmount", "status").default("createdAt"),
  sortOrder:     Joi.string().valid("asc", "desc").default("desc"),
});

// ── Admin recent orders query ──────────────────────────────────────────────────
const recentOrdersQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10),
});

// ── Middleware factories ───────────────────────────────────────────────────────
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return next(new ValidationError(error.details.map((d) => d.message)));
  req.validatedBody = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) return next(new ValidationError(error.details.map((d) => d.message)));
  req.validatedQuery = value;
  next();
};

export const validatePlaceOrder        = validate(placeOrderSchema);
export const validateCancelOrder       = validate(cancelOrderSchema);
export const validateUpdateStatus      = validate(updateStatusSchema);
export const validateUserOrdersQuery   = validateQuery(userOrdersQuerySchema);
export const validateAdminOrdersQuery  = validateQuery(adminOrdersQuerySchema);
export const validateRecentOrdersQuery = validateQuery(recentOrdersQuerySchema);