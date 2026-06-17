// services/notification/notification.service.js
import notificationRepository from "../../modules/notification/notification.repository.js";
import fcmService from "./fcm.service.js";
import logger from "../../infrastructure/logger/logger.js";
import {
  ORDER_NOTIFICATION_TEMPLATES,
  NOTIFICATION_TYPES,
} from "../../modules/notification/notification.constants.js";

class NotificationService {
  // ── Generic: create + push for any notification type ───────────────────────
  async send(userId, { type, title, body, data = {} }) {
    const notification = await notificationRepository.create({
      user: userId,
      type,
      title,
      body,
      data,
    });

    await this._pushToUser(userId, { title, body, data });

    return notification;
  }

  // ── Order-status specific helper ────────────────────────────────────────────
  // Called whenever an order's status changes:
  // pending -> confirmed -> processing -> shipped -> delivered (or cancelled)
  async sendOrderStatusNotification(userId, order, status) {
    const template = ORDER_NOTIFICATION_TEMPLATES[status];
    if (!template) {
      logger.warn(`[Notification] No template for order status "${status}"`);
      return null;
    }

    const data = {
      orderId:     order._id?.toString?.() ?? order._id,
      orderNumber: order.orderNumber,
      status,
      screen:      "OrderDetail",
    };

    return this.send(userId, {
      type:  template.type,
      title: template.title,
      body:  template.body(order.orderNumber),
      data,
    });
  }

  // ── Fetch notifications for a user (paginated) ──────────────────────────────
  async getUserNotifications(userId, { page = 1, limit = 20 } = {}) {
    return notificationRepository.findByUser(userId, { page, limit });
  }

  async markAsRead(notificationId, userId) {
    return notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId) {
    return notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(notificationId, userId) {
    return notificationRepository.deleteById(notificationId, userId);
  }

  // ── Device tokens ────────────────────────────────────────────────────────────
  async registerDeviceToken(userId, token, platform) {
    return notificationRepository.saveToken(userId, token, platform);
  }

  async removeDeviceToken(userId, token) {
    return notificationRepository.removeToken(userId, token);
  }

  // ── Internal: push to all of a user's active devices ────────────────────────
  async _pushToUser(userId, { title, body, data }) {
    try {
      const deviceTokens = await notificationRepository.getActiveTokensForUser(userId);
      if (!deviceTokens.length) return;

      const tokens = deviceTokens.map((d) => d.token);
      const { invalidTokens } = await fcmService.sendToTokens(tokens, { title, body, data });

      if (invalidTokens.length) {
        await notificationRepository.deactivateTokens(invalidTokens);
      }
    } catch (err) {
      logger.error(`[Notification] Push failed for user ${userId}: ${err.message}`);
    }
  }
}

export default new NotificationService();
export { NOTIFICATION_TYPES };
