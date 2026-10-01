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
  },

  async getMyProfile() {
    const res = await apiClient('/providers/me');
    return res.data?.profile;
  },

  async addService(serviceData) {
    const res = await apiClient('/providers/services', {
      method: 'POST',
      body: serviceData
    });
    return res.data;
  },

  async updateService(serviceId, serviceData) {
    const res = await apiClient(`/providers/services/${serviceId}`, {
      method: 'PUT',
      body: serviceData
    });
    return res.data;
  },

  async deleteService(serviceId) {
    const res = await apiClient(`/providers/services/${serviceId}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};

export default providerService;
