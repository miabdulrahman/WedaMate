import apiClient from './apiClient.js';

export const messageService = {
  async getConversations() {
    const res = await apiClient('/messages/conversations');
    return res.data?.conversations || [];
  },

  async startConversation(recipientId, initialMessage = '') {
    const res = await apiClient('/messages/start', {
      method: 'POST',
      body: { recipientId, initialMessage }
    });
    return res.data?.conversation;
  },

  async getBookingConversation(bookingId) {
    const res = await apiClient(`/messages/booking/${bookingId}`);
    return res.data?.conversation;
  },

  async getMessages(conversationId) {
    const res = await apiClient(`/messages/conversations/${conversationId}`);
    return res.data?.messages || [];
  },

  async sendMessage(conversationId, { text, attachment }) {
    const res = await apiClient(`/messages/conversations/${conversationId}`, {
      method: 'POST',
      body: { text, attachment }
    });
    return res.data?.message;
  }
};

export default messageService;
