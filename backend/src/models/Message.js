const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'trade_proposal', 'system', 'image'],
    default: 'text'
  },
  tradeAction: {
    type: {
      type: String,
      enum: ['propose_duration', 'suggest_time', 'accept_trade', 'counter_offer']
    },
    payload: mongoose.Schema.Types.Mixed
  },
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

messageSchema.index({ room: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

module.exports = mongoose.model('Message', messageSchema);
