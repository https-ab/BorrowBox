import { Router } from 'express';
import {
  platformStats, listUsers, suspendUser, verifyUser,
  listAllItems, removeItem, listAllTransactions, listDisputes, resolveDispute,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect, adminOnly);
router.get('/stats', platformStats);
router.get('/users', listUsers);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/verify', verifyUser);
router.get('/items', listAllItems);
router.patch('/items/:id/remove', removeItem);
router.get('/transactions', listAllTransactions);
router.get('/disputes', listDisputes);
router.patch('/disputes/:id/resolve', resolveDispute);

export default router;
