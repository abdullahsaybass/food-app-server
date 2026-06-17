// NOTE: PRODUCT_CATEGORIES (a fixed string enum: frozen, chicken, beef, ...)
// used to live here, but categories are now a dynamic, admin-managed
// collection (see modules/category/*) referenced by product.category as an
// ObjectId — not a fixed enum. Removed to avoid confusion; nothing imported it.

export const PRODUCT_UNITS = {

  // WEIGHT / VOLUME (pair with weight + weightUnit for the actual amount,
  // e.g. unit: "kg", weight: 1, weightUnit: "kg" → "1kg")
  KG: "kg",

  GRAMS: "g",

  // LIQUID
  LITERS: "L",

  ML: "ml",

  // COUNT
  PIECES: "pcs",

  DOZEN: "dozen",

  // PACKAGING
  PACKET: "pkt",

  PACK: "pack",

  BOX: "box",

  CASE: "case",

  BAG: "bag",

  BOTTLE: "bottle",

  CAN: "can",

  TRAY: "tray",
};

export const PRODUCT_MESSAGES = {

  CREATED:
    "Product created successfully.",

  UPDATED:
    "Product updated successfully.",

  DELETED:
    "Product deleted successfully.",

  FETCHED:
    "Product fetched successfully.",

  LIST_FETCHED:
    "Products fetched successfully.",

  NOT_FOUND:
    "Product not found.",

  SKU_EXISTS:
    "A product with this SKU already exists.",

  LOW_STOCK:
    "Product is below stock threshold.",

  UNAUTHORIZED:
    "You are not authorized to perform this action.",
};

export const PRODUCT_SORT_FIELDS = [
  "name",

  "category",

  "createdAt",

  "featured",

  "bestSeller",

  "newArrival",

  "rating",

  "totalSold",

  "price",

  "isActive",
];

export const DEFAULT_PAGE = 1;

export const DEFAULT_LIMIT = 10;

export const MAX_LIMIT = 100;