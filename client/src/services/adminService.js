import apiClient from './apiClient.js';

export const adminService = {
  async getAnalytics() {
    const res = await apiClient('/admin/analytics');
    return res.data;
  },

  async getUsers(params = {}) {
    const query = new URLSearchParams(params);
    const res = await apiClient(`/admin/users?${query.toString()}`);
    return res.data;
  },

  async toggleUserStatus(id) {
    const res = await apiClient(`/admin/users/${id}/toggle-status`, {
      method: 'PATCH'
    });
    return res.data;
  },

  async getSettings() {
    const res = await apiClient('/admin/settings');
    return res.data?.settings;
  },

  async updateSettings(settingsData) {
    const res = await apiClient('/admin/settings', {
      method: 'PUT',
      body: settingsData
    });
    return res.data?.settings;
  },

  async getVerifications(params = {}) {
    const query = new URLSearchParams(params);
    const res = await apiClient(`/verification/admin?${query.toString()}`);
    return res.data?.verifications || [];
  },

  async reviewVerification(id, { status, reviewNotes, badges }) {
    const res = await apiClient(`/verification/admin/${id}`, {
      method: 'PATCH',
      body: { status, reviewNotes, badges }
    });
    return res.data;
  },

  async getReports(params = {}) {
    const query = new URLSearchParams(params);
    const res = await apiClient(`/reports?${query.toString()}`);
    return res.data?.reports || [];
  },

  async resolveReport(id, { status, resolutionNotes }) {
    const res = await apiClient(`/reports/${id}/resolve`, {
      method: 'PATCH',
      body: { status, resolutionNotes }
    });
    return res.data;
  },

  async getReviews(params = {}) {
    const query = new URLSearchParams(params);
    const res = await apiClient(`/reviews?${query.toString()}`);
    return res.data;
  },

  async moderateReview(id, isHidden) {
    const res = await apiClient(`/reviews/${id}/moderate`, {
      method: 'PATCH',
      body: { isHidden }
    });
    return res.data;
  },

  async getCategories() {
    const res = await apiClient('/categories');
    return res.data?.categories || [];
  },

  async createCategory(data) {
    const res = await apiClient('/categories', {
      method: 'POST',
      body: data
    });
    return res.data?.category;
  },

  async updateCategory(id, data) {
    const res = await apiClient(`/categories/${id}`, {
      method: 'PUT',
      body: data
    });
    return res.data?.category;
  },

  async deleteCategory(id) {
    const res = await apiClient(`/categories/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};

export default adminService;
