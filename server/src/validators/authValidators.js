import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(60),
  email: z.string().email('Please provide a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  city: z.string().min(2, 'Please tell us your city.'),
  avatar: z.string().optional().default(''),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  bio: z.string().max(500).optional(),
  city: z.string().min(2).optional(),
  avatar: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});
