import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = [
  'request_received',
  'request_approved',
  'request_rejected',
  'request_cancelled',
  'handover',
  'return_initiated',
  'return_confirmed',
  'return_due',
  'review_received',
  'dispute_opened',
  'dispute_resolved',
  'system',
];

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    isRead: { type: Boolean, default: false, index: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRequest' },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
