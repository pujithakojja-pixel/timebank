const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Technology', 'Languages', 'Music', 'Arts & Crafts', 'Sports & Fitness',
      'Cooking', 'Education', 'Business', 'Health & Wellness', 'Home & Garden',
      'Photography', 'Writing', 'Design', 'Science', 'Other'
    ]
  },
  description: String,
  icon: String,
  color: String,
  popularityScore: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

skillSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('Skill', skillSchema);
