// src/features/cart/cart.mapper.js

// Maps a single cart item to DTO
const toCartItemDTO = (item) => {
  const product = item.product;
  const isPopulated = product && typeof product === 'object' && product._id;

  // Find the matching variant to show current stock status
  const variant = isPopulated
    ? product.variants?.find((v) => v.unit === item.unit) ?? null
    : null;

  return {
    product: {
      id:       isPopulated ? product._id.toString() : product.toString(),
      name:     product.name     ?? null,
      image:    product.images?.[0]?.url ?? null,
      category: product.category ?? null,
    },
    unit:    item.unit,
    quantity: item.quantity,
    price:    item.price,
    subtotal: +(item.price * item.quantity).toFixed(2),
    inStock:  variant ? variant.quantity > 0 : null,
  };
};

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
