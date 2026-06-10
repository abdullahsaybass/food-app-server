// ─────────────────────────────────────────────
// 🔥 INVENTORY ROUTES
// All routes are admin-only
// ─────────────────────────────────────────────
import { Router } from 'express';
import { protect, adminOnly } from '../../middleware/auth.middleware.js';
import {
  validateAdjust,
  validateSet,
  validateThreshold,
  validateBulk,
} from './inventory.validator.js';
import * as ctrl from './inventory.controller.js';

const router = Router();

// All inventory routes require admin
router.use(protect, adminOnly);

// ─── READ ─────────────────────────────────────────────────────
// GET  /api/inventory/low-stock         → all low-stock products
router.get('/low-stock',                  ctrl.getLowStock);

// GET  /api/inventory/out-of-stock      → all out-of-stock products
router.get('/out-of-stock',              ctrl.getOutOfStock);

// GET  /api/inventory/:productId        → stock for one product
router.get('/:productId',                ctrl.getProductStock);

// ─── WRITE ────────────────────────────────────────────────────
// POST  /api/inventory/bulk             → bulk set stock for many variants
router.post('/bulk',                     validateBulk,      ctrl.bulkSetStock);

// PATCH /api/inventory/:productId/adjust  → add/subtract stock
router.patch('/:productId/adjust',       validateAdjust,    ctrl.adjustStock);

// PATCH /api/inventory/:productId/set     → hard-set quantity
router.patch('/:productId/set',          validateSet,       ctrl.setStock);

// PATCH /api/inventory/:productId/threshold → update low-stock threshold
router.patch('/:productId/threshold',    validateThreshold, ctrl.updateThreshold);

export default router;