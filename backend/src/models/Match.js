const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  type: {
    type: String,
    enum: ['direct', 'nearby', 'circular'],
    required: true
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  reasons: [String],
  skillsInvolved: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  // For circular matches
  circularChain: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    offersSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    offersSkillName: String,
    needsSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    needsSkillName: String,
    hours: Number
  }],
  status: {
    type: String,
    enum: ['active', 'accepted', 'rejected', 'expired'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  trade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade'
  },
  distanceKm: Number,
  compatibilityDetails: {
    skillMatch: Number,
    locationScore: Number,
    availabilityMatch: Number,
    trustScore: Number
  }
}, { timestamps: true });

matchSchema.index({ users: 1, status: 1 });
matchSchema.index({ type: 1, score: -1 });
matchSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Match', matchSchema);
