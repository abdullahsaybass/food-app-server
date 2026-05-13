export const toProductDTO = (product) => {
  if (!product) return null;
  const p = product.toObject ? product.toObject() : product;

  return {
    id: p._id,
    name: p.name,
    description: p.description,
    sku: p.sku,
    price: p.price,
    quantity: p.quantity,
    unit: p.unit,
    category: p.category,
    images: p.images ?? [],
    stockThreshold: p.stockThreshold,
    isLowStock: p.isLowStock ?? p.quantity <= p.stockThreshold,
    isActive: p.isActive,
    createdBy: p.createdBy,
    updatedBy: p.updatedBy ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

export const toProductListDTO = (products, pagination) => ({
  products: products.map(toProductDTO),
  pagination,
});

export const toCategoryDTO = (category) => ({
  id:   category,
  name: category.charAt(0).toUpperCase() + category.slice(1),
});