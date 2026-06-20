// modules/invoice/invoice.model.js
import mongoose from "mongoose";
import { INVOICE_STATUS } from "./invoice.constants.js";

const invoiceItemSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    name:     { type: String, required: true },
    image:    { type: String, default: null },   // snapshot of product's first image URL
    unit:     { type: String, required: true },
    sku:      { type: String, default: null },
    quantity: { type: Number, required: true, min: 1 },
    price:    { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
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
    totalAmount:    { type: Number, required: true, min: 0 },

    billingAddress: { type: mongoose.Schema.Types.Mixed, required: true },

    paymentMethod: { type: String, default: "cod" },
    paymentStatus: { type: String, default: "pending" },

    issuedAt: { type: Date, default: Date.now },
    voidedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ user: 1, createdAt: -1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;