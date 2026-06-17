// modules/notification/notification.controller.js
import notificationService from "../../services/notification/notification.service.js";
import { mapNotificationList } from "./notification.mapper.js";
import { NOTIFICATION_MESSAGES } from "./notification.constants.js";
import asyncHandler from "../../utils/asyncHandler.js";

// ── Get paginated notifications for the logged-in user ─────────────────────────
export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedQuery;
  const { notifications, total, unreadCount } =
    await notificationService.getUserNotifications(req.user._id, { page, limit });

  res.status(200).json({
    success: true,
    message: NOTIFICATION_MESSAGES.FETCHED,
    data: mapNotificationList(notifications, { page, limit, total, unreadCount }),
  });
});

// ── Mark a single notification as read ──────────────────────────────────────────
export const markAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: NOTIFICATION_MESSAGES.MARKED_READ,
    data: null,
  });
});

// ── Mark all as read ──────────────────────────────────────────────────────────────
export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  res.status(200).json({
    success: true,
    message: NOTIFICATION_MESSAGES.ALL_MARKED_READ,
    data: null,
  });
});

// ── Delete a notification ───────────────────────────────────────────────────────
export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: NOTIFICATION_MESSAGES.DELETED,
    data: null,
  });
});

// ── Register a device push token ────────────────────────────────────────────────
export const registerDeviceToken = asyncHandler(async (req, res) => {
  const { token, platform } = req.validatedBody;
  await notificationService.registerDeviceToken(req.user._id, token, platform);
  res.status(200).json({
    success: true,
    message: NOTIFICATION_MESSAGES.TOKEN_SAVED,
    data: null,
  });
});

// ── Remove a device push token (e.g. on logout) ───────────────────────────────────
export const removeDeviceToken = asyncHandler(async (req, res) => {
  const { token } = req.validatedBody;
  await notificationService.removeDeviceToken(req.user._id, token);
  res.status(200).json({
    success: true,
    message: NOTIFICATION_MESSAGES.TOKEN_REMOVED,
    data: null,
  });
});
