// ─── JWT ──────────────────────────────────────────────────────────────────────
export const JWT_EXPIRES_IN         = "7d";
export const JWT_REFRESH_EXPIRES_IN = "30d";
export const PASSWORD_RESET_TOKEN_EXPIRES_MINUTES = 15;

// ─── Bcrypt ───────────────────────────────────────────────────────────────────
export const SALT_ROUNDS = 12;

// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = {
  USER:       "user",
  ADMIN:      "admin",
  SUPERADMIN: "superadmin",
};

// ─── HTTP Status Codes ────────────────────────────────────────────────────────
export const HTTP = {
  OK:                    200,
  CREATED:               201,
  BAD_REQUEST:           400,
  UNAUTHORIZED:          401,
  FORBIDDEN:             403,
  NOT_FOUND:             404,
  CONFLICT:              409,
  INTERNAL_SERVER_ERROR: 500,
};

// ─── Messages ─────────────────────────────────────────────────────────────────
export const MESSAGES = {
  // Auth
  REGISTER_SUCCESS:        "Registration successful",
  LOGIN_SUCCESS:           "Login successful",
  LOGOUT_SUCCESS:          "Logged out successfully",
  EMAIL_TAKEN:             "Email is already registered",
  PHONE_TAKEN:             "Phone number is already registered",
  INVALID_CREDENTIALS:     "Invalid email or password",
  ACCOUNT_DEACTIVATED:     "Your account has been deactivated. Please contact support",

  // Token
  NO_TOKEN:                "Access denied. No token provided",
  INVALID_TOKEN:           "Invalid token. Please log in again",
  TOKEN_EXPIRED:           "Token has expired. Please log in again",
  ACCOUNT_NOT_FOUND:       "Account not found or deactivated",
  ACCESS_DENIED:           "You do not have permission to perform this action",

  // Password reset
  PASSWORD_RESET_EMAIL_SENT: "If an account exists, a password reset link has been sent",
  PASSWORD_RESET_INVALID:    "Invalid or expired reset token",
  PASSWORD_RESET_SUCCESS:    "Password reset successful",

  // Generic
  INTERNAL_ERROR: "Internal server error",
  NOT_FOUND:      "Route not found",
};