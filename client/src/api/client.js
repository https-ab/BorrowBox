import axios from 'axios';
import toast from 'react-hot-toast';

/** Single axios instance for the whole app. */
// const api = axios.create({ baseURL: '/api' });
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
});


// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error normalisation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    if (error.response?.status === 401 && localStorage.getItem('bb_token')) {
      localStorage.removeItem('bb_token');
      localStorage.removeItem('bb_user');
      toast.error('Your session has expired. Please log in again.');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
