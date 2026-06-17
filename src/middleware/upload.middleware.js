// src/middleware/upload.middleware.js

import multer from 'multer';
import cloudinary from '../config/cloudinary.config.js';

// ── Your existing multer (memory storage) ──
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// ── Upload a single buffer → Cloudinary via stream ──
const uploadToCloudinary = (buffer, folder = 'grocify/products') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// ── Middleware: streams all req.files buffers → Cloudinary ──
// Attaches req.cloudinaryImages = [{ url, publicId, altText }]
// Optionally set req.uploadFolder before this middleware to target a different Cloudinary folder.
export const uploadToCloud = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    const folder = req.uploadFolder || 'grocify/products';

    const uploaded = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, folder))
    );

    req.cloudinaryImages = uploaded.map((result) => ({
      url:      result.secure_url,
      publicId: result.public_id,
      altText:  '',
    }));

    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Image upload failed', error: err.message });
  }
};

// ── Delete from Cloudinary ──
export const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};