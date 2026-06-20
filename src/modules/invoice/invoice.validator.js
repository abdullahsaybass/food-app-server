// modules/invoice/invoice.validator.js
import Joi from "joi";
import { ValidationError } from "../../utils/apiError.js";
import { INVOICE_STATUS } from "./invoice.constants.js";

const userInvoicesQuerySchema = Joi.object({
  page:   Joi.number().integer().min(1).default(1),
  limit:  Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string().valid(...Object.values(INVOICE_STATUS)).optional(),
});

const adminInvoicesQuerySchema = Joi.object({
  page:   Joi.number().integer().min(1).default(1),
  limit:  Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid(...Object.values(INVOICE_STATUS)).optional(),
  search: Joi.string().trim().optional(),
});

const validateQuery = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) throw new ValidationError(error.details.map((d) => d.message));
  req.validatedQuery = value;
  next();
};

export const validateUserInvoicesQuery  = validateQuery(userInvoicesQuerySchema);
export const validateAdminInvoicesQuery = validateQuery(adminInvoicesQuerySchema);