export const toProductDTO = (product) => {
  if (!product) return null;

  const p = product.toObject
    ? product.toObject()
    : product;

  return {
    id: p._id,

    // ───────── Basic Info ─────────
    name: p.name,

    slug: p.slug,

    shortDescription:
      p.shortDescription,

    description:
      p.description,

    category: p.category,

    brand: p.brand,

    quality: p.quality,

    countryOrigin:
      p.countryOrigin,

    storageInstruction:
      p.storageInstruction,

    usageInstruction:
      p.usageInstruction,

    tags: p.tags ?? [],

    // ───────── Variants ─────────
    variants:
      p.variants?.map(
        (variant) => ({
          unit: variant.unit,

          price: variant.price,

          quantity:
            variant.quantity,

          weight:
            variant.weight,

          weightUnit:
            variant.weightUnit,

          piecesCount:
            variant.piecesCount,

          packetQuantity:
            variant.packetQuantity,

          caseQuantity:
            variant.caseQuantity,

          expiryDate:
            variant.expiryDate,

          manufactureDate:
            variant.manufactureDate,

          sku: variant.sku,

          minOrderQuantity:
            variant.minOrderQuantity,

          bulkPrice:
            variant.bulkPrice,

          stockThreshold:
            variant.stockThreshold,

          isLowStock:
            variant.quantity <=
            variant.stockThreshold,
        })
      ) ?? [],

    // ───────── Calculated Fields ─────────
    totalStock:
      p.totalStock ?? 0,

    lowStockVariants:
      p.lowStockVariants ?? [],

    inStock:
      p.inStock ?? false,

    // ───────── Images ─────────
    images: p.images ?? [],

    // ───────── Product Status ─────────
    featured:
      p.featured,

    bestSeller:
      p.bestSeller,

    newArrival:
      p.newArrival,

    halal:
      p.halal,

    frozen:
      p.frozen,

    fresh:
      p.fresh,

    isActive:
      p.isActive,

    isDeleted:
      p.isDeleted,

    // ───────── Discount ─────────
    discountPercentage:
      p.discountPercentage ?? 0,

    // ───────── Analytics ─────────
    rating:
      p.rating ?? 0,

    totalReviews:
      p.totalReviews ?? 0,

    totalSold:
      p.totalSold ?? 0,

    totalViews:
      p.totalViews ?? 0,

    // ───────── Supplier ─────────
    supplier:
      p.supplier ?? null,

    // ───────── Audit ─────────
    createdBy:
      p.createdBy,

    updatedBy:
      p.updatedBy ?? null,

    createdAt:
      p.createdAt,

    updatedAt:
      p.updatedAt,
  };
};

export const toProductListDTO = (
  products,
  pagination
) => ({
  products:
    products.map(
      toProductDTO
    ),

  pagination,
});

export const toCategoryDTO = (
  category
) => ({
  id: category,

  name:
    category.charAt(0).toUpperCase() +
    category.slice(1),
});