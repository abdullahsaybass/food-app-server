import Product from "./product.model.js";

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────
export const create = (data) => Product.create(data);

// ─────────────────────────────────────────────
// FIND BY ID
// Only active + non-deleted products
// ─────────────────────────────────────────────
export const findById = (id) =>
  Product.findOne({
    _id: id,
    isDeleted: false,
  });

// ─────────────────────────────────────────────
// FIND BY SKU
// ─────────────────────────────────────────────
export const findBySku = (sku) =>
  Product.findOne({
    sku: sku?.toUpperCase(),
    isDeleted: false,
  });

// ─────────────────────────────────────────────
// FIND ALL PRODUCTS
// ─────────────────────────────────────────────
export const findAll = async ({ filter = {}, sort, skip, limit }) => {
  const finalFilter = {
    ...filter,
    isDeleted: false,
  };

  const [products, total] = await Promise.all([
    Product.find(finalFilter)
      .sort(sort)
      .skip(skip)
      .limit(limit),

    Product.countDocuments(finalFilter),
  ]);

  return { products, total };
};

// ─────────────────────────────────────────────
// LOW STOCK PRODUCTS
// ─────────────────────────────────────────────
export const findLowStock = () =>
  Product.find({
    isActive: true,
    isDeleted: false,
  }).then((products) =>
    products.filter(
      (product) => product.quantity <= product.stockThreshold
    )
  );

// ─────────────────────────────────────────────
// UPDATE PRODUCT
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
// HARD DELETE PRODUCT
// Permanently removes from DB
// ─────────────────────────────────────────────
export const deleteById = (id) =>
  Product.findByIdAndDelete(id);

// ─────────────────────────────────────────────
// SOFT DELETE PRODUCT
// ─────────────────────────────────────────────
export const softDeleteById = (id, updatedBy) =>
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
// DISTINCT CATEGORIES
// ─────────────────────────────────────────────
export const findDistinctCategories = () =>
  Product.distinct('category', { isActive: true, isDeleted: false });