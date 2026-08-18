import { Router } from 'express';
import { createReview, userReviews, itemReviews, pendingReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createReviewSchema } from '../validators/borrowValidators.js';

const router = Router();

router.post('/', protect, validate(createReviewSchema), createReview);
router.get('/pending', protect, pendingReviews);
router.get('/user/:id', userReviews);
router.get('/item/:id', itemReviews);

export default router;
