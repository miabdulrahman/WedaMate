import apiClient from './apiClient.js';

export const notificationService = {
  async getNotifications() {
    const res = await apiClient('/notifications');
    return res.data;
  },

  async markAsRead(id) {
    const res = await apiClient(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
    return res.data?.notification;
  },

  async markAllAsRead() {
    const res = await apiClient('/notifications/read-all', {
      method: 'PATCH'
    });
    return res.data;
  }
};

export default notificationService;
