import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ─── Address Sub-Schema ──────────────────────────────────────────────────────
const addressSchema = new mongoose.Schema(
  {
    // FIX: renamed 'label' (enum) → 'type' to match the Address interface
    type: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
    // FIX: added 'label' as a free-text display name (e.g. "My Home")
    label: {
      type: String,
      trim: true,
      default: "",
    },
    recipientName:  { type: String, trim: true, default: "" },
    recipientPhone: { type: String, trim: true, default: "" },
    street:    { type: String, required: [true, "Street is required"], trim: true },
    atoll:     { type: String, trim: true, default: "" }, // required enforced by Joi only
    island:    { type: String, trim: true, default: "" }, // required enforced by Joi only
    // city is kept for backwards-compat and derived as "<island>, <atoll>"
    city:      { type: String, trim: true },
    state:     { type: String, trim: true },
    zip:       { type: String, trim: true, default: "" }, // required enforced by Joi only
    // FIX: removed stray trailing dot from "Maldives."
    country:   { type: String, required: [true, "Country is required"],     trim: true, default: "Maldives" },
    // GPS coordinates — used for Maldives-only delivery validation
    location: {
      latitude:  { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    locationLabel: { type: String, trim: true, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

// ─── Main User Schema ────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      unique: true,
      sparse: true,
      trim: true,
      
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    profilePic: {
      url:      { type: String, default: null },
      publicId: { type: String, default: null },
    },
    addresses: {
      type: [addressSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "A user can have at most 5 saved addresses",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // isEmailVerified: {
    //   type: Boolean,
    //   default: false,
    // },
    // emailVerificationToken:   { type: String, select: false },
    // emailVerificationExpires: { type: Date,   select: false },
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },
    lastLogin:            { type: Date,   default: null },
  },
  { timestamps: true }
);

// ─── Pre-save: hash password ─────────────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Pre-save: enforce single default address ────────────────────────────────
userSchema.pre("save", function () {
  const defaults = this.addresses.filter((a) => a.isDefault);
  if (defaults.length > 1) {
    this.addresses.forEach((a) => (a.isDefault = false));
    this.addresses[this.addresses.length - 1].isDefault = true;
  }
});

// ─── Instance methods ────────────────────────────────────────────────────────
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isAdmin = function () {
  return ["admin", "superadmin"].includes(this.role);
};

userSchema.methods.toSafeObject = function () {
  return {
    id:         this._id,
    name:       this.name,
    phone:      this.phone,
    email:      this.email,
    profilePic: this.profilePic ?? null,
    addresses:  this.addresses,
    role:       this.role,
    isActive:   this.isActive,
    // FIX: removed isEmailVerified — field is commented out in schema,
    //      referencing it returns undefined and misleads the client
    lastLogin:  this.lastLogin,
    createdAt:  this.createdAt,
  };
};

// ─── Static methods ──────────────────────────────────────────────────────────
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email }).select("+password +refreshToken");
};

userSchema.statics.findAdmins = function () {
  return this.find({ role: { $in: ["admin", "superadmin"] } });
};

const User = mongoose.model("User", userSchema);
export default User;