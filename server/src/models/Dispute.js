import mongoose from 'mongoose';

export const DISPUTE_STATUSES = ['open', 'under_review', 'resolved', 'rejected'];

const evidenceSchema = new mongoose.Schema(
  {
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true, maxlength: 1000 },
    photos: [{ type: String }],
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const disputeSchema = new mongoose.Schema(
  {
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true, unique: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    against: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    evidence: { type: [evidenceSchema], default: [] },
    status: { type: String, enum: DISPUTE_STATUSES, default: 'open', index: true },
    resolution: { type: String, default: '', maxlength: 2000 },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    /** Who the admin ruled in favour of (optional) */
    ruledAgainst: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

disputeSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Dispute', disputeSchema);
