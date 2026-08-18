import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const signToken = (id) => jwt.sign({ id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const authResponse = (user) => ({
  success: true,
  token: signToken(user._id),
  user: sanitize(user),
});

function sanitize(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  return obj;
}

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, city, avatar, lat, lng } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists.');

  const user = await User.create({
    name,
    email,
    password,
    city,
    avatar: avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6d5ef3&fontFamily=Verdana`,
    location: lat != null && lng != null ? { type: 'Point', coordinates: [lng, lat] } : undefined,
  });

  res.status(201).json(authResponse(user));
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Incorrect email or password.');
  }
  if (user.isSuspended) throw ApiError.forbidden('Your account has been suspended. Contact support.');
  res.json(authResponse(user));
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitize(req.user) });
});
