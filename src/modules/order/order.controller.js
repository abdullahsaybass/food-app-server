// modules/order/order.controller.js
import orderService            from "./order.service.js";
import { mapOrder, mapOrderList } from "./order.mapper.js";
import { ORDER_MESSAGES }      from "./order.constants.js";
import asyncHandler            from "../../utils/asyncHandler.js";

// ── User controllers ──────────────────────────────────────────────────────────

export const placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.user._id, req.validatedBody);
  res.status(201).json({
    success: true,
    message: ORDER_MESSAGES.CREATED,
    data:    mapOrder(order.toObject()),
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
  const order   = await orderService.getOrderById(req.params.id, req.user._id, isAdmin);
  res.status(200).json({
    success: true,
    message: ORDER_MESSAGES.FETCHED,
    data:    mapOrder(order),
  });
});

export const getOrderHistory = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.validatedQuery;
  const { orders, total } = await orderService.getOrderHistory(req.user._id, { page, limit, status });
  res.status(200).json({
    success: true,
    message: ORDER_MESSAGES.LIST_FETCHED,
    data:    mapOrderList(orders, { page, limit, total }),
  });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(
    req.params.id,
    req.user._id,
    req.validatedBody.cancelReason
  );
  res.status(200).json({
    success: true,
    message: ORDER_MESSAGES.CANCELLED,
    data:    mapOrder(order.toObject()),
  });
});

// ── Admin controllers ─────────────────────────────────────────────────────────

export const getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, status, paymentStatus, search, sortBy, sortOrder } = req.validatedQuery;
  const { orders, total } = await orderService.getAllOrders({
    page, limit, status, paymentStatus, search, sortBy, sortOrder,
  });
  res.status(200).json({
    success: true,
    message: ORDER_MESSAGES.LIST_FETCHED,
    data:    mapOrderList(orders, { page, limit, total }),
  });
});

export const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await orderService.getOrderStats();
  res.status(200).json({
    success: true,
    message: ORDER_MESSAGES.STATS_FETCHED,
    data:    stats,
  });
});

export const getRecentOrders = asyncHandler(async (req, res) => {
  const { limit } = req.validatedQuery;
  const orders = await orderService.getRecentOrders(limit);
  res.status(200).json({
    success: true,
    message: ORDER_MESSAGES.LIST_FETCHED,
    data:    orders.map(mapOrder),
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(
    req.params.id,
    req.validatedBody.status,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: ORDER_MESSAGES.STATUS_UPDATED,
    data:    mapOrder(order.toObject()),
  });
});

export const adminCancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.adminCancelOrder(
    req.params.id,
    req.user._id,
    req.validatedBody.cancelReason
  );
  res.status(200).json({
    success: true,
    message: ORDER_MESSAGES.CANCELLED,
    data:    mapOrder(order.toObject()),
  });
});