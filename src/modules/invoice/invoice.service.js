// modules/invoice/invoice.service.js
import invoiceRepository from "./invoice.repository.js";
import Invoice           from "./invoice.model.js";
import Counter           from "../order/counterModel.js";
import Product           from "../product/product.model.js";
import {
  INVOICE_STATUS,
  INVOICE_MESSAGES,
  INVOICE_NUMBER_PREFIX,
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

class InvoiceService {
  async createFromOrder(order) {
    const existing = await invoiceRepository.findByOrderId(order._id);
    if (existing) return existing;

    // Fetch product images in one query
    const productIds = (order.items || []).map((i) => i.product).filter(Boolean);
    const products   = await Product.find({ _id: { $in: productIds } }, { images: 1 }).lean();
    const imageMap   = new Map(products.map((p) => [p._id.toString(), p.images?.[0]?.url ?? null]));

    const deliveryCharge = order.deliveryCharge ?? 0;
    const itemsTotal     = order.totalAmount - deliveryCharge;

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

    return invoiceRepository.create({
      invoiceNumber,
      order:          order._id,
      user:           order.user,
      status:         INVOICE_STATUS.ISSUED,
      items,
      itemsTotal,
      deliveryCharge,
      totalAmount:    order.totalAmount,
      billingAddress: order.shippingAddress,
      paymentMethod:  order.paymentMethod,
      paymentStatus:  order.paymentStatus,
      issuedAt:       new Date(),
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

  async voidInvoice(invoiceId) {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new NotFoundError("Invoice");
    if (invoice.status === INVOICE_STATUS.VOID) {
      throw new BadRequestError(INVOICE_MESSAGES.ALREADY_VOID);
    }

    invoice.status   = INVOICE_STATUS.VOID;
    invoice.voidedAt = new Date();
    await invoiceRepository.save(invoice);
    return invoice.toObject();
  }
}

export default new InvoiceService();