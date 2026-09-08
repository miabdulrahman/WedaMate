import apiClient from './apiClient.js';

export const driverService = {
  async getDrivers(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const res = await apiClient(`/drivers?${query.toString()}`);
    return res.data;
  },

  async getDriverById(id) {
    const res = await apiClient(`/drivers/${id}`);
    return res.data?.driver;
  },

  async updateProfile(profileData) {
    const res = await apiClient('/drivers/profile', {
      method: 'PUT',
      body: profileData
    });
    return res.data?.profile;
  },

  async toggleAvailability() {
    const res = await apiClient('/drivers/toggle-availability', {
      method: 'PATCH'
    });
    return res.data;
  },

  async getDashboardStats() {
    const res = await apiClient('/drivers/dashboard-stats');
    return res.data;
  }
};

export default driverService;
