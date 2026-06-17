// modules/notification/notification.repository.js
import Notification from "./notification.model.js";
import DeviceToken from "./deviceToken.model.js";

class NotificationRepository {
  create(data) {
    return Notification.create(data);
  }

  async findByUser(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: userId }),
      Notification.countDocuments({ user: userId, isRead: false }),
    ]);

    return { notifications, total, unreadCount };
  }

  findById(id) {
    return Notification.findById(id);
  }

  markAsRead(id, userId) {
    return Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  markAllAsRead(userId) {
    return Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  deleteById(id, userId) {
    return Notification.findOneAndDelete({ _id: id, user: userId });
  }

  // ── Device tokens ──────────────────────────────────────────────────────
  async saveToken(userId, token, platform = "android") {
    return DeviceToken.findOneAndUpdate(
      { token },
      { user: userId, token, platform, isActive: true },
      { upsert: true, new: true }
    );
  }

  async removeToken(userId, token) {
    return DeviceToken.findOneAndUpdate(
      { user: userId, token },
      { isActive: false }
    );
  }

  getActiveTokensForUser(userId) {
    return DeviceToken.find({ user: userId, isActive: true }).select("token");
  }

  deactivateTokens(tokens = []) {
    if (!tokens.length) return Promise.resolve();
    return DeviceToken.updateMany(
      { token: { $in: tokens } },
      { isActive: false }
    );
  }
}

export default new NotificationRepository();
