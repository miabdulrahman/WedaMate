import Notification from '../models/Notification.js';

export class NotificationService {
  async createNotification({ recipient, sender, type, title, message, link = '/dashboard' }) {
    try {
      const notification = await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        link,
        read: false
      });
      return notification;
    } catch (error) {
      console.error('[NotificationService Error]', error);
      return null;
    }
  }

  async getUnreadCount(userId) {
    return await Notification.countDocuments({ recipient: userId, read: false });
  }

  async getUserNotifications(userId, limit = 20) {
    return await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name avatar role');
  }

  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany({ recipient: userId, read: false }, { read: true });
  }
}

export default new NotificationService();
