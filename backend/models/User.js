const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // Optional for wallet-only users
  },
  displayName: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500,
  },
  avatar: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  walletAddress: {
    type: String,
    default: '',
  },
  buttons: [{
    id: String,
    type: {
      type: String,
      enum: ['tip', 'social', 'link'],
      required: true,
    },
    title: String,
    url: String,
    amount: Number,
    icon: String,
    style: {
      bgColor: String,
      textColor: String,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    order: Number,
  }],
  style: {
    template: {
      type: String,
      default: 'centered',
    },
    colorScheme: {
      type: String,
      default: 'purple',
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    font: {
      type: String,
      default: 'inter',
    },
    background: {
      type: String,
      default: '#ffffff',
    },
  },
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    showEarnings: {
      type: Boolean,
      default: false,
    },
    requireMessage: {
      type: Boolean,
      default: false,
    },
  },
  stats: {
    totalVisits: {
      type: Number,
      default: 0,
    },
    totalClicks: {
      type: Number,
      default: 0,
    },
    totalTips: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', UserSchema);
