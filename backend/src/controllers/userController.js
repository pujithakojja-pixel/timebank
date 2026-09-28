const User = require('../models/User');
const Vouch = require('../models/Vouch');
const Trade = require('../models/Trade');
const SkillOffer = require('../models/SkillOffer');

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('skillsOffered skillsWanted');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const vouches = await Vouch.find({ to: user._id })
      .populate('from', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    const skillOffers = await SkillOffer.find({ user: user._id, isActive: true })
      .populate('skill lookingFor');

    const profile = user.toPublicProfile();

    res.json({
      success: true,
      user: profile,
      vouches,
      skillOffers
    });
  } catch (error) {
    next(error);
  }
};

exports.getNearbyUsers = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, category, minTrust = 0 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Location coordinates required' });
    }

    const radiusMeters = Math.min(parseFloat(radius) * 1000, 50000);

    const query = {
      _id: { $ne: req.user._id },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusMeters
        }
      },
      trustScore: { $gte: parseFloat(minTrust) }
    };

    let users = await User.find(query)
      .populate('skillsOffered skillsWanted')
      .select('-password -blockedUsers -notifications')
      .limit(50);

    // Filter by skill category if provided
    if (category && category !== 'all') {
      users = users.filter(u =>
        u.skillsOffered.some(s => s.category === category)
      );
    }

    // Return approximate locations
    const safeUsers = users.map(u => {
      const obj = u.toObject();
      if (obj.location && obj.location.coordinates) {
        const [lng, lat] = obj.location.coordinates;
        obj.location.coordinates = [
          parseFloat((lng + (Math.random() - 0.5) * 0.008).toFixed(4)),
          parseFloat((lat + (Math.random() - 0.5) * 0.008).toFixed(4))
        ];
      }
      delete obj.password;
      return obj;
    });

    res.json({ success: true, users: safeUsers, count: safeUsers.length });
  } catch (error) {
    next(error);
  }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const { q, skill, category, page = 1, limit = 20 } = req.query;
    const query = { _id: { $ne: req.user._id } };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ];
    }

    if (skill) {
      query.skillsOffered = skill;
    }

    const users = await User.find(query)
      .populate('skillsOffered skillsWanted')
      .select('-password -blockedUsers')
      .sort({ trustScore: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({ success: true, users, total, page: parseInt(page) });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [activeTrades, pendingRequests, recentVouches] = await Promise.all([
      Trade.find({
        $or: [{ initiator: userId }, { receiver: userId }],
        status: { $in: ['accepted', 'scheduled', 'in_progress'] }
      }).populate('initiator receiver', 'name avatar').limit(5),

      Trade.find({
        $or: [{ initiator: userId }, { receiver: userId }],
        status: 'requested'
      }).populate('initiator receiver', 'name avatar').limit(5),

      Vouch.find({ to: userId })
        .populate('from', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(3)
    ]);

    res.json({
      success: true,
      data: {
        activeTrades,
        pendingRequests,
        recentVouches,
        stats: {
          completedTrades: req.user.completedTrades,
          hoursExchanged: req.user.hoursExchanged,
          trustScore: req.user.trustScore,
          timeCredits: req.user.timeCredits
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
