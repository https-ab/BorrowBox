import { Router } from 'express';
import {
  listTransactions, getTransaction, handover, initiateReturn, confirmReturn,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { conditionReportSchema } from '../validators/borrowValidators.js';

const router = Router();

router.use(protect);
router.get('/', listTransactions);
router.get('/:id', getTransaction);
router.patch('/:id/handover', validate(conditionReportSchema), handover);
router.patch('/:id/return', initiateReturn);
router.patch('/:id/confirm', validate(conditionReportSchema), confirmReturn);

export default router;
