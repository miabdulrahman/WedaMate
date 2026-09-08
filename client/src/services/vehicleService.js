import apiClient from './apiClient.js';

export const vehicleService = {
  async getMyVehicles() {
    const res = await apiClient('/vehicles');
    return res.data?.vehicles || [];
  },

  async addVehicle(vehicleData) {
    const res = await apiClient('/vehicles', {
      method: 'POST',
      body: vehicleData
    });
    return res.data?.vehicle;
  },

  async updateVehicle(id, vehicleData) {
    const res = await apiClient(`/vehicles/${id}`, {
      method: 'PUT',
      body: vehicleData
    });
    return res.data?.vehicle;
  },

  async deleteVehicle(id) {
    return await apiClient(`/vehicles/${id}`, {
      method: 'DELETE'
    });
  }
};

export default vehicleService;
