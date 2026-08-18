import mongoose from 'mongoose';

export const TRANSACTION_STATUSES = [
  'approved', // request accepted, waiting for handover
  'active', // item handed over, borrowing in progress
  'returned', // borrower marked returned, waiting for owner confirmation
  'completed', // owner confirmed condition, all done
  'disputed', // condition disagreement
  'cancelled',
];

const conditionReportSchema = new mongoose.Schema(
  {
    condition: { type: String, enum: ['New', 'Like New', 'Good', 'Used', 'Damaged'] },
    notes: { type: String, default: '', maxlength: 1000 },
    photos: [{ type: String }],
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recordedAt: { type: Date },
  },
  { _id: false }
);

const timelineEventSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // requested | approved | handover | returned | confirmed | completed | disputed | cancelled
    label: { type: String, required: true },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRequest', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    rentTotal: { type: Number, required: true },
    deposit: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    status: { type: String, enum: TRANSACTION_STATUSES, default: 'approved', index: true },
    conditionBefore: { type: conditionReportSchema, default: null },
    conditionAfter: { type: conditionReportSchema, default: null },
    returnedAt: { type: Date },
    completedAt: { type: Date },
    returnedOnTime: { type: Boolean },
    timeline: { type: [timelineEventSchema], default: [] },
    dispute: { type: mongoose.Schema.Types.ObjectId, ref: 'Dispute' },
  },
  { timestamps: true }
);

// Core index for availability conflict checks
transactionSchema.index({ item: 1, status: 1, startDate: 1, endDate: 1 });
transactionSchema.index({ borrower: 1, status: 1 });
transactionSchema.index({ owner: 1, status: 1 });

export default mongoose.model('Transaction', transactionSchema);
