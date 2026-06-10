// ─────────────────────────────────────────────
// 🔥 INVENTORY REPOSITORY
// ─────────────────────────────────────────────
import Product from '../product/product.model.js';

// ─── GET STOCK for one product ───────────────
export const getStockByProductId = (id) =>
  Product.findOne({ _id: id, isDeleted: false })
    .select('name variants totalStock inStock lowStockVariants isActive');

// ─── GET STOCK for one variant (by sku) ──────
export const getStockBySku = (sku) =>
  Product.findOne({ 'variants.sku': sku.toUpperCase(), isDeleted: false })
    .select('name variants');

// ─── GET ALL LOW STOCK products ───────────────
// A product is low-stock if ANY variant.quantity <= variant.stockThreshold
export const getLowStockProducts = () =>
  Product.find({ isActive: true, isDeleted: false })
    .select('name category variants images isActive');

// ─── GET ALL OUT OF STOCK products ───────────
export const getOutOfStockProducts = () =>
  Product.find({
    isActive:  true,
    isDeleted: false,
    'variants.quantity': 0,
  }).select('name category variants images');

// ─── UPDATE STOCK for a single variant ────────
// delta: +N to add stock, -N to deduct
export const adjustVariantStock = (productId, unit, delta) =>
  Product.findOneAndUpdate(
    {
      _id:           productId,
      isDeleted:     false,
      'variants.unit': unit,
    },
    { $inc: { 'variants.$[v].quantity': delta } },
    {
      arrayFilters:   [{ 'v.unit': unit }],
      new:            true,
      runValidators:  true,
    }
  );

// ─── SET STOCK (hard set, not delta) ──────────
export const setVariantStock = (productId, unit, quantity) =>
  Product.findOneAndUpdate(
    {
      _id:             productId,
      isDeleted:       false,
      'variants.unit': unit,
    },
    { $set: { 'variants.$[v].quantity': quantity } },
    {
      arrayFilters:   [{ 'v.unit': unit }],
      new:            true,
      runValidators:  true,
    }
  );

// ─── BULK UPDATE STOCK for many variants ──────
// updates: [{ productId, unit, quantity }]
export const bulkSetStock = (updates) =>
  Promise.all(
    updates.map(({ productId, unit, quantity }) =>
      setVariantStock(productId, unit, quantity)
    )
  );

// ─── UPDATE stock threshold for a variant ─────
export const setVariantThreshold = (productId, unit, threshold) =>
  Product.findOneAndUpdate(
    {
      _id:             productId,
      isDeleted:       false,
      'variants.unit': unit,
    },
    { $set: { 'variants.$[v].stockThreshold': threshold } },
    {
      arrayFilters:  [{ 'v.unit': unit }],
      new:           true,
    }
  );