import { ENV, HTTP, ERROR_TYPES } from "../utils/constants.js";
import {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../utils/apiError.js";

// ─── Transform known 3rd-party errors into AppError ───────────────────────

const handleCastError = (err) =>
  new AppError(
    `Invalid ${err.path}: ${err.value}`,
    HTTP.BAD_REQUEST,
    ERROR_TYPES.CAST_ERROR
  );

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || "field";
  const value = err.keyValue?.[field];
  return new ConflictError(`${field} '${value}' is already taken`);
};

const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => e.message);
  return new ValidationError(errors);
};

const handleJWTError = () =>
  new AppError(
    "Invalid token. Please log in again",
    HTTP.UNAUTHORIZED,
    ERROR_TYPES.UNAUTHORIZED
  );

const handleJWTExpiredError = () =>
  new AppError(
    "Token has expired. Please log in again",
    HTTP.UNAUTHORIZED,
    ERROR_TYPES.UNAUTHORIZED
  );

// ─── Format error for dev ────────────────────────────────────────────────
const sendDevError = (err, res) =>
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    errorType: err.errorType,
    errors: err.errors || undefined,
    stack: err.stack,
  });

// ─── Format error for prod ───────────────────────────────────────────────
const sendProdError = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  console.error("💥 NON-OPERATIONAL ERROR:", err);

  return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Something went wrong. Please try again later.",
  });
};

// ─── 404 Handler ─────────────────────────────────────────────────────────
export const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
};

// ─── Global Error Handler ────────────────────────────────────────────────
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP.INTERNAL_SERVER_ERROR;

  let error = err;

  if (err.name === "CastError") error = handleCastError(err);
  if (err.code === ERROR_TYPES.MONGO_DUPLICATE)
    error = handleDuplicateKeyError(err);
  if (err.name === "ValidationError")
    error = handleMongooseValidationError(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  // log server errors
  if ((error.statusCode || HTTP.INTERNAL_SERVER_ERROR) >= 500) {
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
      error
    );
  }

  // send response
  if (ENV.IS_PROD) return sendProdError(error, res);
  return sendDevError(error, res);
};