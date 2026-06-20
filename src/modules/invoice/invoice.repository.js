// modules/invoice/invoice.repository.js
import Invoice from "./invoice.model.js";

class InvoiceRepository {
  async findById(id) {
    return Invoice.findById(id)
      .populate("order", "orderNumber")
      .populate("user",  "name email phone")
      .lean();
  }

  async findByOrderId(orderId) {
    return Invoice.findOne({ order: orderId })
      .populate("order", "orderNumber")
      .populate("user",  "name email phone")
      .lean();
  }

  async findByUser(userId, { page = 1, limit = 10, status } = {}) {
    const filter = { user: userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("order", "orderNumber")
        .lean(),
      Invoice.countDocuments(filter),
    ]);
    return { invoices, total };
  }

  async findAll({ page = 1, limit = 20, status, search } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.invoiceNumber = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;
    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("order", "orderNumber")
        .populate("user",  "name email phone")
        .lean(),
      Invoice.countDocuments(filter),
    ]);
    return { invoices, total };
  }

  async create(data) {
    return Invoice.create(data);
  }

  async save(invoice) {
    return invoice.save();
  }
}

export default new InvoiceRepository();