import { Router } from 'express';
import {
  listItems, nearbyItems, featuredItems, categoryCounts, getItem, getAvailability,
  createItem, updateItem, setItemStatus, deleteItem, myItems,
} from '../controllers/itemController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createItemSchema, updateItemSchema } from '../validators/itemValidators.js';

const router = Router();

router.get('/', listItems);
router.get('/nearby', nearbyItems);
router.get('/featured', featuredItems);
router.get('/categories', categoryCounts);
router.get('/mine', protect, myItems);
router.get('/:id', optionalAuth, getItem);
router.get('/:id/availability', getAvailability);

router.post('/', protect, validate(createItemSchema), createItem);
router.put('/:id', protect, validate(updateItemSchema), updateItem);
router.patch('/:id/status', protect, setItemStatus);
router.delete('/:id', protect, deleteItem);

export default router;
