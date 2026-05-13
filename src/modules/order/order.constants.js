// modules/order/order.constants.js

export const ORDER_STATUS = {
  PENDING:    "pending",
  CONFIRMED:  "confirmed",
  PROCESSING: "processing",
  SHIPPED:    "shipped",
  DELIVERED:  "delivered",
  CANCELLED:  "cancelled",
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
  [ORDER_STATUS.PENDING]:    [ORDER_STATUS.CONFIRMED,  ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]:  [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED,    ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]:    [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]:  [],
  [ORDER_STATUS.CANCELLED]:  [],
};

export const ORDER_NUMBER_PREFIX = "FSH";

export const ORDER_MESSAGES = {
  CREATED:          "Order placed successfully.",
  FETCHED:          "Order fetched successfully.",
  LIST_FETCHED:     "Orders fetched successfully.",
  CANCELLED:        "Order cancelled successfully.",
  STATUS_UPDATED:   "Order status updated successfully.",
  NOT_FOUND:        "Order not found.",
  CANNOT_CANCEL:    "Order cannot be cancelled at this stage.",
  INVALID_TRANSITION: "Invalid status transition.",
  UNAUTHORIZED:     "You are not authorized to access this order.",
  STATS_FETCHED:    "Dashboard stats fetched successfully.",
};