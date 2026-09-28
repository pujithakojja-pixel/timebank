const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'new_match', 'trade_request', 'trade_accepted', 'trade_rejected',
      'trade_scheduled', 'trade_completed', 'trade_cancelled',
      'new_message', 'credits_received', 'vouch_received',
      'upcoming_trade', 'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  icon: String,
  link: String,
  isRead: {
    type: Boolean,
    default: false
  },
  data: {
    type: Map,
    of: String
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedTrade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade'
  },
  relatedMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
