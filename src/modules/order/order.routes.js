// modules/order/order.routes.js
import { Router } from "express";
import {
  placeOrder,
  getOrderById,
  getOrderHistory,
  cancelOrder,
  getAllOrders,
  getOrderStats,
  getRecentOrders,
  updateOrderStatus,
  adminCancelOrder,
} from "./order.controller.js";
import {
  validatePlaceOrder,
  validateCancelOrder,
  validateUpdateStatus,
  validateUserOrdersQuery,
  validateAdminOrdersQuery,
  validateRecentOrdersQuery,
} from "./order.validator.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js"; // adjust path

const router = Router();

router.use(protect); // all routes require auth

// ── Admin routes ──────────────────────────────────────────────────────────────
// Must be defined BEFORE /:id to avoid route conflicts

router.get(  "/admin/all",    restrictTo("admin", "superadmin"), validateAdminOrdersQuery,  getAllOrders);
router.get(  "/admin/stats",  restrictTo("admin", "superadmin"),                            getOrderStats);
router.get(  "/admin/recent", restrictTo("admin", "superadmin"), validateRecentOrdersQuery, getRecentOrders);
router.patch("/admin/:id/cancel", restrictTo("admin", "superadmin"), validateCancelOrder,   adminCancelOrder);

// ── User routes ───────────────────────────────────────────────────────────────
router.post( "/",             validatePlaceOrder,      placeOrder);
router.get(  "/",             validateUserOrdersQuery, getOrderHistory);
router.get(  "/:id",                                   getOrderById);       // admin can also access via isAdmin check in service
router.patch("/:id/cancel",   validateCancelOrder,     cancelOrder);
router.patch("/:id/status",   restrictTo("admin", "superadmin"), validateUpdateStatus, updateOrderStatus);

export default router;