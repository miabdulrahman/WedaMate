import apiClient from './apiClient.js';

export const providerService = {
  async getProviders(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const res = await apiClient(`/providers?${query.toString()}`);
    return res.data;
  },

  async getProviderById(id) {
    const res = await apiClient(`/providers/${id}`);
    return res.data?.provider;
  },

  async updateProfile(profileData) {
    const res = await apiClient('/providers/profile', {
      method: 'PUT',
      body: profileData
    });
    return res.data?.profile;
  },

  async getDashboardStats() {
    const res = await apiClient('/providers/dashboard-stats');
    return res.data;
  }
};

export default providerService;
