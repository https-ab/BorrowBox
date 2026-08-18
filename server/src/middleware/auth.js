import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/** Requires a valid Bearer token; attaches req.user. */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized('Please log in to continue.');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw ApiError.unauthorized();
  }

  const user = await User.findById(payload.id);
  if (!user) throw ApiError.unauthorized();
  if (user.isSuspended) throw ApiError.forbidden('Your account has been suspended. Contact support.');

  req.user = user;
  next();
});

/** Attaches req.user when a token exists but never fails. */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, env.jwtSecret);
      req.user = await User.findById(payload.id);
    } catch {
      /* ignore invalid tokens for optional auth */
    }
  }
  next();
});

/** Role guard: adminOnly */
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(ApiError.forbidden('Admin access required.'));
  }
  next();
};
