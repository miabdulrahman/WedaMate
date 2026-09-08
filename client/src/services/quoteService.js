import apiClient from './apiClient.js';

export const quoteService = {
  async requestQuote(quoteData) {
    const res = await apiClient('/quotes', {
      method: 'POST',
      body: quoteData
    });
    return res.data?.quote;
  },

  async getQuotes(status) {
    const query = status ? `?status=${status}` : '';
    const res = await apiClient(`/quotes${query}`);
    return res.data?.quotes || [];
  },

  async respondQuote(id, offerData) {
    const res = await apiClient(`/quotes/${id}/respond`, {
      method: 'POST',
      body: offerData
    });
    return res.data?.quote;
  },

  async acceptQuote(id) {
    const res = await apiClient(`/quotes/${id}/accept`, {
      method: 'POST'
    });
    return res.data;
  },

  async rejectQuote(id) {
    const res = await apiClient(`/quotes/${id}/reject`, {
      method: 'POST'
    });
    return res.data?.quote;
  }
};

export default quoteService;
