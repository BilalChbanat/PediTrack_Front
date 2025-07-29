// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST Interceptor: Attach token
axiosInstance.interceptors.request.use(
  (config) => {                 
    const token = localStorage.getItem('token'); // Or use context/provider
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE Interceptor: Handle global errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn('Unauthorized. Maybe token expired.');

      // Optional: Redirect to login
      // window.location.href = '/login';

      // Optional: Clear invalid token
      localStorage.removeItem('token');
    }

    // Optional: Global error logging
    console.error('API error:', error.response || error.message);

    return Promise.reject(error); // Pass it down to services/hooks
  }
);

export default axiosInstance;
