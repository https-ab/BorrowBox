import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.originalUrl} not found.`));
}

/** Centralized error handler - never leaks internals to clients. */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong.';

  // Mongoose validation errors -> friendly 400
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(' ');
  }
  // Invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier.';
  }
  // Duplicate keys (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = field === 'email' ? 'An account with this email already exists.' : `Duplicate ${field}.`;
  }

  if (statusCode === 500) {
    console.error('[error]', err);
    if (env.nodeEnv === 'production') message = 'Something went wrong on our side. Please try again.';
  }

  res.status(statusCode).json({ success: false, message });
}
