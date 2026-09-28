const mongoose = require('mongoose');

const skillRequestSchema = new mongoose.Schema({
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
  hoursNeeded: {
    type: Number,
    required: true,
    min: 0.5,
    max: 20
  },
  creditsOffered: {
    type: Number,
    required: true,
    min: 0.5
  },
  canOffer: [{
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
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  deadline: Date
}, { timestamps: true });

skillRequestSchema.index({ location: '2dsphere' });
skillRequestSchema.index({ skill: 1, isActive: 1 });

module.exports = mongoose.model('SkillRequest', skillRequestSchema);
