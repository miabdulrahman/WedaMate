import apiClient from './apiClient.js';

export const authService = {
  async register(userData) {
    const res = await apiClient('/auth/register', {
      method: 'POST',
      body: userData
    });
    if (res.data?.token) {
      localStorage.setItem('wedamate_token', res.data.token);
    }
    return res.data;
  },

  async login(credentials) {
    const res = await apiClient('/auth/login', {
      method: 'POST',
      body: credentials
    });
    if (res.data?.token) {
      localStorage.setItem('wedamate_token', res.data.token);
    }
    return res.data;
  },

  async getMe() {
    const res = await apiClient('/auth/me');
    return res.data?.user;
  },

  async updateProfile(profileData) {
    const res = await apiClient('/auth/update-profile', {
      method: 'PUT',
      body: profileData
    });
    return res.data?.user;
  },

  async updatePassword(passwords) {
    return await apiClient('/auth/update-password', {
      method: 'PUT',
      body: passwords
    });
  },

  logout() {
    localStorage.removeItem('wedamate_token');
  }
};

export default authService;
