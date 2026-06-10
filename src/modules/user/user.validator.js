import Joi from "joi";
import { Readable } from "stream";
import cloudinary from "../../config/cloudinary.config.js";
import { sharedSchemas } from "../auth/auth.validator.js";

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly:   false,
    stripUnknown: true,
  });
  if (error) {
    return res.status(400).json({
      success: false,
      errors:  error.details.map((d) => d.message),
    });
  }
  req.validatedBody = value;
  next();
};

// ─── Add Address ──────────────────────────────────────────────────────────────
export const addressBodySchema = Joi.object({
  // FIX: renamed 'label' → 'type' (the enum category)
  type:      Joi.string().valid("home", "work", "other").default("home"),
  // FIX: added 'label' as optional free-text display name
  label:     Joi.string().trim().allow("").default(""),
  recipientName:  Joi.string().trim().allow("").default(""),
  recipientPhone: Joi.string().trim().pattern(/^\+?[1-9]\d{9,14}$/).allow("").default(""),
  street:    Joi.string().trim().required().messages({ "any.required": "Street is required" }),
  city:      Joi.string().trim().required().messages({ "any.required": "City is required" }),
  // FIX: state (atoll) is optional for Maldives
  state:     Joi.string().trim().allow("", null).optional(),
  // FIX: renamed 'postalCode' → 'zip'
  zip:       Joi.string().trim().required().messages({ "any.required": "Postal code is required" }),
  // FIX: default country changed from "India" → "Maldives"
  country: Joi.string()
  .valid('Maldives', 'MV')
  .default('Maldives')
});

// ─── Update Address ───────────────────────────────────────────────────────────
export const updateAddressSchema = Joi.object({
  // FIX: renamed 'label' → 'type'
  type:      Joi.string().valid("home", "work", "other"),
  // FIX: added optional label update
  label:     Joi.string().trim().allow(""),
  recipientName:  Joi.string().trim().allow(""),
  recipientPhone: Joi.string().trim().pattern(/^\+?[1-9]\d{9,14}$/).allow(""),
  street:    Joi.string().trim(),
  city:      Joi.string().trim(),
  // FIX: state optional
  state:     Joi.string().trim().allow("", null),
  // FIX: renamed 'postalCode' → 'zip'
  zip:       Joi.string().trim(),
  country:   Joi.string().trim(),
  isDefault: Joi.boolean(),
}).min(1);

// ─── Other profile schemas (unchanged) ───────────────────────────────────────
const updateProfileSchema = Joi.object({
  name:  Joi.string().min(2).max(50),
  phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/),
}).min(1);

const adminUpdateUserSchema = Joi.object({
  name:     sharedSchemas.name,
  phone:    sharedSchemas.phone,
  role:     Joi.string().valid("user", "admin", "superadmin"),
  isActive: Joi.boolean(),
}).min(1);

// ─── Profile picture upload (cloudinary) ─────────────────────────────────────
export const validateUpdateProfilePic = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, errors: ["No file uploaded"] });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:         "profile_pics",
          transformation: [{ width: 400, height: 400, crop: "fill" }],
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      Readable.from(req.file.buffer).pipe(stream);
    });

    req.validatedBody = {
      url:      uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };

    next();
  } catch (err) {
    next(err);
  }
};


const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string().min(8).required().messages({
    "string.min":   "New password must be at least 8 characters",
    "any.required": "New password is required",
  }),
});

export const validateUpdateProfile   = validate(updateProfileSchema);
export const validateAddAddress      = validate(addressBodySchema);
export const validateUpdateAddress   = validate(updateAddressSchema);
export const validateAdminUpdateUser = validate(adminUpdateUserSchema);
export const validateChangePassword  = validate(changePasswordSchema);