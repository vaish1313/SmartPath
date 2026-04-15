const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      enum: ['Percent', 'Gift', 'Sparkles', 'Clock', 'Star', 'Tag', 'Zap', 'Heart', 'Award', 'TrendingUp'],
      default: 'Percent',
    },
    color: {
      type: String,
      enum: [
        'text-teal-400',
        'text-cyan-400',
        'text-amber-400',
        'text-violet-400',
        'text-pink-400',
        'text-emerald-400',
        'text-orange-400',
        'text-rose-400',
        'text-blue-400',
        'text-indigo-400',
        'text-yellow-400',
        'text-purple-400',
        'text-red-400',
        'text-green-400',
      ],
      default: 'text-teal-400',
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
offerSchema.index({ isActive: 1, priority: -1 });

module.exports = mongoose.model('Offer', offerSchema);
