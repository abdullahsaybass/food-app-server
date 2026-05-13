export const PRODUCT_CATEGORIES = {
  LITER: "liter",
  FROZEN: "frozen",
  NUTS: "nuts",
  DAIRY: "dairy",
  BEVERAGES: "beverages",
  SNACKS: "snacks",
  GRAINS: "grains",
  OTHER: "other",
};

export const PRODUCT_UNITS = {
  KG: "kg",
  GRAMS: "g",
  LITERS: "L",
  ML: "ml",
  PIECES: "pcs",
  DOZEN: "dozen",
  PACK: "pack",
  BOX: "box",
};

export const PRODUCT_MESSAGES = {
  CREATED: "Product created successfully.",
  UPDATED: "Product updated successfully.",
  DELETED: "Product deleted successfully.",
  FETCHED: "Product fetched successfully.",
  LIST_FETCHED: "Products fetched successfully.",
  NOT_FOUND: "Product not found.",
  SKU_EXISTS: "A product with this SKU already exists.",
  LOW_STOCK: "Product is below stock threshold.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
};

export const PRODUCT_SORT_FIELDS = ["name", "price", "quantity", "createdAt", "category"];

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;