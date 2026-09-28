const mongoose = require('mongoose');

const timeWalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 5,
    min: 0
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  pendingCredits: {
    type: Number,
    default: 0
  },
  lockedCredits: {
    type: Number,
    default: 0
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

timeWalletSchema.methods.canAfford = function(amount) {
  return this.balance >= amount;
};

timeWalletSchema.methods.credit = function(amount) {
  this.balance += amount;
  this.totalEarned += amount;
  this.lastActivity = Date.now();
};

timeWalletSchema.methods.debit = function(amount) {
  if (!this.canAfford(amount)) {
    throw new Error('Insufficient Time Credits');
  }
  this.balance -= amount;
  this.totalSpent += amount;
  this.lastActivity = Date.now();
};

module.exports = mongoose.model('TimeWallet', timeWalletSchema);
