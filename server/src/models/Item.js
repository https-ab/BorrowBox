import mongoose from 'mongoose';

export const CATEGORIES = [
  'Cameras',
  'Tools',
  'Books',
  'Gaming',
  'Camping',
  'Music',
  'Sports',
  'Electronics',
];

export const CONDITIONS = ['New', 'Like New', 'Good', 'Used'];

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Item name is required'], trim: true, maxlength: 100 },
    description: { type: String, required: [true, 'Description is required'], maxlength: 2000 },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    images: {
      type: [String],
      validate: [(v) => v.length > 0, 'Please upload at least one item image.'],
    },
    condition: { type: String, enum: CONDITIONS, required: true },
    conditionNotes: { type: String, default: '', maxlength: 500 },
    pricePerDay: { type: Number, required: true, min: [0, 'Price must be positive'] },
    deposit: { type: Number, required: true, min: 0, default: 0 },
    city: { type: String, required: true, trim: true },
    area: { type: String, default: '', trim: true },
    location: { type: pointSchema, required: true },
    rules: { type: String, default: '', maxlength: 1000 },
    minDays: { type: Number, default: 1, min: 1 },
    maxDays: { type: Number, default: 30, min: 1 },
    status: { type: String, enum: ['active', 'paused', 'draft', 'removed'], default: 'active', index: true },

    // Denormalized stats (kept in sync by services)
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    borrowCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

itemSchema.index({ location: '2dsphere' });
itemSchema.index({ name: 'text', description: 'text' });
itemSchema.index({ category: 1, status: 1, pricePerDay: 1 });
itemSchema.index({ rating: -1 });
itemSchema.index({ createdAt: -1 });

export default mongoose.model('Item', itemSchema);
