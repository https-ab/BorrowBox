import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

// GET /api/notifications
export const listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { page: 1, limit: 20, maxLimit: 50 });
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ user: req.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('item', 'name images'),
    Notification.countDocuments({ user: req.user._id }),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);
  res.json({ success: true, unreadCount, ...buildPaginatedResponse(notifications, total, page, limit) });
});

// GET /api/notifications/unread-count
export const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ success: true, count });
});

// PATCH /api/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { isRead: true });
  res.json({ success: true });
});

// PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
});
