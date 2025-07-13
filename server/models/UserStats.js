import mongoose from 'mongoose';

const userStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalEmitted: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSaved: {
    type: Number,
    default: 0,
    min: 0
  },
  netFootprint: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  rank: {
    type: Number,
    default: 6,
    min: 1,
    max: 6
  },
  streak: {
    current: {
      type: Number,
      default: 0,
      min: 0
    },
    longest: {
      type: Number,
      default: 0,
      min: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  achievements: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  badges: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: Number,
      default: 1
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  cashbackEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  cashbackRedeemed: {
    type: Number,
    default: 0,
    min: 0
  },
  tier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Bronze'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
userStatsSchema.index({ points: -1 });
userStatsSchema.index({ totalSaved: -1 });
userStatsSchema.index({ tier: 1 });

// Virtual for available cashback
userStatsSchema.virtual('availableCashback').get(function() {
  return this.cashbackEarned - this.cashbackRedeemed;
});

// Virtual for rank title
userStatsSchema.virtual('rankTitle').get(function() {
  const titles = {
    1: 'Eco Master',
    2: 'Green Champion',
    3: 'Sustainability Expert',
    4: 'Eco Warrior',
    5: 'Green Beginner',
    6: 'Newcomer'
  };
  return titles[this.rank] || 'Newcomer';
});

// Ensure virtuals are included in JSON
userStatsSchema.set('toJSON', { virtuals: true });

// Method to update stats
userStatsSchema.methods.updateStats = function() {
  // This will be implemented in the service layer
  this.lastUpdated = new Date();
  return this.save();
};

export default mongoose.model('UserStats', userStatsSchema); 