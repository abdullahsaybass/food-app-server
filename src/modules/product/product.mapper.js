export const toProductDTO = (product) => {
  if (!product) return null;

  const p = product.toObject ? product.toObject() : product;

  return {
    id: p._id,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,

    // ✅ category is now a full object from populate
    category: p.category
      ? {
          id: p.category._id ?? p.category,
          name: p.category.name ?? null,
          key: p.category.key ?? null,
          slug: p.category.slug ?? null,
          image: p.category.image ?? null,
        }
      : null,

    brand: p.brand,
    quality: p.quality,
    countryOrigin: p.countryOrigin,
    storageInstruction: p.storageInstruction,
    usageInstruction: p.usageInstruction,
    tags: p.tags ?? [],

    variants:
      p.variants?.map((v) => ({
        unit: v.unit,
        price: v.price,
        quantity: v.quantity,
        weight: v.weight,
        weightUnit: v.weightUnit,
        piecesCount: v.piecesCount,
        packetQuantity: v.packetQuantity,
        caseQuantity: v.caseQuantity,
        expiryDate: v.expiryDate,
        manufactureDate: v.manufactureDate,
        sku: v.sku,
        minOrderQuantity: v.minOrderQuantity,
        bulkPrice: v.bulkPrice,
        stockThreshold: v.stockThreshold,
        isLowStock: v.quantity <= v.stockThreshold,
      })) ?? [],

    totalStock: p.totalStock ?? 0,
    lowStockVariants: p.lowStockVariants ?? [],
    inStock: p.inStock ?? false,
    images: p.images ?? [],

    featured: p.featured,
    bestSeller: p.bestSeller,
    newArrival: p.newArrival,
    halal: p.halal,
    frozen: p.frozen,
    fresh: p.fresh,
    isActive: p.isActive,
    isDeleted: p.isDeleted,

    discountPercentage: p.discountPercentage ?? 0,
    rating: p.rating ?? 0,
    totalReviews: p.totalReviews ?? 0,
    totalSold: p.totalSold ?? 0,
    totalViews: p.totalViews ?? 0,

    supplier: p.supplier ?? null,
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