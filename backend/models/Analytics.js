const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    enum: ['visit', 'click', 'tip'],
    required: true,
  },
  buttonId: {
    type: String,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  ip: {
    type: String,
  },
  userAgent: {
    type: String,
  },
});

// Index for time-series queries
AnalyticsSchema.index({ username: 1, timestamp: -1 });
AnalyticsSchema.index({ username: 1, eventType: 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
