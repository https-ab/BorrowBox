import User from '../models/User.js';
import Item from '../models/Item.js';
import Review from '../models/Review.js';
import Transaction from '../models/Transaction.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// PUT /api/users/me - edit own profile
export const updateMe = asyncHandler(async (req, res) => {
  const { name, bio, city, avatar, lat, lng } = req.body;
  const user = req.user;

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (city !== undefined) user.city = city;
  if (avatar !== undefined) user.avatar = avatar;
  if (lat != null && lng != null) user.location = { type: 'Point', coordinates: [lng, lat] };

  await user.save();
  const obj = user.toObject();
  delete obj.password;
  res.json({ success: true, user: obj });
});

// GET /api/users/:id - public profile with items + reviews
export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found.');

  const [items, reviews, borrowHistoryCount] = await Promise.all([
    Item.find({ owner: user._id, status: 'active' })
      .sort('-createdAt')
      .limit(12)
      .select('name images pricePerDay rating reviewCount category city condition status'),
    Review.find({ reviewee: user._id })
      .sort('-createdAt')
      .limit(20)
      .populate('reviewer', 'name avatar city')
      .populate('item', 'name'),
    Transaction.countDocuments({ borrower: user._id, status: 'completed' }),
  ]);

  res.json({
    success: true,
    user: user.toPublicJSON(),
    items,
    reviews,
    borrowHistoryCount,
  });
});
