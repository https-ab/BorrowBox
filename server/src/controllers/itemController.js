import Item, { CATEGORIES } from '../models/Item.js';
import BorrowRequest from '../models/BorrowRequest.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { getBookedRanges } from '../services/availabilityService.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/** Haversine distance in km between [lng,lat] pairs */
function distanceKm([lng1, lat1], [lng2, lat2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function attachDistance(items, lat, lng) {
  if (lat == null || lng == null) return items;
  return items.map((item) => {
    const obj = item.toObject ? item.toObject() : item;
    if (obj.location?.coordinates) {
      obj.distanceKm = Math.round(distanceKm([lng, lat], obj.location.coordinates) * 10) / 10;
    }
    return obj;
  });
}

// GET /api/items - discovery with search, filters, sort, pagination
export const listItems = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const {
    search, category, condition, minPrice, maxPrice, minRating, minTrust,
    city, lat, lng, maxDistance, sort = 'recent', from, to,
  } = req.query;

  const filter = { status: 'active' };
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
    { category: { $regex: search, $options: 'i' } },
  ];
  if (category && CATEGORIES.includes(category)) filter.category = category;
  if (condition) filter.condition = { $in: String(condition).split(',') };
  if (minPrice) filter.pricePerDay = { ...filter.pricePerDay, $gte: Number(minPrice) };
  if (maxPrice) filter.pricePerDay = { ...filter.pricePerDay, $lte: Number(maxPrice) };
  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (city) filter.city = { $regex: `^${city}$`, $options: 'i' };

  const parsedLat = lat != null && lat !== '' ? Number(lat) : null;
  const parsedLng = lng != null && lng !== '' ? Number(lng) : null;

  // Geospatial radius filter
  if (parsedLat != null && parsedLng != null && maxDistance) {
    filter.location = {
      $geoWithin: {
        $centerSphere: [[parsedLng, parsedLat], Number(maxDistance) / 6371],
      },
    };
  }

  // Availability window filter: exclude items with conflicting bookings
  if (from && to) {
    const conflicting = await Transaction.find({
      status: { $in: ['approved', 'active', 'disputed'] },
      startDate: { $lte: new Date(to) },
      endDate: { $gte: new Date(from) },
    }).distinct('item');
    filter._id = { $nin: conflicting };
  }

  // Trust filter requires owners above a score
  if (minTrust) {
    const trustedOwners = await User.find({ trustScore: { $gte: Number(minTrust) } }).distinct('_id');
    filter.owner = { $in: trustedOwners };
  }

  const sortMap = {
    recent: '-createdAt',
    price_low: 'pricePerDay',
    price_high: '-pricePerDay',
    rating: '-rating -reviewCount',
    popular: '-borrowCount -views',
  };

  let query = Item.find(filter)
    .populate('owner', 'name avatar city trustScore trustLevel isVerified')
    .skip(skip)
    .limit(limit);

  // "nearby" sort uses $geoNear semantics via find+sort on distance client-side;
  // for correctness with pagination we sort in-memory only for this page size.
  if (sort === 'trusted') {
    query = query.sort('-createdAt');
  } else {
    query = query.sort(sortMap[sort] || '-createdAt');
  }

  const [itemsRaw, total] = await Promise.all([query, Item.countDocuments(filter)]);
  let items = attachDistance(itemsRaw, parsedLat, parsedLng);

  if (sort === 'nearby' && parsedLat != null) {
    items = items.sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
  }
  if (sort === 'trusted') {
    items = items.sort((a, b) => (b.owner?.trustScore || 0) - (a.owner?.trustScore || 0));
  }

  res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
});

// GET /api/items/nearby?lat=&lng=&radius= - geospatial $near query
export const nearbyItems = asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Math.min(100, Number(req.query.radius) || 10); // km
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw ApiError.badRequest('lat and lng are required for nearby search.');
  }

  const items = await Item.find({
    status: 'active',
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radius * 1000,
      },
    },
  })
    .limit(40)
    .populate('owner', 'name avatar city trustScore trustLevel isVerified');

  res.json({ success: true, items: attachDistance(items, lat, lng) });
});

// GET /api/items/featured - highest rated active items for the landing page
export const featuredItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ status: 'active', reviewCount: { $gte: 1 } })
    .sort('-rating -borrowCount')
    .limit(8)
    .populate('owner', 'name avatar city trustScore trustLevel isVerified');
  res.json({ success: true, items });
});

// GET /api/items/categories - category counts for filters/landing
export const categoryCounts = asyncHandler(async (req, res) => {
  const counts = await Item.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  res.json({
    success: true,
    categories: CATEGORIES.map((name) => ({ name, count: map[name] || 0 })),
  });
});

// GET /api/items/:id
export const getItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id).populate(
    'owner',
    'name avatar city bio trustScore trustLevel badges isVerified stats createdAt'
  );
  if (!item || item.status === 'removed') throw ApiError.notFound('This item is no longer available.');

  // Count a view (not for the owner)
  if (!req.user || String(req.user._id) !== String(item.owner._id)) {
    Item.updateOne({ _id: item._id }, { $inc: { views: 1 } }).exec();
  }

  const bookedRanges = await getBookedRanges(item._id);
  res.json({ success: true, item, bookedRanges });
});

// GET /api/items/:id/availability
export const getAvailability = asyncHandler(async (req, res) => {
  const bookedRanges = await getBookedRanges(req.params.id);
  res.json({ success: true, bookedRanges });
});

// POST /api/items
export const createItem = asyncHandler(async (req, res) => {
  const { lat, lng, ...rest } = req.body;
  const item = await Item.create({
    ...rest,
    owner: req.user._id,
    location: { type: 'Point', coordinates: [lng, lat] },
  });
  res.status(201).json({ success: true, item });
});

// PUT /api/items/:id (owner only)
export const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw ApiError.notFound('Item not found.');
  if (String(item.owner) !== String(req.user._id)) {
    throw ApiError.forbidden('You can only edit your own items.');
  }

  const { lat, lng, ...rest } = req.body;
  Object.assign(item, rest);
  if (lat != null && lng != null) item.location = { type: 'Point', coordinates: [lng, lat] };
  await item.save();
  res.json({ success: true, item });
});

// PATCH /api/items/:id/status  { status: 'active' | 'paused' }
export const setItemStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'paused'].includes(status)) throw ApiError.badRequest('Invalid status.');

  const item = await Item.findById(req.params.id);
  if (!item) throw ApiError.notFound('Item not found.');
  if (String(item.owner) !== String(req.user._id)) {
    throw ApiError.forbidden('You can only manage your own items.');
  }
  item.status = status;
  await item.save();
  res.json({ success: true, item });
});

// DELETE /api/items/:id (owner only, blocked while borrowed)
export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw ApiError.notFound('Item not found.');
  if (String(item.owner) !== String(req.user._id)) {
    throw ApiError.forbidden('You can only delete your own items.');
  }

  const activeTxn = await Transaction.exists({
    item: item._id,
    status: { $in: ['approved', 'active', 'disputed'] },
  });
  if (activeTxn) {
    throw ApiError.conflict('This item has an active borrowing and cannot be deleted right now.');
  }

  const hasHistory = await Transaction.exists({ item: item._id });
  if (hasHistory) {
    item.status = 'removed'; // soft delete to keep transaction history intact
    await item.save();
  } else {
    await item.deleteOne();
    await BorrowRequest.deleteMany({ item: item._id });
  }
  res.json({ success: true, message: 'Item removed.' });
});

// GET /api/items/mine - owner dashboard for "My Items"
export const myItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ owner: req.user._id, status: { $ne: 'removed' } }).sort('-createdAt');

  const ids = items.map((i) => i._id);
  const [requestCounts, activeBorrows] = await Promise.all([
    BorrowRequest.aggregate([
      { $match: { item: { $in: ids }, status: 'pending' } },
      { $group: { _id: '$item', count: { $sum: 1 } } },
    ]),
    Transaction.find({ item: { $in: ids }, status: { $in: ['approved', 'active'] } }).select('item status endDate'),
  ]);
  const pendingMap = Object.fromEntries(requestCounts.map((r) => [String(r._id), r.count]));
  const borrowMap = {};
  activeBorrows.forEach((t) => { borrowMap[String(t.item)] = { status: t.status, endDate: t.endDate }; });

  res.json({
    success: true,
    items: items.map((item) => ({
      ...item.toObject(),
      pendingRequests: pendingMap[String(item._id)] || 0,
      currentBorrow: borrowMap[String(item._id)] || null,
    })),
  });
});
