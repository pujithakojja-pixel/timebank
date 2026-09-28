const mongoose = require('mongoose');

const skillOfferSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  hourlyRate: {
    type: Number,
    default: 1,
    min: 0.5,
    max: 10
  },
  minHours: {
    type: Number,
    default: 1
  },
  maxHours: {
    type: Number,
    default: 4
  },
  lookingFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number],
    city: String,
    displayName: String
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  tags: [String],
  completionCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

skillOfferSchema.index({ location: '2dsphere' });
skillOfferSchema.index({ skill: 1, isActive: 1 });
skillOfferSchema.index({ user: 1 });

module.exports = mongoose.model('SkillOffer', skillOfferSchema);
