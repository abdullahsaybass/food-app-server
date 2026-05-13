// ─── User Mapper ─────────────────────────────────────────────────────────────
// Transforms raw Mongoose user documents into safe API response shapes.
// Always use these instead of returning raw user objects.

export const toPublicUser = (user) => ({
  id:              user._id,
  name:            user.name,
  email:           user.email,
  phone:           user.phone,
  profilePic:      user.profilePic ?? { url: null, publicId: null },
  addresses:       user.addresses  ?? [],
  role:            user.role,
  isActive:        user.isActive,
  isEmailVerified: user.isEmailVerified ?? false,
  lastLogin:       user.lastLogin,
  createdAt:       user.createdAt,
  updatedAt:       user.updatedAt,
});

export const toAdminUser = (user) => ({
  ...toPublicUser(user),
  // Admin can see extra fields
  _id:       user._id,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const toAddressList = (addresses) =>
  addresses.map((a) => ({
    id:         a._id,
    label:      a.label,
    street:     a.street,
    city:       a.city,
    state:      a.state,
    postalCode: a.postalCode,
    country:    a.country,
    isDefault:  a.isDefault,
  }));