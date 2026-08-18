import User from '../models/User.js';
import Review from '../models/Review.js';

/**
 * BorrowBox Trust Score (0-100)
 * ------------------------------------------------
 * base                 +10  everyone starts with a baseline
 * successful txns      up to +30  (+3 per completed transaction)
 * on-time returns      up to +25  (on-time rate x 25, needs >= 1 return)
 * positive reviews     up to +20  (avg rating / 5 x 20, needs >= 1 review)
 * verified identity    +10
 * account age          up to +9   (+1 per month on the platform)
 * penalties            -3 per cancellation (max -15), -10 per lost dispute
 *
 * Levels:  0-39 New Member | 40-64 Reliable | 65-84 Trusted | 85+ Highly Trusted
 */
export function computeTrust(user, reviewAverage) {
  const s = user.stats || {};
  const completed = (s.successfulBorrows || 0) + (s.successfulLends || 0);
  const returns = (s.onTimeReturns || 0) + (s.lateReturns || 0);

  const base = 10;
  const successfulTransactions = Math.min(30, completed * 3);
  const onTimeReturns = returns > 0 ? Math.round(((s.onTimeReturns || 0) / returns) * 25) : 0;
  const positiveReviews =
    (s.reviewCount || 0) > 0 ? Math.round(((reviewAverage || 0) / 5) * 20) : 0;
  const verifiedIdentity = user.isVerified ? 10 : 0;
  const months = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (30 * 86400000));
  const accountAge = Math.min(9, months);
  const penalties = -(
    Math.min(15, (s.cancellations || 0) * 3) + (s.disputesLost || 0) * 10
  );

  const score = Math.max(
    0,
    Math.min(100, base + successfulTransactions + onTimeReturns + positiveReviews + verifiedIdentity + accountAge + penalties)
  );

  let level = 'New Member';
  if (score >= 85) level = 'Highly Trusted';
  else if (score >= 65) level = 'Trusted';
  else if (score >= 40) level = 'Reliable';

  return {
    score,
    level,
    breakdown: { base, successfulTransactions, onTimeReturns, positiveReviews, verifiedIdentity, accountAge, penalties },
  };
}

/** Badges earned from behaviour, not purchases. */
export function computeBadges(user, reviewAverage) {
  const s = user.stats || {};
  const badges = [];
  if (user.isVerified) badges.push('Verified User');
  if ((s.successfulBorrows || 0) >= 3 && (s.lateReturns || 0) === 0) badges.push('Reliable Borrower');
  if ((s.onTimeReturns || 0) >= 5) badges.push('On-Time Returner');
  if ((s.successfulLends || 0) >= 3 && (reviewAverage || 0) >= 4.5) badges.push('Trusted Lender');
  return badges;
}

/** Recomputes and persists a user's trust score, level, breakdown and badges. */
export async function refreshTrust(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const agg = await Review.aggregate([
    { $match: { reviewee: user._id } },
    { $group: { _id: null, avg: { $avg: '$overall' }, count: { $sum: 1 } } },
  ]);
  const reviewAverage = agg[0]?.avg || 0;
  user.stats.reviewCount = agg[0]?.count || 0;
  user.stats.averageRating = Math.round(reviewAverage * 10) / 10;

  const { score, level, breakdown } = computeTrust(user, reviewAverage);
  user.trustScore = score;
  user.trustLevel = level;
  user.trustBreakdown = breakdown;
  user.badges = computeBadges(user, reviewAverage);
  await user.save();
  return user;
}
