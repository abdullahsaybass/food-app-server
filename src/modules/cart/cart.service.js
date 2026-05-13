// src/features/cart/cart.service.js

import { cartRepository }            from './cart.repository.js';
import { CART_ERRORS }               from './cart.constants.js';
import Product from '../product/product.model.js';

// ── Helper: match product id safely (handles ObjectId vs string) ──────────────
const matchesId = (item, productId) =>
  item.product?._id?.toString() === productId ||
  item.product?.toString()      === productId;

// ── Helper: get or create a user's cart ──────────────────────────────────────
const getOrCreateCart = async (userId) => {
  let cart = await cartRepository.findByUserLean(userId);
  if (!cart) cart = await cartRepository.create(userId);
  return cart;
};

// ── Helper: validate product is active and in stock ──────────────────────────
const validateProduct = async (productId) => {
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product)              throw new Error(CART_ERRORS.PRODUCT_NOT_FOUND);
  if (product.quantity <= 0) throw new Error(CART_ERRORS.OUT_OF_STOCK);
  return product;
};

// ── GET cart ──────────────────────────────────────────────────────────────────
export const getCart = async (userId) => {
  return cartRepository.findByUser(userId);
};

// ── SYNC guest cart on login ──────────────────────────────────────────────────
export const syncCart = async (userId, guestItems = []) => {
  if (!guestItems.length) return cartRepository.findByUser(userId);

  const productIds = guestItems.map((i) => i.productId);
  const products   = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));

  const cart = await getOrCreateCart(userId);

  for (const { productId, quantity } of guestItems) {
    const product  = productMap[productId];
    if (!product) continue;

    const qty      = Math.max(1, quantity);
    const existing = cart.items.find((i) => matchesId(i, productId));

    if (existing) {
      existing.quantity = qty;
      existing.price    = product.price;
    } else {
      cart.items.push({ product: product._id, quantity: qty, price: product.price });
    }
  }

  await cartRepository.save(cart);
  return cartRepository.findAndPopulate(userId);
};

// ── ADD item ──────────────────────────────────────────────────────────────────
export const addItem = async (userId, productId, quantity = 1) => {
  if (quantity < 1) throw new Error(CART_ERRORS.INVALID_QUANTITY);

  const product  = await validateProduct(productId);
  const cart     = await getOrCreateCart(userId);
  const existing = cart.items.find((i) => matchesId(i, productId));

  if (existing) {
    existing.quantity += quantity;
    existing.price     = product.price;
  } else {
    cart.items.push({ product: product._id, quantity, price: product.price });
  }

  await cartRepository.save(cart);
  return cartRepository.findAndPopulate(userId);
};

// ── UPDATE item quantity ──────────────────────────────────────────────────────
export const updateItem = async (userId, productId, quantity) => {
  if (quantity < 1) throw new Error(CART_ERRORS.INVALID_QUANTITY);

  const cart     = await getOrCreateCart(userId);
  const existing = cart.items.find((i) => matchesId(i, productId));

  if (!existing) throw new Error(CART_ERRORS.ITEM_NOT_IN_CART);

  existing.quantity = quantity;

  await cartRepository.save(cart);
  return cartRepository.findAndPopulate(userId);
};

// ── REMOVE item ───────────────────────────────────────────────────────────────
export const removeItem = async (userId, productId) => {
  const cart   = await getOrCreateCart(userId);
  const before = cart.items.length;

  cart.items = cart.items.filter((i) => !matchesId(i, productId));

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