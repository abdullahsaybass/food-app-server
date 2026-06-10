// src/features/cart/cart.controller.js

import * as cartService               from './cart.service.js';
import { toCartDTO, emptyCartDTO }    from './cart.mapper.js';
import { CART_MESSAGES, CART_ERRORS } from './cart.constants.js';
import asyncHandler                   from '../../utils/asyncHandler.js';

// ── GET /api/cart ─────────────────────────────────────────────────────────────
export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.status(200).json({
    success: true,
    message: CART_MESSAGES.FETCHED,
    data:    cart ? toCartDTO(cart) : emptyCartDTO(),
  });
});

// ── POST /api/cart/sync ───────────────────────────────────────────────────────
export const syncCart = asyncHandler(async (req, res) => {
  const cart = await cartService.syncCart(req.user.id, req.body.items);
  res.status(200).json({
    success: true,
    message: CART_MESSAGES.SYNCED,
    data:    cart ? toCartDTO(cart) : emptyCartDTO(),
  });
});

// ── POST /api/cart/items ──────────────────────────────────────────────────────
export const addItem = asyncHandler(async (req, res) => {
  const { productId, unit, quantity = 1 } = req.body;
  const cart = await cartService.addItem(req.user.id, productId, unit, quantity);
  res.status(200).json({
    success: true,
    message: CART_MESSAGES.ITEM_ADDED,
    data:    toCartDTO(cart),
  });
});

// ── PATCH /api/cart/items/:productId/:unit ────────────────────────────────────
export const updateItem = asyncHandler(async (req, res) => {
  const { productId, unit } = req.params;
  const { quantity }        = req.body;

  try {
    const cart = await cartService.updateItem(req.user.id, productId, unit, quantity);
    res.status(200).json({
      success: true,
      message: CART_MESSAGES.ITEM_UPDATED,
      data:    toCartDTO(cart),
    });
  } catch (err) {
    const is404 = err.message === CART_ERRORS.ITEM_NOT_IN_CART
               || err.message === CART_ERRORS.INVALID_QUANTITY;
    res.status(is404 ? 404 : 500).json({
      success: false,
      message: err.message,
    });
  }
});

// ── DELETE /api/cart/items/:productId/:unit ───────────────────────────────────
export const removeItem = asyncHandler(async (req, res) => {
  const { productId, unit } = req.params;

  try {
    const cart = await cartService.removeItem(req.user.id, productId, unit);
    res.status(200).json({
      success: true,
      message: CART_MESSAGES.ITEM_REMOVED,
      data:    toCartDTO(cart),
    });
  } catch (err) {
    const is404 = err.message === CART_ERRORS.ITEM_NOT_IN_CART;
    res.status(is404 ? 404 : 500).json({
      success: false,
      message: err.message,
    });
  }
});

// ── DELETE /api/cart ──────────────────────────────────────────────────────────
export const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user.id);
  res.status(200).json({
    success: true,
    message: CART_MESSAGES.CLEARED,
    data:    emptyCartDTO(),
  });
});
