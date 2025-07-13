import mongoose from 'mongoose';

const carbonActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['transportation', 'food', 'energy', 'shopping', 'waste']
  },
  type: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  carbonAmount: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  date: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: undefined
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
carbonActivitySchema.index({ user: 1, date: -1 });
carbonActivitySchema.index({ user: 1, category: 1 });
carbonActivitySchema.index({ date: -1 });

// Virtual for formatted date
carbonActivitySchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Ensure virtuals are included in JSON
carbonActivitySchema.set('toJSON', { virtuals: true });

export default mongoose.model('CarbonActivity', carbonActivitySchema); 