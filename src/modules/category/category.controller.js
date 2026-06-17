// modules/category/category.controller.js
import categoryService from "./category.service.js";
import { mapCategory, mapCategoryList } from "./category.mapper.js";
import { CATEGORY_MESSAGES } from "./category.constants.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.create(req.validatedBody, req.user._id);
  res.status(201).json({
    success: true,
    message: CATEGORY_MESSAGES.CREATED,
    data:    mapCategory(category),
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const activeOnly = req.query.activeOnly !== "false"; // default true for public
  const categories = await categoryService.getAll(activeOnly);
  res.status(200).json({
    success: true,
    message: CATEGORY_MESSAGES.LIST_FETCHED,
    data:    mapCategoryList(categories),
  });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getById(req.params.id);
  res.status(200).json({
    success: true,
    message: CATEGORY_MESSAGES.FETCHED,
    data:    mapCategory(category),
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.update(req.params.id, req.validatedBody, req.user._id);
  res.status(200).json({
    success: true,
    message: CATEGORY_MESSAGES.UPDATED,
    data:    mapCategory(category),
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.remove(req.params.id);
  res.status(200).json({
    success: true,
    message: CATEGORY_MESSAGES.DELETED,
    data:    null,
  });
});
