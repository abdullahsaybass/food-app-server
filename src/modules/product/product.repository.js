import Product from "./product.model.js";

// ─────────────────────────────────────────────
// 🔥 CREATE PRODUCT
// ─────────────────────────────────────────────
export const create = (data) =>
  Product.create(data);

// ─────────────────────────────────────────────
// 🔥 FIND PRODUCT BY ID
// Only active + non-deleted products
// ─────────────────────────────────────────────
export const findById = (id) =>
  Product.findOne({
    _id: id,
    isDeleted: false,
  });

// ─────────────────────────────────────────────
// 🔥 FIND PRODUCT BY VARIANT SKU
// ─────────────────────────────────────────────
export const findByVariantSku = (sku) =>
  Product.findOne({
    "variants.sku": sku?.toUpperCase(),
    isDeleted: false,
  });

// ─────────────────────────────────────────────
// 🔥 FIND ALL PRODUCTS
// ─────────────────────────────────────────────
export const findAll = async ({
  filter = {},
  sort,
  skip,
  limit,
}) => {

  const finalFilter = {
    ...filter,
    isDeleted: false,
  };

  const [products, total] =
    await Promise.all([

      Product.find(finalFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit),

      Product.countDocuments(finalFilter),
    ]);

  return {
    products,
    total,
  };
};

// ─────────────────────────────────────────────
// 🔥 FIND LOW STOCK PRODUCTS
// Checks variant stock levels
// ─────────────────────────────────────────────
export const findLowStock = async () => {

  const products = await Product.find({
    isActive: true,
    isDeleted: false,
  });

  return products.filter((product) =>
    product.variants.some(
      (variant) =>
        variant.quantity <=
        variant.stockThreshold
    )
  );
};

// ─────────────────────────────────────────────
// 🔥 UPDATE PRODUCT
// ─────────────────────────────────────────────
export const updateById = (id, data) =>
  Product.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },

    {
      $set: data,
    },

    {
      new: true,
      runValidators: true,
    }
  );

// ─────────────────────────────────────────────
// 🔥 HARD DELETE PRODUCT
// Permanently remove from DB
// ─────────────────────────────────────────────
export const deleteById = (id) =>
  Product.findByIdAndDelete(id);

// ─────────────────────────────────────────────
// 🔥 SOFT DELETE PRODUCT
// ─────────────────────────────────────────────
export const softDeleteById = (
  id,
  updatedBy
) =>
  Product.findByIdAndUpdate(
    id,

    {
      $set: {
        isActive: false,
        isDeleted: true,
        updatedBy,
      },
    },

    {
      new: true,
    }
  );

// ─────────────────────────────────────────────
// 🔥 DISTINCT CATEGORIES
// ─────────────────────────────────────────────
export const findDistinctCategories = () =>
  Product.distinct(
    "category",
    {
      isActive: true,
      isDeleted: false,
    }
  );