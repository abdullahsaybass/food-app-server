import * as productService from "./product.service.js";
import { toProductDTO, toProductListDTO, toCategoryDTO } from './product.mapper.js';
import { PRODUCT_MESSAGES } from "./product.constants.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const createProduct = async (
  req,
  res
) => {
  try {

    console.log(
      "REQ BODY:",
      req.body
    );

    console.log(
      "USER:",
      req.user
    );

    const product =
      await productService.createProduct(
        req.body,
        req.user.id
      );

    return res.status(201).json({
      success: true,

      message:
        PRODUCT_MESSAGES.CREATED,

      data:
        toProductDTO(product),
    });

  } catch (err) {

    console.error(
      "CREATE PRODUCT ERROR:",
      err
    );

    return res.status(400).json({
      success: false,

      message:
        err.message ||
        "Failed to create product",

      errors:
        err.errors || [],

      stack:
        process.env.NODE_ENV ===
        "development"
          ? err.stack
          : undefined,
    });
  }
};
export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  res.status(200).json({
    success: true,
    message: PRODUCT_MESSAGES.FETCHED,
    data: toProductDTO(product),
  });
});

export const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);

  res.status(200).json({
    success: true,
    message: PRODUCT_MESSAGES.FETCHED,
    data: {
      products: result.products.map(toProductDTO),
      pagination: result.pagination,
    },
  });
});
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await productService.getLowStockProducts();

  res.status(200).json({
    success: true,
    message: PRODUCT_MESSAGES.LIST_FETCHED,
    data: { products: products.map(toProductDTO) },
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(
    req.params.id,
    req.body,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: PRODUCT_MESSAGES.UPDATED,
    data: toProductDTO(product),
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);

  res.status(200).json({
    success: true,
    message: PRODUCT_MESSAGES.DELETED,
  });
});

export const softDeleteProduct = asyncHandler(async (req, res) => {
  await productService.softDeleteProduct(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: PRODUCT_MESSAGES.DELETED,
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await productService.getCategories();
  res.status(200).json({
    success: true,
    message: 'Categories fetched successfully',
    data:    categories.map(toCategoryDTO),
  });
});