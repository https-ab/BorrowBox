import { uploadImage } from '../services/uploadService.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/uploads  (multipart, field name: images)
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('Please upload at least one item image.');
  }
  const urls = await Promise.all(req.files.map((file) => uploadImage(file)));
  res.status(201).json({ success: true, urls });
});
