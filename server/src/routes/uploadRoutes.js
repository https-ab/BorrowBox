import { Router } from 'express';
import { uploadImages } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

router.post('/', protect, upload.array('images', 6), uploadImages);

export default router;
