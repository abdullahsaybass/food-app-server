export const PRODUCT_CATEGORIES = {
  FROZEN: "frozen",

  CHICKEN: "chicken",

  BEEF: "beef",

  MUTTON: "mutton",

  SEAFOOD: "seafood",

  DAIRY: "dairy",

  NUTS: "nuts",

  DALS: "dals",

  SEEDS: "seeds",

  SPICES: "spices",

  POWDERS: "powders",

  SNACKS: "snacks",

  GRAINS: "grains",

  BEVERAGES: "beverages",

  VEGETABLES: "vegetables",

  FRUITS: "fruits",

  OTHER: "other",
};

export const PRODUCT_UNITS = {

  // SMALL WEIGHTS
  G100: "100g",

  G250: "250g",

  G500: "500g",

  // KG VARIANTS
  KG1: "1kg",

  KG2: "2kg",

  KG5: "5kg",

  KG10: "10kg",

  // GENERIC
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