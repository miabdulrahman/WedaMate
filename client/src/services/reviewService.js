import apiClient from './apiClient.js';

export const reviewService = {
  async createReview(reviewData) {
    const res = await apiClient('/reviews', {
      method: 'POST',
      body: reviewData
    });
    return res.data?.review;
  },

  async getProviderReviews(providerId, page = 1) {
    const res = await apiClient(`/reviews/provider/${providerId}?page=${page}`);
    return res.data;
  },

  async moderateReview(id, isHidden) {
    const res = await apiClient(`/reviews/${id}/moderate`, {
      method: 'PATCH',
      body: { isHidden }
    });
    return res.data?.review;
  }
};

export default reviewService;
