const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const availabilitySchema = new mongoose.Schema({
  day: { type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
  startTime: String,
  endTime: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    city: String,
    country: String,
    displayName: String
  },
  skillsOffered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  skillsWanted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  availability: [availabilitySchema],
  timeCredits: {
    type: Number,
    default: 5,
    min: 0
  },
  trustScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedTrades: {
    type: Number,
    default: 0
  },
  hoursExchanged: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  savedSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillOffer'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes - email unique index is already set via 'unique: true' in schema field
userSchema.index({ location: '2dsphere' });
userSchema.index({ trustScore: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (no sensitive data)
userSchema.methods.toPublicProfile = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.blockedUsers;
  // Approximate location - remove exact coordinates
  if (obj.location && obj.location.coordinates) {
    const [lng, lat] = obj.location.coordinates;
    obj.location.coordinates = [
      parseFloat((lng + (Math.random() - 0.5) * 0.01).toFixed(3)),
      parseFloat((lat + (Math.random() - 0.5) * 0.01).toFixed(3))
    ];
  }
  return obj;
};

module.exports = mongoose.model('User', userSchema);
