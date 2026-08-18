import Dispute from '../models/Dispute.js';
import Transaction from '../models/Transaction.js';
import { notify } from '../services/notificationService.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const POPULATE = [
  { path: 'transaction', select: 'startDate endDate status conditionBefore conditionAfter rentTotal deposit' },
  { path: 'item', select: 'name images' },
  { path: 'raisedBy', select: 'name avatar trustScore trustLevel' },
  { path: 'against', select: 'name avatar trustScore trustLevel' },
];

// POST /api/disputes
export const createDispute = asyncHandler(async (req, res) => {
  const { transaction: transactionId, reason, description, photos } = req.body;

  const transaction = await Transaction.findById(transactionId).populate('item', 'name');
  if (!transaction) throw ApiError.notFound('Transaction not found.');

  const isOwner = String(transaction.owner) === String(req.user._id);
  const isBorrower = String(transaction.borrower) === String(req.user._id);
  if (!isOwner && !isBorrower) throw ApiError.forbidden('You are not part of this transaction.');
  if (!['active', 'returned', 'completed', 'disputed'].includes(transaction.status)) {
    throw ApiError.badRequest('A dispute can only be raised once borrowing has started.');
  }

  const existing = await Dispute.findOne({ transaction: transaction._id });
  if (existing) throw ApiError.conflict('A dispute already exists for this transaction.');

  const dispute = await Dispute.create({
    transaction: transaction._id,
    item: transaction.item._id,
    raisedBy: req.user._id,
    against: isOwner ? transaction.borrower : transaction.owner,
    reason,
    description,
    evidence: [{ by: req.user._id, description, photos }],
  });

  transaction.status = 'disputed';
  transaction.dispute = dispute._id;
  transaction.timeline.push({ key: 'disputed', label: 'Dispute opened', by: req.user._id });
  await transaction.save();

  await notify({
    user: dispute.against,
    type: 'dispute_opened',
    title: `A dispute was opened for ${transaction.item.name}`,
    body: `Reason: ${reason}. You can respond with your side and evidence.`,
    item: transaction.item._id,
    transaction: transaction._id,
    link: `/disputes/${dispute._id}`,
  });

  res.status(201).json({ success: true, dispute });
});

// GET /api/disputes/mine
export const myDisputes = asyncHandler(async (req, res) => {
  const disputes = await Dispute.find({
    $or: [{ raisedBy: req.user._id }, { against: req.user._id }],
  })
    .sort('-createdAt')
    .populate(POPULATE);
  res.json({ success: true, disputes });
});

// GET /api/disputes/:id
export const getDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate(POPULATE)
    .populate('evidence.by', 'name avatar');
  if (!dispute) throw ApiError.notFound('Dispute not found.');

  const isParty =
    String(dispute.raisedBy._id) === String(req.user._id) ||
    String(dispute.against._id) === String(req.user._id);
  if (!isParty && req.user.role !== 'admin') {
    throw ApiError.forbidden('You cannot view this dispute.');
  }
  res.json({ success: true, dispute });
});

// POST /api/disputes/:id/evidence  (either party responds)
export const addEvidence = asyncHandler(async (req, res) => {
  const { description, photos = [] } = req.body;
  if (!description || description.length < 10) {
    throw ApiError.badRequest('Please describe your side (at least 10 characters).');
  }

  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) throw ApiError.notFound('Dispute not found.');
  if (!['open', 'under_review'].includes(dispute.status)) {
    throw ApiError.conflict('This dispute has been closed.');
  }

  const isParty =
    String(dispute.raisedBy) === String(req.user._id) ||
    String(dispute.against) === String(req.user._id);
  if (!isParty) throw ApiError.forbidden('You are not part of this dispute.');

  dispute.evidence.push({ by: req.user._id, description, photos });
  if (dispute.status === 'open') dispute.status = 'under_review';
  await dispute.save();

  const otherParty =
    String(dispute.raisedBy) === String(req.user._id) ? dispute.against : dispute.raisedBy;
  await notify({
    user: otherParty,
    type: 'dispute_opened',
    title: 'New evidence added to your dispute',
    body: `${req.user.name} responded with their side.`,
    transaction: dispute.transaction,
    link: `/disputes/${dispute._id}`,
  });

  res.json({ success: true, dispute });
});
