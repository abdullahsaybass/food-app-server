import * as productRepository from "./product.repository.js";

import {
  PRODUCT_MESSAGES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
} from "./product.constants.js";

import {
  NotFoundError,
} from "../../utils/apiError.js";

// ─────────────────────────────────────────────
// 🔥 CREATE PRODUCT
// ─────────────────────────────────────────────
export const createProduct = async (
  data,
  userId
) => {

  return productRepository.create({
    ...data,
    createdBy: userId,
  });

};

// ─────────────────────────────────────────────
// 🔥 GET PRODUCT BY ID
// ─────────────────────────────────────────────
export const getProductById = async (
  id
) => {

  const product =
    await productRepository.findById(id);

  if (!product) {
    throw new NotFoundError("Product");
  }

  return product;

};

// ─────────────────────────────────────────────
// 🔥 GET ALL PRODUCTS
// ─────────────────────────────────────────────
export const getAllProducts = async (
  query
) => {

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

  // CATEGORY
  if (category) {
    filter.category = category;
  }

  // ACTIVE
  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  // SEARCH
  if (search) {
    filter.$text = {
      $search: search,
    };
  }

  // SORT
  const sort = {
    [sortBy]:
      sortOrder === "asc" ? 1 : -1,
  };

  // PAGINATION
  const skip = (page - 1) * limit;

  let { products, total } =
    await productRepository.findAll({
      filter,
      sort,
      skip,
      limit,
    });

  // LOW STOCK FILTER
  if (lowStock) {

    products = products.filter((p) =>
      p.variants.some(
        (v) =>
          v.quantity <=
          v.stockThreshold
      )
    );

  }

  return {
    products,

    pagination: {
      page,
      limit,
      total,

      totalPages: Math.ceil(
        total / limit
      ),
    },
  };

};

// ─────────────────────────────────────────────
// 🔥 GET LOW STOCK PRODUCTS
// ─────────────────────────────────────────────
export const getLowStockProducts =
  async () => {

    return productRepository.findLowStock();

  };

// ─────────────────────────────────────────────
// 🔥 UPDATE PRODUCT
// ─────────────────────────────────────────────
export const updateProduct = async (
  id,
  data,
  userId
) => {

  const product =
    await productRepository.updateById(
      id,
      {
        ...data,
        updatedBy: userId,
      }
    );

  if (!product) {
    throw new NotFoundError("Product");
  }

  return product;

};

// ─────────────────────────────────────────────
// 🔥 HARD DELETE PRODUCT
// ─────────────────────────────────────────────
export const deleteProduct = async (
  id
) => {

  const product =
    await productRepository.deleteById(
      id
    );

  if (!product) {
    throw new NotFoundError("Product");
  }

  return product;

};

// ─────────────────────────────────────────────
// 🔥 SOFT DELETE PRODUCT
// ─────────────────────────────────────────────
export const softDeleteProduct =
  async (id, userId) => {

    const product =
      await productRepository.softDeleteById(
        id,
        userId
      );

    if (!product) {
      throw new NotFoundError(
        "Product"
      );
    }

    return product;

  };

// ─────────────────────────────────────────────
// 🔥 GET CATEGORIES
// ─────────────────────────────────────────────
export const getCategories =
  async () => {

    return productRepository.findDistinctCategories();

  };