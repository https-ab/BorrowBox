import User from '../models/User.js';
import Item from '../models/Item.js';
import Transaction from '../models/Transaction.js';
import BorrowRequest from '../models/BorrowRequest.js';
import Dispute from '../models/Dispute.js';
import Review from '../models/Review.js';
import { notify } from '../services/notificationService.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const monthSeries = (Model, match = {}) =>
  Model.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 183 * 86400000) }, ...match } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

// GET /api/admin/stats
export const platformStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, activeListings, activeTransactions, completedTransactions,
    openDisputes, pendingRequests, totalReviews,
    usersSeries, itemsSeries, txnSeries, disputeSeries, categorySplit, gmv,
  ] = await Promise.all([
    User.countDocuments(),
    Item.countDocuments({ status: 'active' }),
    Transaction.countDocuments({ status: { $in: ['approved', 'active', 'returned'] } }),
    Transaction.countDocuments({ status: 'completed' }),
    Dispute.countDocuments({ status: { $in: ['open', 'under_review'] } }),
    BorrowRequest.countDocuments({ status: 'pending' }),
    Review.countDocuments(),
    monthSeries(User),
    monthSeries(Item),
    monthSeries(Transaction),
    monthSeries(Dispute),
    Item.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$rentTotal' } } },
    ]),
  ]);

  res.json({
    success: true,
    totals: {
      totalUsers, activeListings, activeTransactions, completedTransactions,
      openDisputes, pendingRequests, totalReviews, gmv: gmv[0]?.total || 0,
    },
    charts: { usersSeries, itemsSeries, txnSeries, disputeSeries, categorySplit },
  });
});

// GET /api/admin/users
export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { page: 1, limit: 20, maxLimit: 50 });
  const { search } = req.query;
  const filter = {};
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, ...buildPaginatedResponse(users, total, page, limit) });
});

// PATCH /api/admin/users/:id/suspend  { suspend: true|false }
export const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found.');
  if (user.role === 'admin') throw ApiError.forbidden('Admins cannot be suspended.');
  user.isSuspended = Boolean(req.body.suspend);
  await user.save();
  res.json({ success: true, user });
});

// PATCH /api/admin/users/:id/verify
export const verifyUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found.');
  user.isVerified = Boolean(req.body.verify);
  await user.save();
  res.json({ success: true, user });
});

// GET /api/admin/items
export const listAllItems = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { page: 1, limit: 20, maxLimit: 50 });
  const { search, status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.name = { $regex: search, $options: 'i' };
  const [items, total] = await Promise.all([
    Item.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('owner', 'name email'),
    Item.countDocuments(filter),
  ]);
  res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
});

// PATCH /api/admin/items/:id/remove
export const removeItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw ApiError.notFound('Item not found.');
  item.status = 'removed';
  await item.save();
  await notify({
    user: item.owner,
    type: 'system',
    title: `Your listing "${item.name}" was removed`,
    body: req.body.reason || 'It did not meet our community guidelines.',
    item: item._id,
  });
  res.json({ success: true, item });
});

// GET /api/admin/transactions
export const listAllTransactions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { page: 1, limit: 20, maxLimit: 50 });
  const filter = req.query.status ? { status: req.query.status } : {};
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('item', 'name')
      .populate('owner', 'name')
      .populate('borrower', 'name'),
    Transaction.countDocuments(filter),
  ]);
  res.json({ success: true, ...buildPaginatedResponse(transactions, total, page, limit) });
});

// GET /api/admin/disputes
export const listDisputes = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const disputes = await Dispute.find(filter)
    .sort('-createdAt')
    .limit(100)
    .populate('item', 'name images')
    .populate('raisedBy', 'name avatar trustScore')
    .populate('against', 'name avatar trustScore')
    .populate('evidence.by', 'name avatar');
  res.json({ success: true, disputes });
});

// PATCH /api/admin/disputes/:id/resolve
export const resolveDispute = asyncHandler(async (req, res) => {
  const { status, resolution, ruledAgainst } = req.body;
  if (!['resolved', 'rejected', 'under_review'].includes(status)) {
    throw ApiError.badRequest('Invalid dispute status.');
  }

  const dispute = await Dispute.findById(req.params.id).populate('item', 'name');
  if (!dispute) throw ApiError.notFound('Dispute not found.');

  dispute.status = status;
  dispute.resolution = resolution || '';
  dispute.resolvedBy = req.user._id;
  if (status !== 'under_review') dispute.resolvedAt = new Date();
  if (ruledAgainst) dispute.ruledAgainst = ruledAgainst;
  await dispute.save();

  if (status !== 'under_review') {
    // Close the underlying transaction and penalize the losing party's trust
    const transaction = await Transaction.findById(dispute.transaction);
    if (transaction && transaction.status === 'disputed') {
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.timeline.push({ key: 'completed', label: `Dispute ${status}`, by: req.user._id });
      await transaction.save();
    }
    if (ruledAgainst) {
      await User.updateOne({ _id: ruledAgainst }, { $inc: { 'stats.disputesLost': 1 } });
      const { refreshTrust } = await import('../services/trustScoreService.js');
      await refreshTrust(ruledAgainst);
    }
    for (const party of [dispute.raisedBy, dispute.against]) {
      await notify({
        user: party,
        type: 'dispute_resolved',
        title: `Dispute ${status} for ${dispute.item.name}`,
        body: resolution || 'An admin has reviewed the case.',
        transaction: dispute.transaction,
        link: `/disputes/${dispute._id}`,
      });
    }
  }

  res.json({ success: true, dispute });
});
