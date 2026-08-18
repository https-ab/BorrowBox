import api from '../api/client';

export const authService = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const userService = {
  updateMe: (data) => api.put('/users/me', data).then((r) => r.data),
  getProfile: (id) => api.get(`/users/${id}`).then((r) => r.data),
};
