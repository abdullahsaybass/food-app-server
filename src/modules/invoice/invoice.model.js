// modules/invoice/invoice.model.js
import mongoose from "mongoose";
import { INVOICE_STATUS } from "./invoice.constants.js";

const invoiceItemSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    name:     { type: String, required: true },
    image:    { type: String, default: null },
    unit:     { type: String, required: true },
    sku:      { type: String, default: null },
    quantity: { type: Number, required: true, min: 1 },
    price:    { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// ── Discount snapshot (applied coupon at time of order) ───────────────────────
const discountSchema = new mongoose.Schema(
  {
    code:   { type: String, default: null },   // e.g. "SAVE20"
    amount: { type: Number, default: 0, min: 0 }, // MVR value deducted
  },
  { _id: false }
);

// ── Audit history entry ───────────────────────────────────────────────────────
const historyEntrySchema = new mongoose.Schema(
  {
    action:    { type: String, required: true },  // e.g. "Invoice Created"
    performedBy: {
      id:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      name: { type: String, default: "System" },
    },
    status: { type: String, default: null },      // e.g. "Completed"
    note:   { type: String, default: null },
    at:     { type: Date, default: Date.now },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type:   String,
      unique: true,
      index:  true,
      trim:   true,
    },

    order: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Order",
      required: true,
      unique:   true,
      index:    true,
    },

    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

    status: {
      type:    String,
      enum:    Object.values(INVOICE_STATUS),
      default: INVOICE_STATUS.ISSUED,
      index:   true,
    },

    items: { type: [invoiceItemSchema], required: true },

    itemsTotal:     { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, default: 0, min: 0 },
    discount:       { type: discountSchema, default: () => ({ code: null, amount: 0 }) },
    totalAmount:    { type: Number, required: true, min: 0 },

    billingAddress: { type: mongoose.Schema.Types.Mixed, required: true },

    paymentMethod: { type: String, default: "cod" },
    paymentStatus: { type: String, default: "pending" },

    // ── Delivery status — mirrored from order.status at invoice creation ────────
    deliveryStatus: { type: String, default: "pending" },

    // ── Optional admin/customer notes ─────────────────────────────────────────
    notes: { type: String, trim: true, default: null },

    // ── Due date (default: 7 days from issuedAt) ──────────────────────────────
    dueDate: { type: Date, default: null },

    // ── Audit history ─────────────────────────────────────────────────────────
    history: { type: [historyEntrySchema], default: [] },

    issuedAt: { type: Date, default: Date.now },
    voidedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ user: 1, createdAt: -1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
