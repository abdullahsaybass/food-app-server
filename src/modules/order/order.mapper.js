// modules/order/order.mapper.js

const mapOrderItem = (item) => ({
  product:  item.product
    ? { id: item.product._id, name: item.product.name, image: item.product.images?.[0] ?? null }
    : { id: item.product },
  name:     item.name,
  quantity: item.quantity,
  price:    item.price,
  subtotal: item.quantity * item.price,
});

export const mapOrder = (order) => ({
  id:              order._id,
  orderNumber:     order.orderNumber,
  status:          order.status,
  paymentMethod:   order.paymentMethod,
  paymentStatus:   order.paymentStatus,
  totalAmount:     order.totalAmount,
  items:           (order.items || []).map(mapOrderItem),
  shippingAddress: order.shippingAddress,
  statusTimeline:  order.statusTimeline ?? [],
  cancelledBy:     order.cancelledBy  ?? null,
  cancelReason:    order.cancelReason ?? null,
  statusUpdatedAt: order.statusUpdatedAt,
  createdAt:       order.createdAt,
  updatedAt:       order.updatedAt,
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