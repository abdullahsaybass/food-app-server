import Joi from "joi";
import { ValidationError } from "../../utils/apiError.js";

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly:   false,
    stripUnknown: true,
  });
  if (error) {
    return next(new ValidationError(error.details.map((d) => d.message)));
  }
  req.validatedBody = value;
  next();
};

export const sharedSchemas = {
  name: Joi.string().min(2).max(50).trim().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 50 characters",
  }),
  phone: Joi.string().trim(),
  email: Joi.string().email().lowercase().trim().messages({
    "string.email": "Enter a valid email address",
  }),
  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      "string.min":          "Password must be at least 8 characters",
      "string.pattern.base": "Password must contain uppercase, lowercase, and a number",
    }),
};

const registerSchema = Joi.object({
  name:     sharedSchemas.name.required().messages({ "any.required": "Name is required" }),
  phone:    sharedSchemas.phone.required().messages({ "any.required": "Phone is required" }),
  email:    sharedSchemas.email.required().messages({ "any.required": "Email is required" }),
  password: sharedSchemas.password.required().messages({ "any.required": "Password is required" }),
});

const loginSchema = Joi.object({
  email:    sharedSchemas.email.required().messages({ "any.required": "Email is required" }),
  password: Joi.string().required().messages({ "any.required": "Password is required" }),
});

const forgotPasswordSchema = Joi.object({
  email: sharedSchemas.email.required().messages({ "any.required": "Email is required" }),
});

const resetPasswordSchema = Joi.object({
  token:    Joi.string().required().messages({ "any.required": "Reset token is required" }),
  password: sharedSchemas.password.required().messages({ "any.required": "Password is required" }),
});

export const validateRegister       = validate(registerSchema);
export const validateLogin          = validate(loginSchema);
export const validateForgotPassword = validate(forgotPasswordSchema);
export const validateResetPassword  = validate(resetPasswordSchema);