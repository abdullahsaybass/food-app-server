import Product from "./product.model.js";

export const create = (data) => Product.create(data);

// ✅ All queries now populate category with name, key, slug, image
export const findById = (id) =>
  Product.findOne({ _id: id, isDeleted: false })
    .populate("category", "name key slug image isActive");

export const findByVariantSku = (sku) =>
  Product.findOne({ "variants.sku": sku?.toUpperCase(), isDeleted: false })
    .populate("category", "name key slug image isActive");

export const findAll = async ({ filter = {}, sort, skip, limit }) => {
  const finalFilter = { ...filter, isDeleted: false };

  const [products, total] = await Promise.all([
    Product.find(finalFilter)
      .populate("category", "name key slug image isActive")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(finalFilter),
  ]);

  return { products, total };
};

export const findLowStock = async () => {
  const products = await Product.find({ isActive: true, isDeleted: false })
    .populate("category", "name key slug image isActive");

  return products.filter((p) =>
    p.variants.some((v) => v.quantity <= v.stockThreshold)
  );
};

export const updateById = (id, data) =>
  Product.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  ).populate("category", "name key slug image isActive");

export const deleteById = (id) => Product.findByIdAndDelete(id);

export const softDeleteById = (id, updatedBy) =>
  Product.findByIdAndUpdate(
    id,
    { $set: { isActive: false, isDeleted: true, updatedBy } },
    { new: true }
  );

export const findDistinctCategories = () =>
  Product.distinct("category", { isActive: true, isDeleted: false });