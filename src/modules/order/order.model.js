// modules/order/order.model.js
import mongoose from "mongoose";
import { ORDER_STATUS, PAYMENT_STATUS, CANCELLED_BY } from "./order.constants.js";

const orderItemSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name:     { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price:    { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    label:      { type: String, enum: ["home", "work", "other"], default: "home" },
    fullName:   { type: String, required: true, trim: true },
    phone:      { type: String, required: true, trim: true },
    street:     { type: String, required: true, trim: true },
    city:       { type: String, required: true, trim: true },
    state:      { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country:    { type: String, required: true, trim: true, default: "India" },
  },
  { _id: false }
);

// ── Status timeline entry ──────────────────────────────────────────────────────
const statusTimelineSchema = new mongoose.Schema(
  {
    status:    { type: String, enum: Object.values(ORDER_STATUS), required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    note:      { type: String, default: null },
    at:        { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // ── Auto-generated order number (FSH0001, FSH0002...) ──────────────────────
    orderNumber: {
      type:   String,
      unique: true,
      index:  true,
      trim:   true,
    },

    user:            { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true, index: true },
    items:           { type: [orderItemSchema], required: true },
    totalAmount:     { type: Number, required: true, min: 0 },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod:   { type: String, default: "cod" },
    paymentStatus:   { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },

    status: {
      type:    String,
      enum:    Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index:   true,
    },

    // ── Timeline: every status change logged ───────────────────────────────────
    statusTimeline: { type: [statusTimelineSchema], default: [] },

    cancelledBy:     { type: String, enum: Object.values(CANCELLED_BY), default: null },
    cancelReason:    { type: String, trim: true, default: null },
    statusUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "shippingAddress.phone": 1 });
orderSchema.index({ "shippingAddress.fullName": "text", orderNumber: "text" });

// ── Auto-set statusUpdatedAt on status change ──────────────────────────────────
orderSchema.pre("save", function () {
  if (this.isModified("status")) {
    this.statusUpdatedAt = new Date();
  }
});

// ── Virtual: subtotal per item ─────────────────────────────────────────────────
orderSchema.virtual("itemCount").get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

const Order = mongoose.model("Order", orderSchema);
export default Order;

