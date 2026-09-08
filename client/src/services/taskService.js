import apiClient from './apiClient.js';

export const taskService = {
  async createTask(taskData) {
    const res = await apiClient('/tasks', {
      method: 'POST',
      body: taskData
    });
    return res.data?.task;
  },

  async getTasks(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const res = await apiClient(`/tasks?${query.toString()}`);
    return res.data?.tasks || [];
  },

  async getTaskById(id) {
    const res = await apiClient(`/tasks/${id}`);
    return res.data?.task;
  },

  async submitBid(taskId, bidData) {
    const res = await apiClient(`/tasks/${taskId}/bid`, {
      method: 'POST',
      body: bidData
    });
    return res.data?.task;
  },

  async acceptBid(taskId, bidId) {
    const res = await apiClient(`/tasks/${taskId}/accept-bid`, {
      method: 'POST',
      body: { bidId }
    });
    return res.data;
  }
};

export default taskService;
