// modules/order/order.mapper.js
import { ORDER_STATUS_LABELS } from "./order.constants.js";

const mapOrderItem = (item) => ({
  product: item.product
    ? { id: item.product._id, name: item.product.name, image: item.product.images?.[0] ?? null }
    : { id: item.product },
  name:     item.name,
  unit:     item.unit,
  sku:      item.sku ?? null,
  quantity: item.quantity,
  price:    item.price,
  subtotal: item.quantity * item.price,
});

const mapTimelineEntry = (entry) => ({
  status:      entry.status,
  statusLabel: ORDER_STATUS_LABELS[entry.status] ?? entry.status,
  note:        entry.note ?? null,
  at:          entry.at,
});

export const mapOrder = (order) => ({
  id:                  order._id,
  orderNumber:         order.orderNumber,
  status:              order.status,
  statusLabel:         ORDER_STATUS_LABELS[order.status] ?? order.status,
  paymentMethod:       order.paymentMethod,
  paymentStatus:       order.paymentStatus,

  // ── Full pricing breakdown ─────────────────────────────────────────────────
  itemsTotal:          order.itemsTotal    ?? (order.totalAmount - (order.deliveryCharge ?? 0) + (order.discountAmount ?? 0)),
  deliveryCharge:      order.deliveryCharge  ?? 0,
  couponCode:          order.couponCode      ?? null,
  discountAmount:      order.discountAmount  ?? 0,
  totalAmount:         order.totalAmount,

  items:               (order.items || []).map(mapOrderItem),
  shippingAddress:     order.shippingAddress,
  statusTimeline:      (order.statusTimeline ?? []).map(mapTimelineEntry),
  estimatedDeliveryAt: order.estimatedDeliveryAt ?? null,
  deliveredAt:         order.deliveredAt ?? null,
  cancelledBy:         order.cancelledBy  ?? null,
  cancelReason:        order.cancelReason ?? null,
  statusUpdatedAt:     order.statusUpdatedAt,
  createdAt:           order.createdAt,
  updatedAt:           order.updatedAt,
  // admin-populated field
  user: order.user
    ? { id: order.user._id, name: order.user.name, email: order.user.email, phone: order.user.phone }
    : undefined,
});

export const mapOrderList = (orders, { page, limit, total }) => ({
  orders: orders.map(mapOrder),
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});
