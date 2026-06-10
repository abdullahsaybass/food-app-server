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
  // Profile
  PROFILE_FETCHED:     "Profile fetched successfully",
  PROFILE_UPDATED:     "Profile updated successfully",
  ACCOUNT_DELETED:     "Account deactivated successfully",
  PHONE_IN_USE:        "Phone number is already in use",

  // Profile picture
  PROFILE_PIC_UPDATED: "Profile picture updated successfully",
  PROFILE_PIC_REMOVED: "Profile picture removed successfully",
  PASSWORD_CHANGED: "Password changed successfully",

  // Address
  ADDRESSES_FETCHED:   "Addresses fetched successfully",  // FIX: was missing, getAddresses used inline string
  ADDRESS_ADDED:       "Address added successfully",
  ADDRESS_UPDATED:     "Address updated successfully",
  ADDRESS_DELETED:     "Address deleted successfully",
  ADDRESS_NOT_FOUND:   "Address not found",
  ADDRESS_LIMIT:       "You can save at most 5 addresses",

  // Admin user management
  USERS_FETCHED:       "Users fetched successfully",
  USER_FETCHED:        "User fetched successfully",
  USER_NOT_FOUND:      "User not found",
  USER_UPDATED:        "User updated successfully",
  USER_DELETED:        "User deactivated successfully",

  // Seed
  ADMIN_SEEDED:        "Admin created successfully",
  ADMIN_EXISTS:        "Admin already exists",
};