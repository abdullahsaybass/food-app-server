// src/features/cart/cart.constants.js

export const CART_MESSAGES = {
  FETCHED:       'Cart fetched successfully',
  SYNCED:        'Cart synced successfully',
  ITEM_ADDED:    'Item added to cart',
  ITEM_UPDATED:  'Cart item updated',
  ITEM_REMOVED:  'Item removed from cart',
  CLEARED:       'Cart cleared',
};

export const CART_ERRORS = {
  PRODUCT_NOT_FOUND:     'Product not found or is no longer available',
  OUT_OF_STOCK:          'Product is out of stock',
  INVALID_QUANTITY:      'Quantity must be at least 1',
  ITEM_NOT_IN_CART:      'Item not found in cart',
};