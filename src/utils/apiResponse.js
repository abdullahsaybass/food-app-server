import { HTTP } from "./constants.js";

// ─── Success ──────────────────────────────────────────────────────────────
export const success = (
  res,
  { statusCode = HTTP.OK, message = "Success", data = null, meta = null } = {}
) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

export const created = (
  res,
  { message = "Created successfully", data = null } = {}
) => success(res, { statusCode: HTTP.CREATED, message, data });

export const noContent = (res) => res.status(HTTP.NO_CONTENT).send();

// ─── Paginated ────────────────────────────────────────────────────────────
export const paginated = (
  res,
  { message = "Fetched successfully", data, pagination }
) =>
  success(res, {
    statusCode: HTTP.OK,
    message,
    data,
    meta: { pagination },
  });

// ─── Error ────────────────────────────────────────────────────────────────
export const error = (
  res,
  {
    statusCode = HTTP.INTERNAL_SERVER_ERROR,
    message = "Internal server error",
    errors = null,
  } = {}
) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

// ─── Shorthands ───────────────────────────────────────────────────────────
export const badRequest = (res, message, errors) =>
  error(res, { statusCode: HTTP.BAD_REQUEST, message, errors });

export const unauthorized = (res, message) =>
  error(res, { statusCode: HTTP.UNAUTHORIZED, message });

export const forbidden = (res, message) =>
  error(res, { statusCode: HTTP.FORBIDDEN, message });

export const notFound = (res, message) =>
  error(res, { statusCode: HTTP.NOT_FOUND, message });

export const conflict = (res, message) =>
  error(res, { statusCode: HTTP.CONFLICT, message });

export const tooManyReqs = (res, message) =>
  error(res, { statusCode: HTTP.TOO_MANY_REQUESTS, message });

export const serverError = (res, message) =>
  error(res, { statusCode: HTTP.INTERNAL_SERVER_ERROR, message });