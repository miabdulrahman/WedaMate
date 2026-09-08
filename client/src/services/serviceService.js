import apiClient from './apiClient.js';

export const serviceService = {
  async getCategories(params = {}) {
    const query = new URLSearchParams(params);
    const res = await apiClient(`/categories?${query.toString()}`);
    return res.data?.categories || [];
  },

  async getCategoryBySlug(slug) {
    const res = await apiClient(`/categories/${slug}`);
    return res.data?.category;
  },

  async getServices(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const res = await apiClient(`/services?${query.toString()}`);
    return res.data;
  },

  async getServiceBySlug(slug) {
    const res = await apiClient(`/services/${slug}`);
    return res.data?.service;
  }
};

export default serviceService;
