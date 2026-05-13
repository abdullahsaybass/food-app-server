// src/features/products/product.routes.js

import { Router } from 'express';
import { protect, adminOnly } from '../../middleware/auth.middleware.js';
import { upload, uploadToCloud, deleteFromCloudinary } from '../../middleware/upload.middleware.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateListProducts,
  validateGetCategories
} from './product.validator.js';
import * as productController from './product.controller.js';

const router = Router();

// -----------------------------------------------------------
// 🔥 Image upload  →  POST /api/products/upload-images
// Flow: multer buffers files → uploadToCloud streams to Cloudinary
// Returns: { success: true, data: [{ url, publicId, altText }] }
// -----------------------------------------------------------
router.post(
  '/upload-images',
  protect,
  adminOnly,
  upload.array('images', 5),   // your existing multer
  uploadToCloud,                // streams buffers → Cloudinary
  (req, res) => {
    res.status(200).json({
      success: true,
      data: req.cloudinaryImages,
    });
  }
);

// -----------------------------------------------------------
// 🔥 Delete image  →  DELETE /api/products/upload-images/:publicId
// -----------------------------------------------------------
router.delete(
  '/upload-images/:publicId',
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const publicId = decodeURIComponent(req.params.publicId);
      await deleteFromCloudinary(publicId);
      res.status(200).json({ success: true, message: 'Image deleted' });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to delete image' });
    }
  }
);

// -----------------------------------------------------------
// Authenticated users
// -----------------------------------------------------------
router.get('/', protect, validateListProducts, productController.listProducts);
router.get('/categories', protect, productController.getCategories)
router.get('/low-stock', protect, adminOnly, productController.getLowStockProducts);
router.get('/:id', protect, productController.getProduct);


// -----------------------------------------------------------
// Admin only
// -----------------------------------------------------------
router.post('/', protect, adminOnly, validateCreateProduct, productController.createProduct);
router.put('/:id', protect, adminOnly, validateUpdateProduct, productController.updateProduct);
router.patch('/:id', protect, adminOnly, validateUpdateProduct, productController.updateProduct);
router.patch('/:id/deactivate', protect, adminOnly, productController.softDeleteProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

export default router;