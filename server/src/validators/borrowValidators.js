import { z } from 'zod';

const dateString = z.coerce.date({ errorMap: () => ({ message: 'Please provide valid dates.' }) });

export const createRequestSchema = z
  .object({
    item: z.string().min(1, 'Item is required.'),
    startDate: dateString,
    endDate: dateString,
    message: z.string().max(500).optional().default(''),
  })
  .refine((d) => d.endDate >= d.startDate, { message: 'End date must be after start date.' });

export const conditionReportSchema = z.object({
  condition: z.enum(['New', 'Like New', 'Good', 'Used', 'Damaged']),
  notes: z.string().max(1000).optional().default(''),
  photos: z.array(z.string()).max(6).optional().default([]),
});

export const createReviewSchema = z.object({
  transaction: z.string().min(1),
  ratings: z.object({
    communication: z.coerce.number().min(1).max(5),
    reliability: z.coerce.number().min(1).max(5),
    condition: z.coerce.number().min(1).max(5),
    onTime: z.coerce.number().min(1).max(5),
  }),
  comment: z.string().max(1000).optional().default(''),
});

export const createDisputeSchema = z.object({
  transaction: z.string().min(1),
  reason: z.string().min(3, 'Please give a short reason.').max(200),
  description: z.string().min(10, 'Please describe what happened (at least 10 characters).').max(2000),
  photos: z.array(z.string()).max(6).optional().default([]),
});
