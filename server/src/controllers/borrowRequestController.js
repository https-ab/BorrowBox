import Item from '../models/Item.js';
import BorrowRequest from '../models/BorrowRequest.js';
import Transaction from '../models/Transaction.js';
import { hasDateConflict } from '../services/availabilityService.js';
import { notify } from '../services/notificationService.js';
import { daysBetweenInclusive, startOfDay } from '../utils/dates.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/borrow-requests
export const createRequest = asyncHandler(async (req, res) => {
  const { item: itemId, startDate, endDate, message } = req.body;

  const item = await Item.findById(itemId).populate('owner', 'name');
  if (!item || item.status !== 'active') throw ApiError.notFound('This item is not available for borrowing.');
  if (String(item.owner._id) === String(req.user._id)) {
    throw ApiError.badRequest('You cannot borrow your own item.');
  }
  if (startOfDay(startDate) < startOfDay(new Date())) {
    throw ApiError.badRequest('Start date cannot be in the past.');
  }

  const days = daysBetweenInclusive(startDate, endDate);
  if (days < item.minDays) throw ApiError.badRequest(`Minimum borrowing period is ${item.minDays} day(s).`);
  if (days > item.maxDays) throw ApiError.badRequest(`Maximum borrowing period is ${item.maxDays} day(s).`);

  // Backend availability validation (frontend can be manipulated)
  if (await hasDateConflict(item._id, startDate, endDate)) {
    throw ApiError.conflict('These dates are no longer available.');
  }

  const duplicate = await BorrowRequest.exists({
    item: item._id,
    borrower: req.user._id,
    status: 'pending',
  });
  if (duplicate) throw ApiError.conflict('Your request has already been submitted.');

  const rentTotal = days * item.pricePerDay;
  const request = await BorrowRequest.create({
    item: item._id,
    owner: item.owner._id,
    borrower: req.user._id,
    startDate: startOfDay(startDate),
    endDate: startOfDay(endDate),
    message,
    days,
    rentTotal,
    deposit: item.deposit,
    grandTotal: rentTotal + item.deposit,
  });

  await notify({
    user: item.owner._id,
    type: 'request_received',
    title: `${req.user.name} requested your ${item.name}`,
    body: `${days} day(s) · ₹${rentTotal + item.deposit} total`,
    item: item._id,
    request: request._id,
    link: '/requests?tab=incoming',
  });

  res.status(201).json({ success: true, request });
});

// GET /api/borrow-requests?role=incoming|outgoing&status=
export const listRequests = asyncHandler(async (req, res) => {
  const { role = 'outgoing', status } = req.query;
  const filter = role === 'incoming' ? { owner: req.user._id } : { borrower: req.user._id };
  if (status) filter.status = status;

  const requests = await BorrowRequest.find(filter)
    .sort('-createdAt')
    .limit(100)
    .populate('item', 'name images pricePerDay city category')
    .populate('borrower', 'name avatar city trustScore trustLevel isVerified stats')
    .populate('owner', 'name avatar city trustScore trustLevel isVerified');

  res.json({ success: true, requests });
});

// PATCH /api/borrow-requests/:id/approve (owner)
export const approveRequest = asyncHandler(async (req, res) => {
  const request = await BorrowRequest.findById(req.params.id).populate('item', 'name');
  if (!request) throw ApiError.notFound('Request not found.');
  if (String(request.owner) !== String(req.user._id)) {
    throw ApiError.forbidden('Only the item owner can approve this request.');
  }
  if (request.status !== 'pending') throw ApiError.conflict('This request has already been handled.');

  // Re-validate availability at approval time
  if (await hasDateConflict(request.item._id, request.startDate, request.endDate)) {
    request.status = 'expired';
    await request.save();
    throw ApiError.conflict('These dates are no longer available - another booking overlaps.');
  }

  const transaction = await Transaction.create({
    request: request._id,
    item: request.item._id,
    owner: request.owner,
    borrower: request.borrower,
    startDate: request.startDate,
    endDate: request.endDate,
    days: request.days,
    rentTotal: request.rentTotal,
    deposit: request.deposit,
    grandTotal: request.grandTotal,
    status: 'approved',
    timeline: [
      { key: 'requested', label: 'Request submitted', at: request.createdAt, by: request.borrower },
      { key: 'approved', label: 'Request approved', at: new Date(), by: req.user._id },
    ],
  });

  request.status = 'approved';
  request.respondedAt = new Date();
  request.transaction = transaction._id;
  await request.save();

  // Auto-expire other pending requests that now conflict
  const conflicting = await BorrowRequest.find({
    item: request.item._id,
    status: 'pending',
    _id: { $ne: request._id },
    startDate: { $lte: request.endDate },
    endDate: { $gte: request.startDate },
  });
  for (const other of conflicting) {
    other.status = 'expired';
    await other.save();
    await notify({
      user: other.borrower,
      type: 'request_rejected',
      title: `Dates for ${request.item.name} are no longer available`,
      body: 'Another booking was approved for an overlapping period.',
      item: request.item._id,
      request: other._id,
      link: '/requests',
    });
  }

  await notify({
    user: request.borrower,
    type: 'request_approved',
    title: 'Your borrow request was accepted 🎉',
    body: `${request.item.name} · pick it up on ${request.startDate.toDateString()}`,
    item: request.item._id,
    transaction: transaction._id,
    link: `/transactions/${transaction._id}`,
  });

  res.json({ success: true, request, transaction });
});

// PATCH /api/borrow-requests/:id/reject (owner)
export const rejectRequest = asyncHandler(async (req, res) => {
  const request = await BorrowRequest.findById(req.params.id).populate('item', 'name');
  if (!request) throw ApiError.notFound('Request not found.');
  if (String(request.owner) !== String(req.user._id)) {
    throw ApiError.forbidden('Only the item owner can reject this request.');
  }
  if (request.status !== 'pending') throw ApiError.conflict('This request has already been handled.');

  request.status = 'rejected';
  request.respondedAt = new Date();
  await request.save();

  await notify({
    user: request.borrower,
    type: 'request_rejected',
    title: `Your request for ${request.item.name} was declined`,
    body: 'Try different dates or explore similar items nearby.',
    item: request.item._id,
    request: request._id,
    link: '/explore',
  });

  res.json({ success: true, request });
});

// PATCH /api/borrow-requests/:id/cancel (borrower)
export const cancelRequest = asyncHandler(async (req, res) => {
  const request = await BorrowRequest.findById(req.params.id).populate('item', 'name');
  if (!request) throw ApiError.notFound('Request not found.');
  if (String(request.borrower) !== String(req.user._id)) {
    throw ApiError.forbidden('Only the requester can cancel this request.');
  }
  if (request.status !== 'pending') {
    throw ApiError.conflict('Only pending requests can be cancelled.');
  }

  request.status = 'cancelled';
  request.respondedAt = new Date();
  await request.save();

  await notify({
    user: request.owner,
    type: 'request_cancelled',
    title: `Request for ${request.item.name} was cancelled`,
    body: `${req.user.name} withdrew their borrow request.`,
    item: request.item._id,
    request: request._id,
    link: '/requests?tab=incoming',
  });

  res.json({ success: true, request });
});
