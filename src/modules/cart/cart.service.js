// src/features/cart/cart.service.js

import { cartRepository }           from './cart.repository.js';
import { CART_ERRORS }              from './cart.constants.js';
import Product                      from '../product/product.model.js';

// ── Helper: match cart item by productId + unit ───────────────────────────────
const matchesItem = (item, productId, unit) => {
  const sameProduct =
    item.product?._id?.toString() === productId ||
    item.product?.toString()      === productId;
  return sameProduct && item.unit === unit;
};

// ── Helper: get or create a user's cart ──────────────────────────────────────
const getOrCreateCart = async (userId) => {
  let cart = await cartRepository.findByUserLean(userId);
  if (!cart) cart = await cartRepository.create(userId);
  return cart;
};

// ── Helper: validate product + variant, return { product, variant } ───────────
const validateVariant = async (productId, unit) => {
  const product = await Product.findOne({ _id: productId, isActive: true, isDeleted: false });
  if (!product) throw new Error(CART_ERRORS.PRODUCT_NOT_FOUND);

  const variant = product.variants.find((v) => v.unit === unit);
  if (!variant)            throw new Error(CART_ERRORS.VARIANT_NOT_FOUND);
  if (variant.quantity <= 0) throw new Error(CART_ERRORS.OUT_OF_STOCK);

  return { product, variant };
};

// ── GET cart ──────────────────────────────────────────────────────────────────
export const getCart = async (userId) => {
  return cartRepository.findByUser(userId);
};

// ── SYNC guest cart on login ──────────────────────────────────────────────────
// guestItems: [{ productId, unit, quantity }]
export const syncCart = async (userId, guestItems = []) => {
  if (!guestItems.length) return cartRepository.findByUser(userId);

  const productIds = guestItems.map((i) => i.productId);
  const products   = await Product.find({
    _id:       { $in: productIds },
    isActive:  true,
    isDeleted: false,
  });
  const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));

  const cart = await getOrCreateCart(userId);

  for (const { productId, unit, quantity } of guestItems) {
    const product = productMap[productId];
    if (!product) continue;

    const variant = product.variants.find((v) => v.unit === unit);
    if (!variant || variant.quantity <= 0) continue;

    const qty      = Math.max(1, quantity);
    const existing = cart.items.find((i) => matchesItem(i, productId, unit));

    if (existing) {
      existing.quantity = qty;
      existing.price    = variant.price;
    } else {
      cart.items.push({
        product:  product._id,
        unit,
        quantity: qty,
        price:    variant.price,
      });
    }
  }

  await cartRepository.save(cart);
  return cartRepository.findAndPopulate(userId);
};

// ── ADD item ──────────────────────────────────────────────────────────────────
export const addItem = async (userId, productId, unit, quantity = 1) => {
  if (quantity < 1) throw new Error(CART_ERRORS.INVALID_QUANTITY);

  const { product, variant } = await validateVariant(productId, unit);
  const cart                 = await getOrCreateCart(userId);
  const existing             = cart.items.find((i) => matchesItem(i, productId, unit));

  if (existing) {
    existing.quantity += quantity;
    existing.price     = variant.price; // refresh price snapshot
  } else {
    cart.items.push({
      product:  product._id,
      unit,
      quantity,
      price:    variant.price,
    });
  }

  await cartRepository.save(cart);
  return cartRepository.findAndPopulate(userId);
};

// ── UPDATE item quantity ──────────────────────────────────────────────────────
export const updateItem = async (userId, productId, unit, quantity) => {
  if (quantity < 1) throw new Error(CART_ERRORS.INVALID_QUANTITY);

  const cart     = await getOrCreateCart(userId);
  const existing = cart.items.find((i) => matchesItem(i, productId, unit));

  if (!existing) throw new Error(CART_ERRORS.ITEM_NOT_IN_CART);

  existing.quantity = quantity;

  await cartRepository.save(cart);
  return cartRepository.findAndPopulate(userId);
};

// ── REMOVE item ───────────────────────────────────────────────────────────────
export const removeItem = async (userId, productId, unit) => {
  const cart   = await getOrCreateCart(userId);
  const before = cart.items.length;

  cart.items = cart.items.filter((i) => !matchesItem(i, productId, unit));

  if (cart.items.length === before) throw new Error(CART_ERRORS.ITEM_NOT_IN_CART);

  await cartRepository.save(cart);
  return cartRepository.findAndPopulate(userId);
};

// ── CLEAR cart ────────────────────────────────────────────────────────────────
export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cartRepository.save(cart);
  return cart;
};
