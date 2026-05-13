// modules/order/order.service.js
import orderRepository from "./order.repository.js";
import Counter         from "./counterModel.js";
import Product         from "../product/product.model.js"; // adjust path
import User            from "../user/user.model.js";        // adjust path
import {
  ORDER_STATUS,
  CANCELLED_BY,
  USER_CANCELLABLE_STATUSES,
  ADMIN_STATUS_TRANSITIONS,
  ORDER_MESSAGES,
  ORDER_NUMBER_PREFIX,
} from "./order.constants.js";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../../utils/apiError.js"; // adjust path

// ── Generate order number: FSH0001, FSH0002... ────────────────────────────────
const generateOrderNumber = async () => {
  const seq = await Counter.nextSequence("order");
  return `${ORDER_NUMBER_PREFIX}${String(seq).padStart(4, "0")}`;
};

// ── Push to status timeline ───────────────────────────────────────────────────
const pushTimeline = (order, status, changedBy, note = null) => {
  order.statusTimeline.push({ status, changedBy, note, at: new Date() });
};

class OrderService {
  // ── Place order ─────────────────────────────────────────────────────────────
  async placeOrder(userId, { items, addressId, shippingAddress }) {
    // 1. Resolve shipping address
    let resolvedAddress;

    if (shippingAddress) {
      resolvedAddress = shippingAddress;
    } else {
      const user = await User.findById(userId);
      if (!user) throw new NotFoundError("User");
      if (!user.addresses?.length)
        throw new BadRequestError("Please add a delivery address to your profile or provide one in the request.");

      const address = addressId
        ? user.addresses.id(addressId)
        : user.addresses.find((a) => a.isDefault) ?? user.addresses[0];

      if (!address) throw new NotFoundError("Address");

      resolvedAddress = {
        label:      address.label,
        fullName:   user.name,
        phone:      user.phone,
        street:     address.street,
        city:       address.city,
        state:      address.state,
        postalCode: address.postalCode,
        country:    address.country,
      };
    }

    // 2. Fetch + validate products
    const productIds = items.map((i) => i.product);
    const products   = await Product.find({ _id: { $in: productIds }, isActive: true, isDeleted: false });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    for (const item of items) {
      const product = productMap.get(item.product.toString());
      if (!product) throw new NotFoundError(`Product ${item.product}`);
      if (product.quantity < item.quantity)
        throw new BadRequestError(
          `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${item.quantity}.`
        );
    }

    // 3. Build resolved items
    const resolvedItems = items.map((item) => {
      const p = productMap.get(item.product.toString());
      return { product: p._id, name: p.name, price: p.price, quantity: item.quantity };
    });

    const totalAmount   = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const orderNumber   = await generateOrderNumber();

    // 4. Create order with initial timeline entry
    const order = await orderRepository.create({
      orderNumber,
      user:            userId,
      items:           resolvedItems,
      shippingAddress: resolvedAddress,
      paymentMethod:   "cod",
      totalAmount,
      statusTimeline:  [{ status: ORDER_STATUS.PENDING, changedBy: userId, at: new Date() }],
    });

    // 5. Deduct stock
    await Promise.all(
      items.map((item) => Product.findByIdAndUpdate(item.product, { $inc: { quantity: -item.quantity } }))
    );

    return order;
  }

  // ── User: get single order (owns it) ─────────────────────────────────────────
  async getOrderById(orderId, userId, isAdmin = false) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order");

    if (!isAdmin && order.user._id.toString() !== userId.toString()) {
      throw new ForbiddenError(ORDER_MESSAGES.UNAUTHORIZED);
    }

    return order;
  }

  // ── User: order history ───────────────────────────────────────────────────────
  async getOrderHistory(userId, query) {
    return await orderRepository.findByUser(userId, query);
  }

  // ── Admin: all orders ─────────────────────────────────────────────────────────
  async getAllOrders(query) {
    return await orderRepository.findAllOrders(query);
  }

  // ── Admin: dashboard stats ────────────────────────────────────────────────────
  async getOrderStats() {
    return await orderRepository.getDashboardStats();
  }

  // ── Admin: recent orders ──────────────────────────────────────────────────────
  async getRecentOrders(limit = 10) {
    return await orderRepository.findRecentOrders(limit);
  }

  // ── User: cancel order ────────────────────────────────────────────────────────
  async cancelOrder(orderId, userId, cancelReason) {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order) throw new NotFoundError("Order");

    if (order.user.toString() !== userId.toString())
      throw new ForbiddenError(ORDER_MESSAGES.UNAUTHORIZED);

    if (!USER_CANCELLABLE_STATUSES.includes(order.status))
      throw new BadRequestError(ORDER_MESSAGES.CANNOT_CANCEL);

    order.status       = ORDER_STATUS.CANCELLED;
    order.cancelledBy  = CANCELLED_BY.USER;
    order.cancelReason = cancelReason || null;
    pushTimeline(order, ORDER_STATUS.CANCELLED, userId, cancelReason || null);

    await restoreStock(order.items);
    return await orderRepository.save(order);
  }

  // ── Admin: cancel order ───────────────────────────────────────────────────────
  async adminCancelOrder(orderId, adminId, cancelReason) {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order) throw new NotFoundError("Order");

    if (order.status === ORDER_STATUS.CANCELLED)
      throw new BadRequestError("Order is already cancelled.");

    if (order.status === ORDER_STATUS.DELIVERED)
      throw new BadRequestError("Cannot cancel a delivered order.");

    order.status       = ORDER_STATUS.CANCELLED;
    order.cancelledBy  = CANCELLED_BY.ADMIN;
    order.cancelReason = cancelReason || null;
    pushTimeline(order, ORDER_STATUS.CANCELLED, adminId, cancelReason || null);

    await restoreStock(order.items);
    return await orderRepository.save(order);
  }

  // ── Admin: update status ──────────────────────────────────────────────────────
  async updateOrderStatus(orderId, newStatus, adminId) {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order) throw new NotFoundError("Order");

    const allowedNext = ADMIN_STATUS_TRANSITIONS[order.status] ?? [];
    if (!allowedNext.includes(newStatus))
      throw new BadRequestError(
        `${ORDER_MESSAGES.INVALID_TRANSITION} "${order.status}" → "${newStatus}" is not allowed.`
      );

    const extra = {};

    if (newStatus === ORDER_STATUS.CANCELLED) {
      extra.cancelledBy = CANCELLED_BY.ADMIN;
      await restoreStock(order.items);
    }

    pushTimeline(order, newStatus, adminId);
    order.status = newStatus;
    Object.assign(order, extra);

    return await orderRepository.save(order);
  }
}

// ── Helper: restore stock ──────────────────────────────────────────────────────
const restoreStock = (items) =>
  Promise.all(
    items.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { quantity: item.quantity } })
    )
  );

export default new OrderService();