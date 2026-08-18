import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [73.8567, 18.5204] }, // [lng, lat] - Pune default
  },
  { _id: false }
);

const trustBreakdownSchema = new mongoose.Schema(
  {
    base: { type: Number, default: 10 },
    successfulTransactions: { type: Number, default: 0 },
    onTimeReturns: { type: Number, default: 0 },
    positiveReviews: { type: Number, default: 0 },
    verifiedIdentity: { type: Number, default: 0 },
    accountAge: { type: Number, default: 0 },
    penalties: { type: Number, default: 0 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    city: { type: String, required: [true, 'City is required'], trim: true },
    location: { type: pointSchema, default: () => ({}) },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },

    // Trust system (computed by trustScoreService)
    trustScore: { type: Number, default: 25, min: 0, max: 100 },
    trustLevel: {
      type: String,
      enum: ['New Member', 'Reliable', 'Trusted', 'Highly Trusted'],
      default: 'New Member',
    },
    trustBreakdown: { type: trustBreakdownSchema, default: () => ({}) },
    badges: [{ type: String }],

    // Cached counters used for stats & trust computation
    stats: {
      successfulBorrows: { type: Number, default: 0 },
      successfulLends: { type: Number, default: 0 },
      onTimeReturns: { type: Number, default: 0 },
      lateReturns: { type: Number, default: 0 },
      cancellations: { type: Number, default: 0 },
      disputesLost: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });
userSchema.index({ trustScore: -1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    avatar: this.avatar,
    bio: this.bio,
    city: this.city,
    isVerified: this.isVerified,
    trustScore: this.trustScore,
    trustLevel: this.trustLevel,
    badges: this.badges,
    stats: this.stats,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
