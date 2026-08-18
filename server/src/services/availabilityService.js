import Transaction from '../models/Transaction.js';
import { startOfDay } from '../utils/dates.js';

/** Transaction statuses that block an item's calendar. */
const BLOCKING_STATUSES = ['approved', 'active', 'disputed'];

/**
 * Returns booked date ranges for an item.
 * Used to render the availability calendar and validate requests.
 */
export async function getBookedRanges(itemId) {
  const transactions = await Transaction.find({
    item: itemId,
    status: { $in: BLOCKING_STATUSES },
    endDate: { $gte: startOfDay(new Date()) },
  }).select('startDate endDate status');

  return transactions.map((t) => ({
    startDate: t.startDate,
    endDate: t.endDate,
    status: t.status,
  }));
}

/**
 * Server-side conflict check. Must be called before approving/creating bookings
 * even if the frontend already blocked the dates (frontend can be manipulated).
 */
export async function hasDateConflict(itemId, startDate, endDate, excludeTransactionId = null) {
  const query = {
    item: itemId,
    status: { $in: BLOCKING_STATUSES },
    // Overlap: existing.start <= requested.end AND existing.end >= requested.start
    startDate: { $lte: startOfDay(endDate) },
    endDate: { $gte: startOfDay(startDate) },
  };
  if (excludeTransactionId) query._id = { $ne: excludeTransactionId };
  const conflict = await Transaction.exists(query);
  return Boolean(conflict);
}
