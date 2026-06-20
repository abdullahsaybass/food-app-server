// modules/invoice/invoice.mapper.js
import { INVOICE_STATUS } from "./invoice.constants.js";

const STATUS_LABELS = {
  [INVOICE_STATUS.DRAFT]:  "Draft",
  [INVOICE_STATUS.ISSUED]: "Issued",
  [INVOICE_STATUS.VOID]:   "Void",
};

const mapInvoiceItem = (item) => ({
  product:  item.product ?? null,
  name:     item.name,
  image:    item.image   ?? null,
  unit:     item.unit,
  sku:      item.sku     ?? null,
  quantity: item.quantity,
  price:    item.price,
  subtotal: item.subtotal,
});

export const mapInvoice = (inv) => ({
  id:            inv._id,
  invoiceNumber: inv.invoiceNumber,
  status:        inv.status,
  statusLabel:   STATUS_LABELS[inv.status] ?? inv.status,

  order: inv.order
    ? (typeof inv.order === "object" && inv.order.orderNumber
        ? { id: inv.order._id, orderNumber: inv.order.orderNumber }
        : { id: inv.order })
    : null,

  user: inv.user
    ? (typeof inv.user === "object" && inv.user.name
        ? { id: inv.user._id, name: inv.user.name, email: inv.user.email, phone: inv.user.phone }
        : { id: inv.user })
    : null,

  items:          (inv.items || []).map(mapInvoiceItem),
  itemsTotal:     inv.itemsTotal,
  deliveryCharge: inv.deliveryCharge ?? 0,
  totalAmount:    inv.totalAmount,

  billingAddress: inv.billingAddress,
  paymentMethod:  inv.paymentMethod,
  paymentStatus:  inv.paymentStatus,

  issuedAt:  inv.issuedAt,
  voidedAt:  inv.voidedAt ?? null,
  createdAt: inv.createdAt,
  updatedAt: inv.updatedAt,
});

export const mapInvoiceList = (invoices, { page, limit, total }) => ({
  invoices: invoices.map(mapInvoice),
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});