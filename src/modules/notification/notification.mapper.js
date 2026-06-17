// modules/notification/notification.mapper.js

export const mapNotification = (n) => {
  if (!n) return null;

  return {
    id:        n._id,
    type:      n.type,
    title:     n.title,
    body:      n.body,
    data:      n.data ?? {},
    isRead:    n.isRead,
    readAt:    n.readAt,
    createdAt: n.createdAt,
  };
};

export const mapNotificationList = (notifications = [], { page, limit, total, unreadCount }) => ({
  items: notifications.map(mapNotification),
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
  unreadCount,
});
