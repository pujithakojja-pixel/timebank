const jwt = require('jsonwebtoken');
const User = require('../models/User');
const walletService = require('../services/walletService');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

/* ─── REGISTER ─────────────────────────────────────────────── */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, bio, location, skillsOffered, skillsWanted, availability, avatar } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    // Build user data
    const userData = {
      name:  name.trim(),
      email: email.toLowerCase().trim(),
      password,
      bio:   bio || '',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`,
    };

    // Location
    if (location && location.lat && location.lng) {
      userData.location = {
        type:        'Point',
        coordinates: [parseFloat(location.lng), parseFloat(location.lat)],
        city:        location.city        || '',
        country:     location.country     || '',
        displayName: location.displayName || `${location.city || ''}, ${location.country || ''}`.trim(),
      };
    } else {
      // Default to New York so map works
      userData.location = {
        type:        'Point',
        coordinates: [-73.9855, 40.7580],
        city:        'New York',
        country:     'USA',
        displayName: 'New York, USA',
      };
    }

    if (skillsOffered  && Array.isArray(skillsOffered))  userData.skillsOffered  = skillsOffered;
    if (skillsWanted   && Array.isArray(skillsWanted))   userData.skillsWanted   = skillsWanted;
    if (availability   && Array.isArray(availability))   userData.availability   = availability;

    // Save user to MongoDB
    const user = await User.create(userData);

    // Create wallet with 5 free credits (no MongoDB transactions needed)
    await walletService.grantInitialCredits(user._id);

    // Generate JWT
    const token = generateToken(user._id);

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

    console.log(`✅ New user registered: ${user.name} (${user.email}) ID: ${user._id}`);

    return res.status(201).json({
      success: true,
      message: `Welcome to TimeBank, ${user.name}! 🎉 You received 5 free Time Credits.`,
      token,
      user: userObj,
    });

  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

/* ─── LOGIN ─────────────────────────────────────────────────── */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user (include password field)
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('skillsOffered skillsWanted');

    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    console.log(`✅ User logged in: ${user.name} (${user.email})`);

    return res.json({ success: true, message: `Welcome back, ${user.name}!`, token, user: userObj });

  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

/* ─── LOGOUT ────────────────────────────────────────────────── */
exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: new Date() });
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/* ─── GET ME ─────────────────────────────────────────────────── */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('skillsOffered skillsWanted');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/* ─── UPDATE PROFILE ─────────────────────────────────────────── */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, location, skillsOffered, skillsWanted, availability, avatar } = req.body;
    const updates = {};

    if (name  !== undefined) updates.name  = name.trim();
    if (bio   !== undefined) updates.bio   = bio;
    if (avatar !== undefined) updates.avatar = avatar;

    if (location) {
      updates.location = {
        type:        'Point',
        coordinates: [parseFloat(location.lng || 0), parseFloat(location.lat || 0)],
        city:        location.city        || '',
        country:     location.country     || '',
        displayName: location.displayName || `${location.city || ''}, ${location.country || ''}`,
      };
    }
    if (skillsOffered) updates.skillsOffered = skillsOffered;
    if (skillsWanted)  updates.skillsWanted  = skillsWanted;
    if (availability)  updates.availability  = availability;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
      .populate('skillsOffered skillsWanted');

    return res.json({ success: true, message: 'Profile updated!', user });
  } catch (error) {
    next(error);
  }
};
