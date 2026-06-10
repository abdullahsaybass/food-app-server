// src/features/cart/cart.model.js

import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Product',
      required: true,
    },
    // Which variant the user selected (e.g. "1kg", "500g")
    unit: {
      type:     String,
      required: true,
    },
    quantity: {
      type:     Number,
      required: true,
      min:      1,
      default:  1,
    },
    price: {
      type:     Number, // variant price snapshot at time of adding
      required: true,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true, // one cart per user
    },
    items:      { type: [cartItemSchema], default: [] },
    totalItems: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-compute totals before every save
cartSchema.pre('save', function () {
  this.totalItems = this.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  this.totalPrice = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
});

export const Cart = mongoose.model('Cart', cartSchema);
