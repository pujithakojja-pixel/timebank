const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.5
  },
  type: {
    type: String,
    enum: ['trade_payment', 'bonus', 'refund', 'initial_grant', 'penalty'],
    required: true
  },
  trade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade'
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  },
  skillName: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'reversed'],
    default: 'pending'
  },
  description: String,
  metadata: {
    type: Map,
    of: String
  }
}, { timestamps: true });

transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ receiver: 1, createdAt: -1 });
transactionSchema.index({ trade: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
