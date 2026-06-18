// src/middleware/upload.middleware.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// ── Base directory where all uploaded images are stored ──
// Files are served statically from /uploads (see app.js: app.use('/uploads', express.static(...)))
const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');

// Ensure a given subfolder exists (e.g. public/uploads/products)
const ensureDir = (folder) => {
  const dir = path.join(UPLOAD_ROOT, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// ── Multer: keep files in memory so we can resize with sharp before saving ──
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

// ── Save one image buffer to disk (resized + compressed), return its public URL ──
// folder: subfolder under public/uploads, e.g. 'products', 'categories', 'profile_pics'
// options: { width, height, fit } passed to sharp resize
const saveImageToDisk = async (buffer, folder = 'products', options = {}) => {
  const { width = 800, height = 800, fit = 'inside' } = options;

  const dir = ensureDir(folder);
  const filename = `${uuidv4()}.webp`;
  const filepath = path.join(dir, filename);

  await sharp(buffer)
    .resize(width, height, { fit, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(filepath);

  const publicId = `${folder}/${filename}`; // used later for deletion
  const url = `/uploads/${publicId}`;       // relative path; combine with your domain on the client

  return { url, publicId };
};

// ── Middleware: saves all req.files buffers to disk ──
// Attaches req.uploadedImages = [{ url, publicId, altText }]
// Optionally set req.uploadFolder before this middleware to target a different subfolder.
export const uploadToCloud = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    const folder = req.uploadFolder || 'products';

    const uploaded = await Promise.all(
      req.files.map((file) => saveImageToDisk(file.buffer, folder))
    );

    req.uploadedImages = uploaded.map((result) => ({
      url:      result.url,
      publicId: result.publicId,
      altText:  '',
    }));

    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Image upload failed', error: err.message });
  }
};

// ── Delete an image from disk given its publicId (e.g. 'products/abc123.webp') ──
export const deleteFromCloudinary = async (publicId) => {
  const filepath = path.join(UPLOAD_ROOT, publicId);

  // Guard against path traversal — resolved path must stay within UPLOAD_ROOT
  const resolved = path.resolve(filepath);
  if (!resolved.startsWith(path.resolve(UPLOAD_ROOT))) {
    throw new Error('Invalid publicId');
  }

  if (fs.existsSync(resolved)) {
    fs.unlinkSync(resolved);
  }
};
