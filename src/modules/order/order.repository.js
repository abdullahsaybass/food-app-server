// modules/order/order.repository.js
import Order from "./order.model.js";

class OrderRepository {
  // ── Create ─────────────────────────────────────────────────────────────────
  async create(orderData) {
    const order = new Order(orderData);
    return await order.save();
  }

  // ── Find by ID (populated) — used by both user + admin ────────────────────
  async findById(orderId) {
    return await Order.findById(orderId)
      .populate("items.product", "name images slug")
      .populate("user", "name email phone")
      .lean();
  }

  async findByIdRaw(orderId) {
    return await Order.findById(orderId);
  }

  // ── User: own orders only ──────────────────────────────────────────────────
  async findByUser(userId, { page, limit, status }) {
    const filter = { user: userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("items.product", "name images slug")
        .lean(),
      Order.countDocuments(filter),
    ]);

    return { orders, total };
  }

  // ── Admin: all orders with search + filters ────────────────────────────────
  async findAllOrders({ page, limit, status, paymentStatus, search, sortBy = "createdAt", sortOrder = "desc" }) {
    const filter = {};

    if (status)        filter.status        = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Search by orderNumber, customer name, or phone
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { orderNumber:                  regex },
        { "shippingAddress.fullName":   regex },
        { "shippingAddress.phone":      regex },
      ];
    }

    const skip      = (page - 1) * limit;
    const sortDir   = sortOrder === "asc" ? 1 : -1;
    const sortQuery = { [sortBy]: sortDir };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate("items.product", "name images")
        .populate("user", "name email phone")
        .lean(),
      Order.countDocuments(filter),
    ]);

    return { orders, total };
  }

  // ── Admin: recent orders for dashboard widget ──────────────────────────────
  async findRecentOrders(limit = 10) {
    return await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "name email")
      .lean();
  }

  // ── Admin: dashboard stats ─────────────────────────────────────────────────
  async getDashboardStats() {
    const now       = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Status counts + total revenue in one aggregation
    const [statusStats, todayCount, monthlyRevenue] = await Promise.all([

      // All-time counts + revenue
      Order.aggregate([
        {
          $group: {
            _id:           "$status",
            count:         { $sum: 1 },
            totalRevenue:  { $sum: "$totalAmount" },
          },
        },
      ]),

      // Today's orders
      Order.countDocuments({ createdAt: { $gte: todayStart } }),

      // Monthly revenue — last 12 months
      Order.aggregate([
        {
          $match: {
            status:    "delivered",
            createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) },
          },
        },
        {
          $group: {
            _id: {
              year:  { $year:  "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    // Shape status stats into a map
    const statusMap = {
      pending:    { count: 0, revenue: 0 },
      confirmed:  { count: 0, revenue: 0 },
      processing: { count: 0, revenue: 0 },
      shipped:    { count: 0, revenue: 0 },
      delivered:  { count: 0, revenue: 0 },
      cancelled:  { count: 0, revenue: 0 },
    };

    let totalOrders  = 0;
    let totalRevenue = 0;

    for (const s of statusStats) {
      if (statusMap[s._id]) {
        statusMap[s._id].count   = s.count;
        statusMap[s._id].revenue = s.totalRevenue;
      }
      totalOrders  += s.count;
      if (s._id !== "cancelled") totalRevenue += s.totalRevenue;
    }

    return {
      totalOrders,
      totalRevenue,
      todayOrders: todayCount,
      pending:     statusMap.pending.count,
      confirmed:   statusMap.confirmed.count,
      processing:  statusMap.processing.count,
      shipped:     statusMap.shipped.count,
      delivered:   statusMap.delivered.count,
      cancelled:   statusMap.cancelled.count,
      monthlyRevenue,
    };
  }

  // ── Update status ──────────────────────────────────────────────────────────
  async updateStatus(orderId, status, extra = {}) {
    return await Order.findByIdAndUpdate(
      orderId,
      { $set: { status, statusUpdatedAt: new Date(), ...extra } },
      { new: true }
    ).lean();
  }

  async save(orderDoc) {
    return await orderDoc.save();
  }
}

export default new OrderRepository();