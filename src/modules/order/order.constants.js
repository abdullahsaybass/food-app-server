// modules/order/order.constants.js

export const ORDER_STATUS = {
  PENDING:       "pending",        // Order Placed
  CONFIRMED:     "confirmed",      // Confirmed
  PACKING:       "packing",        // Packing
  OUT_FOR_DELIVERY: "out_for_delivery", // Out for Delivery
  DELIVERED:     "delivered",      // Delivered
  CANCELLED:     "cancelled",
};

// ── Customer-facing labels ────────────────────────────────────────────────────
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]:          "Order Placed",
  [ORDER_STATUS.CONFIRMED]:        "Confirmed",
  [ORDER_STATUS.PACKING]:          "Packing",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for Delivery",
  [ORDER_STATUS.DELIVERED]:        "Delivered",
  [ORDER_STATUS.CANCELLED]:        "Cancelled",
};

export const PAYMENT_METHOD = {
  COD: "cod",
};

export const PAYMENT_STATUS = {
  PENDING:  "pending",
  PAID:     "paid",
  REFUNDED: "refunded",
};

export const CANCELLED_BY = {
  USER:  "user",
  ADMIN: "admin",
};

export const USER_CANCELLABLE_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
];

export const ADMIN_STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]:          [ORDER_STATUS.CONFIRMED,        ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]:        [ORDER_STATUS.PACKING,          ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PACKING]:          [ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]:        [],
  [ORDER_STATUS.CANCELLED]:        [],
};

export const ORDER_NUMBER_PREFIX = "FSH";

// Default delivery charge (MVR) — 0 until set per zone from admin panel
export const DEFAULT_DELIVERY_CHARGE = 0;

// Same-day delivery: grocery orders delivered within hours
export const DELIVERY_WINDOW_HOURS = 6;

export const ORDER_MESSAGES = {
  CREATED:            "Order placed successfully.",
  FETCHED:            "Order fetched successfully.",
  LIST_FETCHED:       "Orders fetched successfully.",
  CANCELLED:          "Order cancelled successfully.",
  STATUS_UPDATED:     "Order status updated successfully.",
  NOT_FOUND:          "Order not found.",
  CANNOT_CANCEL:      "Order cannot be cancelled at this stage.",
  INVALID_TRANSITION: "Invalid status transition.",
  UNAUTHORIZED:       "You are not authorized to access this order.",
  STATS_FETCHED:      "Dashboard stats fetched successfully.",
  OUTSIDE_MALDIVES:   "We currently deliver within the Maldives only. Please choose a location inside the Maldives.",
};