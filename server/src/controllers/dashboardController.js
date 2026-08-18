import Item from '../models/Item.js';
import Transaction from '../models/Transaction.js';
import BorrowRequest from '../models/BorrowRequest.js';
import Review from '../models/Review.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/dashboard - personalized data for the logged-in user
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [
    currentlyBorrowing,
    upcomingReturns,
    pendingIncoming,
    pendingOutgoing,
    myItemsCount,
    lendingActive,
    recentTransactions,
    recommended,
    monthlyActivity,
  ] = await Promise.all([
    Transaction.find({ borrower: userId, status: 'active' })
      .populate('item', 'name images pricePerDay city')
      .populate('owner', 'name avatar'),
    Transaction.find({ borrower: userId, status: 'active', endDate: { $gte: new Date() } })
      .sort('endDate')
      .limit(5)
      .populate('item', 'name images'),
    BorrowRequest.countDocuments({ owner: userId, status: 'pending' }),
    BorrowRequest.countDocuments({ borrower: userId, status: 'pending' }),
    Item.countDocuments({ owner: userId, status: { $ne: 'removed' } }),
    Transaction.find({ owner: userId, status: { $in: ['approved', 'active', 'returned'] } })
      .populate('item', 'name images')
      .populate('borrower', 'name avatar trustScore'),
    Transaction.find({ $or: [{ owner: userId }, { borrower: userId }] })
      .sort('-updatedAt')
      .limit(6)
      .populate('item', 'name images')
      .populate('owner', 'name')
      .populate('borrower', 'name'),
    Item.find({ status: 'active', owner: { $ne: userId }, city: req.user.city })
      .sort('-rating -createdAt')
      .limit(6)
      .populate('owner', 'name avatar trustScore trustLevel'),
    // Last 6 months of the user's borrowing/lending activity for the chart
    Transaction.aggregate([
      {
        $match: {
          $or: [{ owner: userId }, { borrower: userId }],
          createdAt: { $gte: new Date(Date.now() - 183 * 86400000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          borrowed: { $sum: { $cond: [{ $eq: ['$borrower', userId] }, 1, 0] } },
          lent: { $sum: { $cond: [{ $eq: ['$owner', userId] }, 1, 0] } },
          earnings: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$owner', userId] }, { $eq: ['$status', 'completed'] }] },
                '$rentTotal',
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const earningsAgg = await Transaction.aggregate([
    { $match: { owner: userId, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$rentTotal' } } },
  ]);

  res.json({
    success: true,
    stats: {
      currentlyBorrowing: currentlyBorrowing.length,
      myItems: myItemsCount,
      pendingRequests: pendingIncoming,
      pendingOutgoing,
      trustScore: req.user.trustScore,
      totalEarnings: earningsAgg[0]?.total || 0,
    },
    currentlyBorrowing,
    upcomingReturns,
    lendingActive,
    recentTransactions,
    recommended,
    monthlyActivity,
  });
});
