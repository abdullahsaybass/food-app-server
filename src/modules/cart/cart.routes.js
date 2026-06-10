// src/features/cart/cart.routes.js

import { Router }          from 'express';
import { protect }         from '../../middleware/auth.middleware.js';
import * as cartController from './cart.controller.js';
import {
  validateSyncCart,
  validateAddItem,
  validateUpdateItem,
} from './cart.validator.js';

const router = Router();

// All cart routes require login
router.use(protect);

// GET    /api/cart                          → get current user's cart
router.get('/', cartController.getCart);

// POST   /api/cart/sync                     → sync guest cart after login
router.post('/sync', validateSyncCart, cartController.syncCart);

// POST   /api/cart/items                    → add item (body: { productId, unit, quantity })
router.post('/items', validateAddItem, cartController.addItem);

// PATCH  /api/cart/items/:productId/:unit   → update item quantity
router.patch('/items/:productId/:unit', validateUpdateItem, cartController.updateItem);

// DELETE /api/cart/items/:productId/:unit   → remove single variant item
router.delete('/items/:productId/:unit', cartController.removeItem);

// DELETE /api/cart                          → clear entire cart
router.delete('/', cartController.clearCart);

export default router;
