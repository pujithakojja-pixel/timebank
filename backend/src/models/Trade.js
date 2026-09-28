const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  initiatorOffer: {
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    skillName: String,
    hours: { type: Number, required: true },
    description: String
  },
  receiverOffer: {
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    skillName: String,
    hours: { type: Number },
    description: String
  },
  status: {
    type: String,
    enum: ['requested', 'negotiating', 'accepted', 'scheduled', 'in_progress', 'completed', 'vouched', 'cancelled', 'rejected'],
    default: 'requested'
  },
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
    timestamp: { type: Date, default: Date.now }
  }],
  scheduledAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  notes: String,
  creditsTransferred: {
    type: Boolean,
    default: false
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  vouches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vouch'
  }],
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },
  isCircularTrade: {
    type: Boolean,
    default: false
  },
  circularChain: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  meetingLocation: String,
  isRemote: {
    type: Boolean,
    default: false
  },
  rating: {
    initiatorRating: Number,
    receiverRating: Number
  },
  chatRoom: String
}, { timestamps: true });

tradeSchema.index({ initiator: 1, status: 1 });
tradeSchema.index({ receiver: 1, status: 1 });
tradeSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Trade', tradeSchema);
