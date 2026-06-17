// modules/notification/notification.validator.js
import Joi from "joi";
import { ValidationError } from "../../utils/apiError.js";

const listQuerySchema = Joi.object({
  page:  Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const registerTokenSchema = Joi.object({
  token:    Joi.string().trim().required().messages({
    "any.required": "Device token is required.",
  }),
  platform: Joi.string().valid("ios", "android", "web").default("android"),
});

const removeTokenSchema = Joi.object({
  token: Joi.string().trim().required(),
});

const validateBody = (schema) => (req, res, next) => {
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

export const validateListQuery     = validateQuery(listQuerySchema);
export const validateRegisterToken = validateBody(registerTokenSchema);
export const validateRemoveToken   = validateBody(removeTokenSchema);
