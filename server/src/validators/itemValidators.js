import { z } from 'zod';
import { CATEGORIES, CONDITIONS } from '../models/Item.js';

export const createItemSchema = z.object({
  name: z.string().min(3, 'Item name must be at least 3 characters.').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters.').max(2000),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Please choose a valid category.' }) }),
  images: z.array(z.string().min(1)).min(1, 'Please upload at least one item image.').max(6),
  condition: z.enum(CONDITIONS, { errorMap: () => ({ message: 'Please choose a valid condition.' }) }),
  conditionNotes: z.string().max(500).optional().default(''),
  pricePerDay: z.coerce.number().min(1, 'Price per day must be at least ₹1.').max(100000),
  deposit: z.coerce.number().min(0).max(1000000).default(0),
  city: z.string().min(2, 'City is required.'),
  area: z.string().max(100).optional().default(''),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  rules: z.string().max(1000).optional().default(''),
  minDays: z.coerce.number().min(1).max(60).default(1),
  maxDays: z.coerce.number().min(1).max(180).default(30),
  status: z.enum(['active', 'draft']).optional().default('active'),
});

export const updateItemSchema = createItemSchema.partial();
