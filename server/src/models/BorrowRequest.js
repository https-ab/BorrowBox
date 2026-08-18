import mongoose from 'mongoose';

export const REQUEST_STATUSES = ['pending', 'approved', 'rejected', 'cancelled', 'expired'];

const borrowRequestSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    message: { type: String, default: '', maxlength: 500 },
    status: { type: String, enum: REQUEST_STATUSES, default: 'pending', index: true },
    days: { type: Number, required: true },
    rentTotal: { type: Number, required: true },
    deposit: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    respondedAt: { type: Date },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  },
  { timestamps: true }
);

borrowRequestSchema.index({ item: 1, status: 1, startDate: 1, endDate: 1 });
borrowRequestSchema.index({ borrower: 1, status: 1 });
borrowRequestSchema.index({ owner: 1, status: 1 });

export default mongoose.model('BorrowRequest', borrowRequestSchema);
