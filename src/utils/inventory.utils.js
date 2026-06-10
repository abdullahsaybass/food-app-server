// ─────────────────────────────────────────────
// 🔥 INVENTORY UTILS
// ─────────────────────────────────────────────

// Shape a single variant for stock responses
export const toVariantStockDTO = (variant) => ({
  unit:           variant.unit,
  sku:            variant.sku ?? null,
  quantity:       variant.quantity,
  stockThreshold: variant.stockThreshold ?? 10,
  status:         getStockStatus(variant.quantity, variant.stockThreshold ?? 10),
});

// Shape a full product stock summary
export const toProductStockDTO = (product) => {
  if (!product) return null;
  const p = product.toObject ? product.toObject() : product;
  return {
    id:         p._id,
    name:       p.name,
    category:   p.category,
    isActive:   p.isActive,
    totalStock: p.variants.reduce((sum, v) => sum + v.quantity, 0),
    inStock:    p.variants.some((v) => v.quantity > 0),
    variants:   p.variants.map(toVariantStockDTO),
  };
};

// Determine stock status label
export const getStockStatus = (quantity, threshold = 10) => {
  if (quantity === 0)            return 'out_of_stock';
  if (quantity <= threshold)     return 'low_stock';
  return 'in_stock';
};