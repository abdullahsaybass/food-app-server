// modules/invoice/invoice.service.js
import invoiceRepository from "./invoice.repository.js";
import Invoice           from "./invoice.model.js";
import Counter           from "../order/counterModel.js";
import Product           from "../product/product.model.js";
import {
  INVOICE_STATUS,
  INVOICE_MESSAGES,
  INVOICE_NUMBER_PREFIX,
  HISTORY_ACTION,
  HISTORY_STATUS,
  DUE_DATE_DAYS,
} from "./invoice.constants.js";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../../utils/apiError.js";

const generateInvoiceNumber = async () => {
  const seq = await Counter.nextSequence("invoice");
  return `${INVOICE_NUMBER_PREFIX}${String(seq).padStart(4, "0")}`;
};

const addDays = (from, days) => {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
};

class InvoiceService {
  async createFromOrder(order, performedBy = null) {
    const existing = await invoiceRepository.findByOrderId(order._id);
    if (existing) return existing;

    // Fetch product images
    const productIds = (order.items || []).map((i) => i.product).filter(Boolean);
    const products   = await Product.find({ _id: { $in: productIds } }, { images: 1 }).lean();
    const imageMap   = new Map(products.map((p) => [p._id.toString(), p.images?.[0]?.url ?? null]));

    // ── Pricing — all fields now come directly from the order ─────────────────
    //   itemsTotal     = sum of item prices before discount          (stored on order)
    //   deliveryCharge = delivery fee                                (stored on order)
    //   discountAmount = coupon deduction                            (stored on order)
    //   totalAmount    = itemsTotal + deliveryCharge - discountAmount (stored on order)
    const itemsTotal     = order.itemsTotal     ?? order.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryCharge = order.deliveryCharge ?? 0;
    const discountAmount = order.discountAmount ?? 0;
    const couponCode     = order.couponCode     ?? null;
    const totalAmount    = order.totalAmount;

    const issuedAt = new Date();
    const dueDate  = addDays(issuedAt, DUE_DATE_DAYS);

    const items = (order.items || []).map((item) => ({
      product:  item.product,
      name:     item.name,
      image:    item.product ? (imageMap.get(item.product.toString()) ?? null) : null,
      unit:     item.unit,
      sku:      item.sku ?? null,
      quantity: item.quantity,
      price:    item.price,
      subtotal: item.quantity * item.price,
    }));

    const invoiceNumber = await generateInvoiceNumber();

    // ── Seed audit history ────────────────────────────────────────────────────
    const history = [
      {
        action:      HISTORY_ACTION.CREATED,
        performedBy: performedBy
          ? { id: performedBy._id, name: performedBy.name }
          : { id: null, name: "System" },
        status: HISTORY_STATUS.COMPLETED,
        note:   "Invoice created successfully",
        at:     issuedAt,
      },
    ];

    if (order.paymentStatus === "paid") {
      history.push({
        action:      HISTORY_ACTION.PAYMENT_RECEIVED,
        performedBy: { id: null, name: "System" },
        status:      HISTORY_STATUS.COMPLETED,
        note:        `Payment collected via ${order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}`,
        at:          issuedAt,
      });
    }

    if (order.status === "delivered") {
      history.push({
        action:      HISTORY_ACTION.MARKED_DELIVERED,
        performedBy: { id: null, name: "System" },
        status:      HISTORY_STATUS.COMPLETED,
        note:        "Order delivered to customer",
        at:          order.deliveredAt ?? issuedAt,
      });
    }

    return invoiceRepository.create({
      invoiceNumber,
      order:          order._id,
      user:           order.user,
      status:         INVOICE_STATUS.ISSUED,
      items,
      itemsTotal,
      deliveryCharge,
      discount: { code: couponCode, amount: discountAmount },
      totalAmount,
      billingAddress: order.shippingAddress,
      paymentMethod:  order.paymentMethod,
      paymentStatus:  order.paymentStatus,
      deliveryStatus: order.status,
      dueDate,
      issuedAt,
      history,
    });
  }

  async getInvoiceById(invoiceId, userId, isAdmin) {
    const invoice = await invoiceRepository.findById(invoiceId);
    if (!invoice) throw new NotFoundError("Invoice");

    if (!isAdmin && String(invoice.user?._id ?? invoice.user) !== String(userId)) {
      throw new ForbiddenError(INVOICE_MESSAGES.UNAUTHORIZED);
    }
    return invoice;
  }

  async getInvoiceByOrderId(orderId, userId, isAdmin) {
    const invoice = await invoiceRepository.findByOrderId(orderId);
    if (!invoice) throw new NotFoundError("Invoice");

    if (!isAdmin && String(invoice.user?._id ?? invoice.user) !== String(userId)) {
      throw new ForbiddenError(INVOICE_MESSAGES.UNAUTHORIZED);
    }
    return invoice;
  }

  async getMyInvoices(userId, { page = 1, limit = 10, status } = {}) {
    return invoiceRepository.findByUser(userId, { page, limit, status });
  }

  async getAllInvoices({ page = 1, limit = 20, status, search } = {}) {
    return invoiceRepository.findAll({ page, limit, status, search });
  }

  async updateNotes(invoiceId, notes, performedBy) {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new NotFoundError("Invoice");

    invoice.notes = notes ?? null;
    invoice.history.push({
      action:      HISTORY_ACTION.NOTES_UPDATED,
      performedBy: performedBy
        ? { id: performedBy._id, name: performedBy.name }
        : { id: null, name: "System" },
      status: HISTORY_STATUS.COMPLETED,
      note:   notes ? `Notes set: "${notes}"` : "Notes cleared",
      at:     new Date(),
    });

    await invoiceRepository.save(invoice);
    return invoice.toObject();
  }

  async voidInvoice(invoiceId, performedBy = null) {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new NotFoundError("Invoice");
    if (invoice.status === INVOICE_STATUS.VOID) {
      throw new BadRequestError(INVOICE_MESSAGES.ALREADY_VOID);
    }

    invoice.status   = INVOICE_STATUS.VOID;
    invoice.voidedAt = new Date();
    invoice.history.push({
      action:      HISTORY_ACTION.VOIDED,
      performedBy: performedBy
        ? { id: performedBy._id, name: performedBy.name }
        : { id: null, name: "Admin" },
      status: HISTORY_STATUS.COMPLETED,
      note:   "Invoice voided by admin",
      at:     invoice.voidedAt,
    });

    await invoiceRepository.save(invoice);
    return invoice.toObject();
  }
}

export default new InvoiceService();
