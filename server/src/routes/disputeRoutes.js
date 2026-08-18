import { Router } from 'express';
import { createDispute, myDisputes, getDispute, addEvidence } from '../controllers/disputeController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createDisputeSchema } from '../validators/borrowValidators.js';

const router = Router();

router.use(protect);
router.post('/', validate(createDisputeSchema), createDispute);
router.get('/mine', myDisputes);
router.get('/:id', getDispute);
router.post('/:id/evidence', addEvidence);

export default router;
