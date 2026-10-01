import apiClient from './apiClient.js';

export const uploadService = {
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient('/upload/avatar', {
      method: 'POST',
      body: formData
    });

    return res.data;
  },

  async uploadImage(file, folder = 'wedamate/services') {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient(`/upload/image?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      body: formData
    });

    return res.data;
  }
};

export default uploadService;
