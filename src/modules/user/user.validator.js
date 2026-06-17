import Joi from "joi";
import { Readable } from "stream";
import cloudinary from "../../config/cloudinary.config.js";
import { sharedSchemas } from "../auth/auth.validator.js";
import { isMaldivesAddress } from "../../utils/geo.utils.js";

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
  type:           Joi.string().valid("home", "work", "other").default("home"),
  label:          Joi.string().trim().allow("").default(""),
  recipientName:  Joi.string().trim().allow("").default(""),
  recipientPhone: Joi.string().trim().allow("").default(""),
  street:         Joi.string().trim().required().messages({ "any.required": "Street is required" }),
  atoll:          Joi.string().trim().required().messages({ "any.required": "Atoll is required" }),
  island:         Joi.string().trim().required().messages({ "any.required": "Island is required" }),
  city:           Joi.string().trim().allow("", null).optional(),
  state:          Joi.string().trim().allow("", null).optional(),
  zip:            Joi.string().trim().required().messages({ "any.required": "Postal code is required" }),
  country: Joi.string()
    .valid("Maldives", "MV")
    .default("Maldives")
    .messages({ "any.only": "Outside Maldives is not allowed. We currently deliver within the Maldives only." }),
  location: Joi.object({
    latitude:  Joi.number().min(-90).max(90).allow(null).default(null),
    longitude: Joi.number().min(-180).max(180).allow(null).default(null),
  }).default({ latitude: null, longitude: null }),
  locationLabel: Joi.string().trim().allow("").default(""),
})
  .custom((value, helpers) => {
    if (!value.city && value.island && value.atoll) {
      value.city = `${value.island}, ${value.atoll}`;
    }
    if (!isMaldivesAddress(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  })
  .messages({ "any.invalid": "Outside Maldives is not allowed. We currently deliver within the Maldives only." });

// ─── Update Address ───────────────────────────────────────────────────────────
export const updateAddressSchema = Joi.object({
  type:           Joi.string().valid("home", "work", "other"),
  label:          Joi.string().trim().allow(""),
  recipientName:  Joi.string().trim().allow(""),
  recipientPhone: Joi.string().trim().allow(""),
  street:         Joi.string().trim(),
  atoll:          Joi.string().trim(),
  island:         Joi.string().trim(),
  city:           Joi.string().trim().allow("", null),
  state:          Joi.string().trim().allow("", null),
  zip:            Joi.string().trim(),
  country:        Joi.string().trim().valid("Maldives", "MV")
                    .messages({ "any.only": "Outside Maldives is not allowed. We currently deliver within the Maldives only." }),
  location: Joi.object({
    latitude:  Joi.number().min(-90).max(90).allow(null),
    longitude: Joi.number().min(-180).max(180).allow(null),
  }),
  locationLabel: Joi.string().trim().allow(""),
  isDefault:     Joi.boolean(),
})
  .min(1)
  .custom((value, helpers) => {
    if ((value.country || value.location) && !isMaldivesAddress(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  })
  .messages({ "any.invalid": "Outside Maldives is not allowed. We currently deliver within the Maldives only." });

// ─── Update Profile ───────────────────────────────────────────────────────────
const updateProfileSchema = Joi.object({
  name:  sharedSchemas.name,
  phone: Joi.string().trim(),
}).min(1);

// ─── Admin Update User ────────────────────────────────────────────────────────
const adminUpdateUserSchema = Joi.object({
  name:     sharedSchemas.name,
  phone:    Joi.string().trim(),
  role:     Joi.string().valid("user", "admin", "superadmin"),
  isActive: Joi.boolean(),
}).min(1);

// ─── Profile Picture Upload ───────────────────────────────────────────────────
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

// ─── Change Password ──────────────────────────────────────────────────────────
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