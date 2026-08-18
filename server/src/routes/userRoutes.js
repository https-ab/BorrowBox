import { Router } from 'express';
import { updateMe, getPublicProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/authValidators.js';

const router = Router();

router.put('/me', protect, validate(updateProfileSchema), updateMe);
router.get('/:id', getPublicProfile);

export default router;
