import { Router } from 'express';
import {
  createRequest, listRequests, approveRequest, rejectRequest, cancelRequest,
} from '../controllers/borrowRequestController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createRequestSchema } from '../validators/borrowValidators.js';

const router = Router();

router.use(protect);
router.post('/', validate(createRequestSchema), createRequest);
router.get('/', listRequests);
router.patch('/:id/approve', approveRequest);
router.patch('/:id/reject', rejectRequest);
router.patch('/:id/cancel', cancelRequest);

export default router;
