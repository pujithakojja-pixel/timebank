const mongoose = require('mongoose');

const vouchSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade',
    required: true
  },
  qualities: [{
    type: String,
    enum: ['reliable', 'skilled', 'friendly', 'communicative', 'punctual', 'creative', 'professional', 'patient']
  }],
  comment: {
    type: String,
    maxlength: 500
  },
  skillVouched: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  },
  skillName: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: true // Vouches from completed trades are auto-verified
  }
}, { timestamps: true });

// Prevent duplicate vouches for same trade
vouchSchema.index({ from: 1, trade: 1 }, { unique: true });
vouchSchema.index({ to: 1, createdAt: -1 });

module.exports = mongoose.model('Vouch', vouchSchema);
