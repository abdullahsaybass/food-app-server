import * as productRepository from "./product.repository.js";
import { PRODUCT_MESSAGES, DEFAULT_PAGE, DEFAULT_LIMIT } from "./product.constants.js";
import {
  ConflictError,
  NotFoundError,
} from "../../utils/apiError.js"; 

export const createProduct = async (data, userId) => {
  const existing = await productRepository.findBySku(data.sku);

  if (existing) {
    throw new ConflictError(PRODUCT_MESSAGES.SKU_EXISTS);
  }

  return productRepository.create({ ...data, createdBy: userId });
};

export const getProductById = async (id) => {
  const product = await productRepository.findById(id);

  if (!product) {
    throw new NotFoundError("Product");
  }

  return product;
};

export const getAllProducts = async (query) => {
  const {
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    category,
    isActive,
    lowStock,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter = {};

  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive;
  if (search) filter.$text = { $search: search };

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  let { products, total } = await productRepository.findAll({
    filter,
    sort,
    skip,
    limit,
  });

  if (lowStock) {
    products = products.filter((p) => p.quantity <= p.stockThreshold);
  }

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getLowStockProducts = async () => {
  return productRepository.findLowStock();
};

export const updateProduct = async (id, data, userId) => {
  if (data.sku) {
    const existing = await productRepository.findBySku(data.sku);

    if (existing && existing._id.toString() !== id) {
      throw new ConflictError(PRODUCT_MESSAGES.SKU_EXISTS);
    }
  }

  const product = await productRepository.updateById(id, {
    ...data,
    updatedBy: userId,
  });

  if (!product) {
    throw new NotFoundError("Product");
  }

  return product;
};

export const deleteProduct = async (id) => {
  const product = await productRepository.deleteById(id);

  if (!product) {
    throw new NotFoundError("Product");
  }

  return product;
};

export const softDeleteProduct = async (id, userId) => {
  const product = await productRepository.softDeleteById(id, userId);

  if (!product) {
    throw new NotFoundError("Product");
  }

  return product;
};

export const getCategories = async () => {
  return productRepository.findDistinctCategories();
};