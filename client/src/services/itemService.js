import api from '../api/client';

export const itemService = {
  list: (params) => api.get('/items', { params }).then((r) => r.data),
  nearby: (params) => api.get('/items/nearby', { params }).then((r) => r.data),
  featured: () => api.get('/items/featured').then((r) => r.data),
  categories: () => api.get('/items/categories').then((r) => r.data),
  get: (id) => api.get(`/items/${id}`).then((r) => r.data),
  availability: (id) => api.get(`/items/${id}/availability`).then((r) => r.data),
  create: (data) => api.post('/items', data).then((r) => r.data),
  update: (id, data) => api.put(`/items/${id}`, data).then((r) => r.data),
  setStatus: (id, status) => api.patch(`/items/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => api.delete(`/items/${id}`).then((r) => r.data),
  mine: () => api.get('/items/mine').then((r) => r.data),
};

export const uploadService = {
  uploadImages: (files) => {
    const form = new FormData();
    files.forEach((f) => form.append('images', f));
    return api
      .post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
};
