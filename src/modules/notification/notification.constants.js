// modules/notification/notification.constants.js

export const NOTIFICATION_TYPES = {
  ORDER_PLACED:          "order_placed",
  ORDER_CONFIRMED:       "order_confirmed",
  ORDER_PACKING:         "order_packing",
  ORDER_OUT_FOR_DELIVERY:"order_out_for_delivery",
  ORDER_DELIVERED:       "order_delivered",
  ORDER_CANCELLED:       "order_cancelled",
  PROMO:                 "promo",
  GENERAL:               "general",
};

// ── Order status → notification copy ────────────────────────────────────────
export const ORDER_NOTIFICATION_TEMPLATES = {
  pending: {
    type:  NOTIFICATION_TYPES.ORDER_PLACED,
    title: "Order placed!",
    body:  (orderNumber) => `Your order ${orderNumber} has been placed successfully.`,
  },
  confirmed: {
    type:  NOTIFICATION_TYPES.ORDER_CONFIRMED,
    title: "Order confirmed",
    body:  (orderNumber) => `Your order ${orderNumber} has been confirmed.`,
  },
  packing: {
    type:  NOTIFICATION_TYPES.ORDER_PACKING,
    title: "We're packing your order",
    body:  (orderNumber) => `Your order ${orderNumber} is being packed and will be on its way soon.`,
  },
  out_for_delivery: {
    type:  NOTIFICATION_TYPES.ORDER_OUT_FOR_DELIVERY,
    title: "Out for delivery!",
    body:  (orderNumber) => `Your order ${orderNumber} is out for delivery. Expect it shortly!`,
  },
  delivered: {
    type:  NOTIFICATION_TYPES.ORDER_DELIVERED,
    title: "Order delivered",
    body:  (orderNumber) => `Your order ${orderNumber} has been delivered. Enjoy!`,
  },
  cancelled: {
    type:  NOTIFICATION_TYPES.ORDER_CANCELLED,
    title: "Order cancelled",
    body:  (orderNumber) => `Your order ${orderNumber} has been cancelled.`,
  },
};

export const NOTIFICATION_MESSAGES = {
  FETCHED:         "Notifications fetched successfully.",
  MARKED_READ:     "Notification marked as read.",
  ALL_MARKED_READ: "All notifications marked as read.",
  DELETED:         "Notification deleted successfully.",
  NOT_FOUND:       "Notification not found.",
  TOKEN_SAVED:     "Device token registered successfully.",
  TOKEN_REMOVED:   "Device token removed successfully.",
};

export const DEFAULT_PAGE  = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT     = 100;