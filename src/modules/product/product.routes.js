import { Router } from 'express';
import { protect, adminOnly, optionalAuth } from '../../middleware/auth.middleware.js';
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
// -----------------------------------------------------------
router.post(
  '/upload-images',
  protect,
  adminOnly,
  upload.array('images', 5),
  uploadToCloud,
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
// 🌐 Public (guests + logged-in users can browse)
// optionalAuth: attaches req.user if logged in, null if guest
// -----------------------------------------------------------
router.get('/',            optionalAuth, validateListProducts, productController.listProducts);
router.get('/categories',  optionalAuth, productController.getCategories);
router.get('/:id',         optionalAuth, productController.getProduct);

// -----------------------------------------------------------
// 🔒 Admin only — require login
// -----------------------------------------------------------
router.get('/low-stock',   protect, adminOnly, productController.getLowStockProducts);
router.post('/',           protect, adminOnly, validateCreateProduct,  productController.createProduct);
router.put('/:id',         protect, adminOnly, validateUpdateProduct,  productController.updateProduct);
router.patch('/:id',       protect, adminOnly, validateUpdateProduct,  productController.updateProduct);
router.patch('/:id/deactivate', protect, adminOnly, productController.softDeleteProduct);
router.delete('/:id',      protect, adminOnly, productController.deleteProduct);

export default router;