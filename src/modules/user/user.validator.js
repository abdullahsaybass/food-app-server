import Joi from "joi";
import { Readable } from 'stream';
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

const addressBodySchema = Joi.object({
  label:      Joi.string().valid("home", "work", "other").default("home"),
  street:     Joi.string().trim().required().messages({ "any.required": "Street is required" }),
  city:       Joi.string().trim().required().messages({ "any.required": "City is required" }),
  state:      Joi.string().trim().required().messages({ "any.required": "State is required" }),
  postalCode: Joi.string().trim().required().messages({ "any.required": "Postal code is required" }),
  country:    Joi.string().trim().default("India"),
  isDefault:  Joi.boolean().default(false),
});

const updateProfileSchema = Joi.object({
  name:  Joi.string().min(2).max(50),
  phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/),
}).min(1);

const updateAddressSchema = Joi.object({
  label:      Joi.string().valid("home", "work", "other"),
  street:     Joi.string().trim(),
  city:       Joi.string().trim(),
  state:      Joi.string().trim(),
  postalCode: Joi.string().trim(),
  country:    Joi.string().trim(),
  isDefault:  Joi.boolean(),
}).min(1);

const adminUpdateUserSchema = Joi.object({
  name:     sharedSchemas.name,
  phone:    sharedSchemas.phone,
  role:     Joi.string().valid("user", "admin", "superadmin"),
  isActive: Joi.boolean(),
}).min(1);

// ✅ REPLACED — uploads to cloudinary instead of validating req.body
export const validateUpdateProfilePic = async (req, res, next) => {
  try {
    console.log('🔥 req.file:', req.file); // ✅ ADD THIS
    
    if (!req.file) {
      return res.status(400).json({ success: false, errors: ['No file uploaded'] });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:         'profile_pics',
          transformation: [{ width: 400, height: 400, crop: 'fill' }],
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
    console.log('❌ cloudinary error:', err); // ✅ ADD THIS
    next(err);
  }
};

export const validateUpdateProfile   = validate(updateProfileSchema);
export const validateAddAddress      = validate(addressBodySchema);
export const validateUpdateAddress   = validate(updateAddressSchema);
export const validateAdminUpdateUser = validate(adminUpdateUserSchema);