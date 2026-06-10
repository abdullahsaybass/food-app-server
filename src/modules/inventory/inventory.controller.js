// ─────────────────────────────────────────────
// 🔥 INVENTORY CONTROLLER
// ─────────────────────────────────────────────
import asyncHandler from '../../utils/asyncHandler.js';
import * as inventoryService from './inventory.service.js';
import { toProductStockDTO } from '../../utils/inventory.utils.js';

// ── GET /api/inventory/:productId
// Get full stock summary for one product
export const getProductStock = asyncHandler(async (req, res) => {
  const product = await inventoryService.getProductStock(req.params.productId);

  res.status(200).json({
    success: true,
    message: 'Stock fetched successfully.',
    data:    toProductStockDTO(product),
  });
});

// ── GET /api/inventory/low-stock
// All products where any variant is at/below threshold
export const getLowStock = asyncHandler(async (req, res) => {
  const products = await inventoryService.getLowStockProducts();

  res.status(200).json({
    success: true,
    message: 'Low stock products fetched.',
    data:    products.map(toProductStockDTO),
  });
});

// ── GET /api/inventory/out-of-stock
// All products where any variant is at 0
export const getOutOfStock = asyncHandler(async (req, res) => {
  const products = await inventoryService.getOutOfStockProducts();

  res.status(200).json({
    success: true,
    message: 'Out of stock products fetched.',
    data:    products.map(toProductStockDTO),
  });
});

// ── PATCH /api/inventory/:productId/adjust
// Add (+) or subtract (-) stock for a variant
// Body: { unit, delta, note? }
export const adjustStock = asyncHandler(async (req, res) => {
  const { unit, delta, note } = req.body;
  const product = await inventoryService.adjustStock(
    req.params.productId,
    unit,
    delta,
    note
  );

  res.status(200).json({
    success: true,
    message: `Stock ${delta > 0 ? 'added' : 'reduced'} successfully.`,
    data:    toProductStockDTO(product),
  });
});

// ── PATCH /api/inventory/:productId/set
// Hard-set stock for a variant to exact quantity
// Body: { unit, quantity, note? }
export const setStock = asyncHandler(async (req, res) => {
  const { unit, quantity } = req.body;
  const product = await inventoryService.setStock(
    req.params.productId,
    unit,
    quantity
  );

  res.status(200).json({
    success: true,
    message: 'Stock updated successfully.',
    data:    toProductStockDTO(product),
  });
});

// ── POST /api/inventory/bulk
// Update many variants at once
// Body: { updates: [{ productId, unit, quantity }] }
export const bulkSetStock = asyncHandler(async (req, res) => {
  const { updates } = req.body;
  const results = await inventoryService.bulkSetStock(updates);

  res.status(200).json({
    success: true,
    message: `${results.length} product(s) stock updated.`,
    data:    results.map(toProductStockDTO),
  });
});

// ── PATCH /api/inventory/:productId/threshold
// Update the low-stock alert threshold for a variant
// Body: { unit, threshold }
export const updateThreshold = asyncHandler(async (req, res) => {
  const { unit, threshold } = req.body;
  const product = await inventoryService.updateThreshold(
    req.params.productId,
    unit,
    threshold
  );

  res.status(200).json({
    success: true,
    message: 'Stock threshold updated.',
    data:    toProductStockDTO(product),
  });
});