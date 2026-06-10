// ─── User Mapper ─────────────────────────────────────────────────────────────
// Transforms raw Mongoose user documents into safe API response shapes.
// Always use these instead of returning raw user objects.

export const toPublicUser = (user) => ({
  id:         user._id,
  name:       user.name,
  email:      user.email,
  phone:      user.phone,
  profilePic: user.profilePic ?? { url: null, publicId: null },
  addresses:  toAddressList(user.addresses ?? []),  // ← use mapper
  role:       user.role,
  isActive:   user.isActive,
  // removed isEmailVerified — field is commented out in schema
  lastLogin:  user.lastLogin,
  createdAt:  user.createdAt,
  updatedAt:  user.updatedAt,
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
    _id:       a._id, 
    type:      a.type,       // FIX: was a.label (the enum)
    label:     a.label,  
    recipientName:  a.recipientName  ?? "",
    recipientPhone: a.recipientPhone ?? "",    // FIX: new free-text display name field
    street:    a.street,
    city:      a.city,
    state:     a.state,
    zip:       a.zip,        // FIX: was a.postalCode
    country:   a.country,
    isDefault: a.isDefault,
    
  }));
 