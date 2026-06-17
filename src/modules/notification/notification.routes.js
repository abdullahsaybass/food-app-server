// modules/notification/notification.routes.js
import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  registerDeviceToken,
  removeDeviceToken,
} from "./notification.controller.js";
import {
  validateListQuery,
  validateRegisterToken,
  validateRemoveToken,
} from "./notification.validator.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/",              validateListQuery, getNotifications);
router.patch("/:id/read",     markAsRead);
router.patch("/read-all",     markAllAsRead);
router.delete("/:id",         deleteNotification);

// ── Device token management (FCM) ──────────────────────────────────────────────
router.post("/device-token",   validateRegisterToken, registerDeviceToken);
router.delete("/device-token", validateRemoveToken,   removeDeviceToken);

export default router;
