// ─── Environment ──────────────────────────────────────────────────────────
export const ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
  CURRENT: process.env.NODE_ENV || "development",
  IS_PROD: process.env.NODE_ENV === "production",
  IS_DEV: process.env.NODE_ENV !== "production",
};

// ─── HTTP Status Codes ────────────────────────────────────────────────────
export const HTTP = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// ─── Error Names ──────────────────────────────────────────────────────────
export const ERROR_TYPES = {
  VALIDATION: "ValidationError",
  NOT_FOUND: "NotFoundError",
  UNAUTHORIZED: "UnauthorizedError",
  FORBIDDEN: "ForbiddenError",
  CONFLICT: "ConflictError",
  RATE_LIMIT: "RateLimitError",
  BAD_REQUEST: "BadRequestError",
  INTERNAL: "InternalError",
  CAST_ERROR: "CastError",
  MONGO_DUPLICATE: 11000,
};

// ─── Pagination ───────────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// ─── Cache TTLs ───────────────────────────────────────────────────────────
export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 60 * 5,
  LONG: 60 * 60,
  DAY: 60 * 60 * 24,
};

// ─── Cache keys ───────────────────────────────────────────────────────────
export const CACHE_KEYS = {
  USER: (id) => `user:${id}`,
  USERS_LIST: (page, limit) => `users:list:${page}:${limit}`,
  USER_ADDRESSES: (id) => `user:${id}:addresses`,
};

// ─── Logger levels ────────────────────────────────────────────────────────
export const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  HTTP: "http",
  DEBUG: "debug",
};