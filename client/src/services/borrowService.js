import api from '../api/client';

export const requestService = {
  create: (data) => api.post('/borrow-requests', data).then((r) => r.data),
  list: (params) => api.get('/borrow-requests', { params }).then((r) => r.data),
  approve: (id) => api.patch(`/borrow-requests/${id}/approve`).then((r) => r.data),
  reject: (id) => api.patch(`/borrow-requests/${id}/reject`).then((r) => r.data),
  cancel: (id) => api.patch(`/borrow-requests/${id}/cancel`).then((r) => r.data),
};

export const transactionService = {
  list: (params) => api.get('/transactions', { params }).then((r) => r.data),
  get: (id) => api.get(`/transactions/${id}`).then((r) => r.data),
  handover: (id, data) => api.patch(`/transactions/${id}/handover`, data).then((r) => r.data),
  initiateReturn: (id) => api.patch(`/transactions/${id}/return`).then((r) => r.data),
  confirmReturn: (id, data) => api.patch(`/transactions/${id}/confirm`, data).then((r) => r.data),
};

export const reviewService = {
  create: (data) => api.post('/reviews', data).then((r) => r.data),
  forUser: (id) => api.get(`/reviews/user/${id}`).then((r) => r.data),
  forItem: (id) => api.get(`/reviews/item/${id}`).then((r) => r.data),
  pending: () => api.get('/reviews/pending').then((r) => r.data),
};

export const notificationService = {
  list: (params) => api.get('/notifications', { params }).then((r) => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
};

export const disputeService = {
  create: (data) => api.post('/disputes', data).then((r) => r.data),
  mine: () => api.get('/disputes/mine').then((r) => r.data),
  get: (id) => api.get(`/disputes/${id}`).then((r) => r.data),
  addEvidence: (id, data) => api.post(`/disputes/${id}/evidence`, data).then((r) => r.data),
};

export const dashboardService = {
  get: () => api.get('/dashboard').then((r) => r.data),
};

export const adminService = {
  stats: () => api.get('/admin/stats').then((r) => r.data),
  users: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  suspendUser: (id, suspend) => api.patch(`/admin/users/${id}/suspend`, { suspend }).then((r) => r.data),
  verifyUser: (id, verify) => api.patch(`/admin/users/${id}/verify`, { verify }).then((r) => r.data),
  items: (params) => api.get('/admin/items', { params }).then((r) => r.data),
  removeItem: (id, reason) => api.patch(`/admin/items/${id}/remove`, { reason }).then((r) => r.data),
  transactions: (params) => api.get('/admin/transactions', { params }).then((r) => r.data),
  disputes: (params) => api.get('/admin/disputes', { params }).then((r) => r.data),
  resolveDispute: (id, data) => api.patch(`/admin/disputes/${id}/resolve`, data).then((r) => r.data),
};
