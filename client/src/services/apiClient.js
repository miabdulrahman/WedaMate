const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('wedamate_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok || data.success === false) {
      const errorMessage = data.message || (data.errors && data.errors[0]) || 'Network request failed';
      const error = new Error(errorMessage);
      error.status = response.status;
      error.errors = data.errors || [];
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Client Error] ${endpoint}:`, err.message);
    throw err;
  }
};

export default apiClient;
