const mongoose = require('mongoose');

const TipSchema = new mongoose.Schema({
  creatorUsername: {
    type: String,
    required: true,
    index: true,
  },
  senderAddress: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
    maxlength: 280,
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  txId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Index for efficient queries
TipSchema.index({ creatorUsername: 1, createdAt: -1 });

module.exports = mongoose.model('Tip', TipSchema);
