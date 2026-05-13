import { HTTP, ERROR_TYPES } from "./constants.js";

// ─── Base AppError ────────────────────────────────────────────────────────
export class AppError extends Error {
  constructor(message, statusCode, errorType) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType || "AppError";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── 400 ──────────────────────────────────────────────────────────────────
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, HTTP.BAD_REQUEST, ERROR_TYPES.BAD_REQUEST);
  }
}

// ─── 400 Validation ───────────────────────────────────────────────────────
export class ValidationError extends AppError {
  constructor(errors) {
    const message = Array.isArray(errors) ? errors.join(", ") : errors;
    super(message, HTTP.BAD_REQUEST, ERROR_TYPES.VALIDATION);
    this.errors = Array.isArray(errors) ? errors : [errors];
  }
}

// ─── 401 ──────────────────────────────────────────────────────────────────
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, HTTP.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
  }
}

// ─── 403 ──────────────────────────────────────────────────────────────────
export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, HTTP.FORBIDDEN, ERROR_TYPES.FORBIDDEN);
  }
}

// ─── 404 ──────────────────────────────────────────────────────────────────
export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, HTTP.NOT_FOUND, ERROR_TYPES.NOT_FOUND);
  }
}

// ─── 409 ──────────────────────────────────────────────────────────────────
export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, HTTP.CONFLICT, ERROR_TYPES.CONFLICT);
  }
}

// ─── 429 ──────────────────────────────────────────────────────────────────
export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, HTTP.TOO_MANY_REQUESTS, ERROR_TYPES.RATE_LIMIT);
  }
}

// ─── 500 ──────────────────────────────────────────────────────────────────
export class InternalError extends AppError {
  constructor(message = "Internal server error") {
    super(message, HTTP.INTERNAL_SERVER_ERROR, ERROR_TYPES.INTERNAL);
    this.isOperational = false;
  }
}