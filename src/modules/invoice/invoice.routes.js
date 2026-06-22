// modules/invoice/invoice.routes.js
import { Router } from "express";
import {
  getMyInvoices,
  getInvoiceById,
  getInvoiceByOrderId,
  getAllInvoices,
  updateInvoiceNotes,
  voidInvoice,
} from "./invoice.controller.js";
import {
  validateUserInvoicesQuery,
  validateAdminInvoicesQuery,
} from "./invoice.validator.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get(  "/admin/all",        restrictTo("admin", "superadmin"), validateAdminInvoicesQuery, getAllInvoices);
router.patch("/admin/:id/void",   restrictTo("admin", "superadmin"),                             voidInvoice);
router.patch("/admin/:id/notes",  restrictTo("admin", "superadmin"),                             updateInvoiceNotes);

// ── User ──────────────────────────────────────────────────────────────────────
router.get("/",               validateUserInvoicesQuery, getMyInvoices);
router.get("/order/:orderId",                            getInvoiceByOrderId);
router.get("/:id",                                       getInvoiceById);

export default router;
