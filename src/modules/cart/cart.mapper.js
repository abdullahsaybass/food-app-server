// src/features/cart/cart.mapper.js

// Maps a single cart item to DTO
const toCartItemDTO = (item) => ({
  product: {
    id:       item.product._id?.toString() ?? item.product.toString(),
    name:     item.product.name     ?? null,
    price:    item.product.price    ?? item.price,
    image:    item.product.images?.[0]?.url ?? null,
    unit:     item.product.unit     ?? null,
    category: item.product.category ?? null,
    inStock:  item.product.quantity > 0,
  },
  quantity: item.quantity,
  price:    item.price,
  subtotal: +(item.price * item.quantity).toFixed(2),
});

// Maps full cart document to DTO
export const toCartDTO = (cart) => ({
  items:      cart.items.map(toCartItemDTO),
  totalItems: cart.totalItems,
  totalPrice: +cart.totalPrice.toFixed(2),
  updatedAt:  cart.updatedAt,
});

// Empty cart DTO (used when user has no cart yet)
export const emptyCartDTO = () => ({
  items:      [],
  totalItems: 0,
  totalPrice: 0,
  updatedAt:  null,
});