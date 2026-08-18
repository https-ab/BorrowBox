import Transaction from '../models/Transaction.js';
import Item from '../models/Item.js';
import User from '../models/User.js';
import { refreshTrust } from '../services/trustScoreService.js';
import { notify } from '../services/notificationService.js';
import { startOfDay } from '../utils/dates.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const POPULATE = [
  { path: 'item', select: 'name images pricePerDay deposit city category condition rules' },
  { path: 'owner', select: 'name avatar city trustScore trustLevel isVerified' },
  { path: 'borrower', select: 'name avatar city trustScore trustLevel isVerified stats' },
  { path: 'dispute', select: 'status reason' },
];

function assertParticipant(transaction, userId) {
  const isOwner = String(transaction.owner._id || transaction.owner) === String(userId);
  const isBorrower = String(transaction.borrower._id || transaction.borrower) === String(userId);
  if (!isOwner && !isBorrower) throw ApiError.forbidden('You are not part of this transaction.');
  return { isOwner, isBorrower };
}

// GET /api/transactions?role=&status=
export const listTransactions = asyncHandler(async (req, res) => {
  const { role, status } = req.query;
  let filter;
  if (role === 'lender') filter = { owner: req.user._id };
  else if (role === 'borrower') filter = { borrower: req.user._id };
  else filter = { $or: [{ owner: req.user._id }, { borrower: req.user._id }] };
  if (status) filter.status = { $in: String(status).split(',') };

  const transactions = await Transaction.find(filter).sort('-updatedAt').limit(100).populate(POPULATE);
  res.json({ success: true, transactions });
});

// GET /api/transactions/:id
export const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate(POPULATE);
  if (!transaction) throw ApiError.notFound('Transaction not found.');
  assertParticipant(transaction, req.user._id);
  res.json({ success: true, transaction });
});

// PATCH /api/transactions/:id/handover (owner records condition-before, starts borrowing)
export const handover = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate('item', 'name');
  if (!transaction) throw ApiError.notFound('Transaction not found.');
  const { isOwner } = assertParticipant(transaction, req.user._id);
  if (!isOwner) throw ApiError.forbidden('Only the owner can record the handover.');
  if (transaction.status !== 'approved') {
    throw ApiError.conflict('Handover can only happen on an approved transaction.');
  }

  const { condition, notes, photos } = req.body;
  transaction.conditionBefore = {
    condition, notes, photos, recordedBy: req.user._id, recordedAt: new Date(),
  };
  transaction.status = 'active';
  transaction.timeline.push({ key: 'handover', label: 'Item handed over', by: req.user._id });
  await transaction.save();

  await notify({
    user: transaction.borrower,
    type: 'handover',
    title: `${transaction.item.name} handed over - happy borrowing!`,
    body: `Return by ${transaction.endDate.toDateString()}. Condition recorded: ${condition}.`,
    item: transaction.item._id,
    transaction: transaction._id,
    link: `/transactions/${transaction._id}`,
  });

  res.json({ success: true, transaction });
});

// PATCH /api/transactions/:id/return (borrower marks item as returned)
export const initiateReturn = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate('item', 'name');
  if (!transaction) throw ApiError.notFound('Transaction not found.');
  const { isBorrower } = assertParticipant(transaction, req.user._id);
  if (!isBorrower) throw ApiError.forbidden('Only the borrower can mark the item as returned.');
  if (transaction.status !== 'active') {
    throw ApiError.conflict('Only an active borrowing can be returned.');
  }

  transaction.status = 'returned';
  transaction.returnedAt = new Date();
  transaction.returnedOnTime = startOfDay(new Date()) <= startOfDay(transaction.endDate);
  transaction.timeline.push({ key: 'returned', label: 'Item returned', by: req.user._id });
  await transaction.save();

  await notify({
    user: transaction.owner,
    type: 'return_initiated',
    title: `${transaction.item.name} was returned`,
    body: 'Inspect the item and confirm its condition to complete the transaction.',
    item: transaction.item._id,
    transaction: transaction._id,
    link: `/transactions/${transaction._id}`,
  });

  res.json({ success: true, transaction });
});

// PATCH /api/transactions/:id/confirm (owner records condition-after and completes)
export const confirmReturn = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate('item', 'name');
  if (!transaction) throw ApiError.notFound('Transaction not found.');
  const { isOwner } = assertParticipant(transaction, req.user._id);
  if (!isOwner) throw ApiError.forbidden('Only the owner can confirm the return.');
  if (transaction.status !== 'returned') {
    throw ApiError.conflict('The borrower has not marked this item as returned yet.');
  }

  const { condition, notes, photos } = req.body;
  transaction.conditionAfter = {
    condition, notes, photos, recordedBy: req.user._id, recordedAt: new Date(),
  };
  transaction.status = 'completed';
  transaction.completedAt = new Date();
  transaction.timeline.push({ key: 'confirmed', label: 'Condition confirmed', by: req.user._id });
  transaction.timeline.push({ key: 'completed', label: 'Transaction completed', by: req.user._id });
  await transaction.save();

  // Update cached stats + item counters, then refresh trust for both parties
  const onTime = transaction.returnedOnTime !== false;
  await Promise.all([
    User.updateOne(
      { _id: transaction.borrower },
      { $inc: { 'stats.successfulBorrows': 1, [`stats.${onTime ? 'onTimeReturns' : 'lateReturns'}`]: 1 } }
    ),
    User.updateOne({ _id: transaction.owner }, { $inc: { 'stats.successfulLends': 1 } }),
    Item.updateOne(
      { _id: transaction.item._id },
      { $inc: { borrowCount: 1, totalEarnings: transaction.rentTotal } }
    ),
  ]);
  await Promise.all([refreshTrust(transaction.borrower), refreshTrust(transaction.owner)]);

  await notify({
    user: transaction.borrower,
    type: 'return_confirmed',
    title: `Return confirmed for ${transaction.item.name} ✅`,
    body: 'Your deposit is released. Leave a review to grow your trust score!',
    item: transaction.item._id,
    transaction: transaction._id,
    link: `/transactions/${transaction._id}`,
  });

  res.json({ success: true, transaction });
});
