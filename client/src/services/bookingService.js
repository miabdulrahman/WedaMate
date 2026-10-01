import apiClient from './apiClient.js';

export const bookingService = {
  async calculatePrice(params) {
    const res = await apiClient('/bookings/calculate-price', {
      method: 'POST',
      body: params
    });
    return res.data;
  },

  async createBooking(bookingData) {
    const res = await apiClient('/bookings', {
      method: 'POST',
      body: bookingData
    });
    return res.data?.booking;
  },

  async getBookings(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const res = await apiClient(`/bookings?${query.toString()}`);
    return res.data;
  },

  async getBookingById(id) {
    const res = await apiClient(`/bookings/${id}`);
    return res.data?.booking || res.data;
  },

  async updateBookingStatus(id, { status, note, cancellationReason }) {
    const res = await apiClient(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status, note, cancellationReason }
    });
    return res.data?.booking;
  },

  async openDispute(id, { reason, details }) {
    const res = await apiClient(`/bookings/${id}/dispute`, {
      method: 'POST',
      body: { reason, details }
    });
    return res.data?.booking;
  }
};

export default bookingService;
