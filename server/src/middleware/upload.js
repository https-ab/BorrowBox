import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype)) cb(null, true);
  else cb(ApiError.badRequest('Only image files (jpg, png, webp, gif) are allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});

export default upload;
