// modules/order/order.validator.js
import Joi from "joi";
import { ValidationError } from "../../utils/apiError.js";
import { ORDER_STATUS, PAYMENT_STATUS, ORDER_MESSAGES } from "./order.constants.js";
import { isMaldivesAddress } from "../../utils/geo.utils.js";

// ── Schemas ────────────────────────────────────────────────────────────────────
const orderItemSchema = Joi.object({
  product: Joi.string().hex().length(24).required().messages({
    "string.hex":   "Product ID must be a valid ObjectId.",
    "any.required": "Product is required.",
  }),
  unit: Joi.string().required().messages({
    "any.required": "Variant unit is required (e.g. \"1kg\", \"500g\").",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.min":   "Quantity must be at least 1.",
    "any.required": "Quantity is required.",
  }),
});

const shippingAddressSchema = Joi.object({
  label:         Joi.string().trim().allow("").default(""),
  fullName:      Joi.string().trim().min(2).max(100).required()
                   .messages({ "any.required": "Full name is required." }),
  phone:         Joi.string().trim().required()
                   .messages({ "any.required": "Phone number is required." }),
  street:        Joi.string().trim().allow("").default(""),
  city:          Joi.string().trim().allow("").default(""),
  state:         Joi.string().trim().allow("").default(""),
  zip:           Joi.string().trim().allow("").default(""),

  // ── Maldives-only — country must be Maldives / MV ──────────────────────────
  country: Joi.string().trim().valid("Maldives", "MV").default("Maldives").messages({
    "any.only": ORDER_MESSAGES.OUTSIDE_MALDIVES,
  }),

  // GPS coords for Maldives bounding-box check
  location: Joi.object({
    latitude:  Joi.number().min(-90).max(90).allow(null).default(null),
    longitude: Joi.number().min(-180).max(180).allow(null).default(null),
  }).default({ latitude: null, longitude: null }),
  locationLabel: Joi.string().trim().allow("").default(""),
})
  // ── Custom check: if GPS is provided, it must fall inside Maldives ─────────
  .custom((value, helpers) => {
    if (!isMaldivesAddress(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  })
  .messages({ "any.invalid": ORDER_MESSAGES.OUTSIDE_MALDIVES });

const placeOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required().messages({
    "array.min":    "Order must have at least one item.",
    "any.required": "Items are required.",
  }),
  addressId:       Joi.string().hex().length(24).optional(),
  shippingAddress: shippingAddressSchema.optional(),
  couponCode:      Joi.string().trim().uppercase().optional().allow("", null),
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
  search:        Joi.string().trim().max(100).optional(),
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
