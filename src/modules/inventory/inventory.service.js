// ─────────────────────────────────────────────
// 🔥 INVENTORY SERVICE
// ─────────────────────────────────────────────
import * as repo from './inventory.repository.js';
import { NotFoundError, BadRequestError } from '../../utils/apiError.js';

// ── GET stock for one product ─────────────────
export const getProductStock = async (productId) => {
  const product = await repo.getStockByProductId(productId);
  if (!product) throw new NotFoundError('Product');
  return product;
};

// ── GET all low-stock products ────────────────
export const getLowStockProducts = async () => {
  const products = await repo.getLowStockProducts();
  return products.filter((p) =>
    p.variants.some((v) => v.quantity <= v.stockThreshold)
  );
};

// ── GET all out-of-stock products ─────────────
export const getOutOfStockProducts = async () => {
  const products = await repo.getOutOfStockProducts();
  return products.filter((p) =>
    p.variants.some((v) => v.quantity === 0)
  );
};

// ── ADJUST stock (add/subtract) ───────────────
export const adjustStock = async (productId, unit, delta, note) => {
  if (delta === 0) throw new BadRequestError('Delta cannot be 0.');

  // if reducing, check we won't go negative
  if (delta < 0) {
    const product = await repo.getStockByProductId(productId);
    if (!product) throw new NotFoundError('Product');
    const variant = product.variants.find((v) => v.unit === unit);
    if (!variant) throw new BadRequestError(`Variant "${unit}" not found.`);
    if (variant.quantity + delta < 0)
      throw new BadRequestError(
        `Cannot reduce stock below 0. Current: ${variant.quantity}, Requested: ${Math.abs(delta)}.`
      );
  }

  const updated = await repo.adjustVariantStock(productId, unit, delta);
  if (!updated) throw new NotFoundError(`Product or variant "${unit}" not found.`);
  return updated;
};

// ── SET stock (hard set) ──────────────────────
export const setStock = async (productId, unit, quantity) => {
  if (quantity < 0) throw new BadRequestError('Quantity cannot be negative.');

  const updated = await repo.setVariantStock(productId, unit, quantity);
  if (!updated) throw new NotFoundError(`Product or variant "${unit}" not found.`);
  return updated;
};

// ── BULK SET stock ────────────────────────────
// updates: [{ productId, unit, quantity }]
export const bulkSetStock = async (updates) => {
  if (!updates?.length) throw new BadRequestError('No updates provided.');

  for (const u of updates) {
    if (u.quantity < 0) throw new BadRequestError(`Quantity cannot be negative (${u.unit}).`);
  }

  const results = await repo.bulkSetStock(updates);
  return results.filter(Boolean); // remove nulls (not-found items)
};

// ── UPDATE stock threshold for a variant ──────
export const updateThreshold = async (productId, unit, threshold) => {
  if (threshold < 0) throw new BadRequestError('Threshold cannot be negative.');
  const updated = await repo.setVariantThreshold(productId, unit, threshold);
  if (!updated) throw new NotFoundError(`Product or variant "${unit}" not found.`);
  return updated;
};