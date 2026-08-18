import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    /** 'borrower' means the reviewer borrowed the item (review is about lender + item) */
    reviewerRole: { type: String, enum: ['borrower', 'lender'], required: true },
    ratings: {
      communication: { type: Number, min: 1, max: 5, required: true },
      reliability: { type: Number, min: 1, max: 5, required: true },
      condition: { type: Number, min: 1, max: 5, required: true },
      onTime: { type: Number, min: 1, max: 5, required: true },
    },
    overall: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: '', maxlength: 1000 },
  },
  { timestamps: true }
);

// One review per user per transaction
reviewSchema.index({ transaction: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
