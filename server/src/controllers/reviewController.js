import Review from '../models/Review.js';
import Transaction from '../models/Transaction.js';
import Item from '../models/Item.js';
import { refreshTrust } from '../services/trustScoreService.js';
import { notify } from '../services/notificationService.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/** Recomputes an item's denormalized rating from borrower->lender reviews. */
async function refreshItemRating(itemId) {
  const agg = await Review.aggregate([
    { $match: { item: itemId, reviewerRole: 'borrower' } },
    { $group: { _id: null, avg: { $avg: '$overall' }, count: { $sum: 1 } } },
  ]);
  await Item.updateOne(
    { _id: itemId },
    { rating: Math.round((agg[0]?.avg || 0) * 10) / 10, reviewCount: agg[0]?.count || 0 }
  );
}

// POST /api/reviews
export const createReview = asyncHandler(async (req, res) => {
  const { transaction: transactionId, ratings, comment } = req.body;

  const transaction = await Transaction.findById(transactionId).populate('item', 'name');
  if (!transaction) throw ApiError.notFound('Transaction not found.');
  if (transaction.status !== 'completed') {
    throw ApiError.badRequest('You can review only after the transaction is completed.');
  }

  const isOwner = String(transaction.owner) === String(req.user._id);
  const isBorrower = String(transaction.borrower) === String(req.user._id);
  if (!isOwner && !isBorrower) throw ApiError.forbidden('You are not part of this transaction.');

  const existing = await Review.exists({ transaction: transaction._id, reviewer: req.user._id });
  if (existing) throw ApiError.conflict('You have already reviewed this transaction.');

  const overall =
    Math.round(((ratings.communication + ratings.reliability + ratings.condition + ratings.onTime) / 4) * 10) / 10;

  const review = await Review.create({
    transaction: transaction._id,
    item: transaction.item._id,
    reviewer: req.user._id,
    reviewee: isBorrower ? transaction.owner : transaction.borrower,
    reviewerRole: isBorrower ? 'borrower' : 'lender',
    ratings,
    overall,
    comment,
  });

  if (isBorrower) await refreshItemRating(transaction.item._id);
  await refreshTrust(review.reviewee);

  await notify({
    user: review.reviewee,
    type: 'review_received',
    title: `New review received · ${'★'.repeat(Math.round(overall))}`,
    body: comment ? `"${comment.slice(0, 80)}"` : `${req.user.name} rated you ${overall}/5.`,
    item: transaction.item._id,
    transaction: transaction._id,
    link: '/profile',
  });

  res.status(201).json({ success: true, review });
});

// GET /api/reviews/user/:id  (with aggregate dimension stats)
export const userReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.id })
    .sort('-createdAt')
    .limit(50)
    .populate('reviewer', 'name avatar city')
    .populate('item', 'name');

  const agg = await Review.aggregate([
    { $match: { reviewee: reviews[0]?.reviewee || null } },
    {
      $group: {
        _id: null,
        communication: { $avg: '$ratings.communication' },
        reliability: { $avg: '$ratings.reliability' },
        condition: { $avg: '$ratings.condition' },
        onTime: { $avg: '$ratings.onTime' },
        overall: { $avg: '$overall' },
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({ success: true, reviews, aggregate: agg[0] || null });
});

// GET /api/reviews/item/:id
export const itemReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ item: req.params.id, reviewerRole: 'borrower' })
    .sort('-createdAt')
    .limit(50)
    .populate('reviewer', 'name avatar city trustLevel');
  res.json({ success: true, reviews });
});

// GET /api/reviews/pending - completed transactions the user hasn't reviewed yet
export const pendingReviews = asyncHandler(async (req, res) => {
  const completed = await Transaction.find({
    status: 'completed',
    $or: [{ owner: req.user._id }, { borrower: req.user._id }],
  })
    .sort('-completedAt')
    .limit(20)
    .populate('item', 'name images')
    .populate('owner', 'name avatar')
    .populate('borrower', 'name avatar');

  const reviewed = await Review.find({
    reviewer: req.user._id,
    transaction: { $in: completed.map((t) => t._id) },
  }).distinct('transaction');
  const reviewedSet = new Set(reviewed.map(String));

  res.json({
    success: true,
    transactions: completed.filter((t) => !reviewedSet.has(String(t._id))),
  });
});
