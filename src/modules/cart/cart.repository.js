// src/features/cart/cart.repository.js

import { Cart } from './cart.model.js';

// Select variants so the mapper can find the right unit's stock status
const POPULATE_ITEMS = {
  path:   'items.product',
  select: 'name images category isActive variants',
};

export const cartRepository = {
  // Find cart by userId (with populated products)
  findByUser: (userId) =>
    Cart.findOne({ user: userId }).populate(POPULATE_ITEMS),

  // Find cart by userId without populating (faster for writes)
  findByUserLean: (userId) =>
    Cart.findOne({ user: userId }),

  // Create a new empty cart for a user
  create: (userId) =>
    Cart.create({ user: userId, items: [] }),

  // Save a cart document (after mutating items)
  save: (cart) => cart.save(),

  // Delete a user's cart entirely
  deleteByUser: (userId) =>
    Cart.findOneAndDelete({ user: userId }),

  // Find and populate after a write (for returning updated cart)
  findAndPopulate: (userId) =>
    Cart.findOne({ user: userId }).populate(POPULATE_ITEMS),
};
