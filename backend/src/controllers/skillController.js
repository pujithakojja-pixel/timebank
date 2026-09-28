const Skill = require('../models/Skill');
const SkillOffer = require('../models/SkillOffer');
const SkillRequest = require('../models/SkillRequest');
const User = require('../models/User');

exports.getAllSkills = async (req, res, next) => {
  try {
    const { category, q } = req.query;
    const query = {};
    if (category) query.category = category;
    if (q) query.name = { $regex: q, $options: 'i' };

    const skills = await Skill.find(query).sort({ popularityScore: -1, name: 1 });
    res.json({ success: true, skills });
  } catch (error) {
    next(error);
  }
};

exports.getNearbyOffers = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, category, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (category) {
      const skills = await Skill.find({ category });
      query.skill = { $in: skills.map(s => s._id) };
    }

    let offers;
    if (lat && lng) {
      offers = await SkillOffer.find({
        ...query,
        $or: [
          {
            location: {
              $near: {
                $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                $maxDistance: parseFloat(radius) * 1000
              }
            }
          },
          { isRemote: true }
        ]
      })
        .populate('user', 'name avatar trustScore isOnline')
        .populate('skill lookingFor', 'name category icon color')
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    } else {
      offers = await SkillOffer.find(query)
        .populate('user', 'name avatar trustScore isOnline')
        .populate('skill lookingFor', 'name category icon color')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    }

    const total = await SkillOffer.countDocuments(query);
    res.json({ success: true, offers, total });
  } catch (error) {
    next(error);
  }
};

exports.createSkillOffer = async (req, res, next) => {
  try {
    const { skillId, title, description, hourlyRate, minHours, maxHours, lookingFor, isRemote, availability, tags } = req.body;

    const offer = await SkillOffer.create({
      user: req.user._id,
      skill: skillId,
      title,
      description,
      hourlyRate,
      minHours,
      maxHours,
      lookingFor,
      location: req.user.location,
      isRemote,
      availability,
      tags
    });

    // Update skill popularity
    await Skill.findByIdAndUpdate(skillId, { $inc: { popularityScore: 1 } });

    // Add to user's skillsOffered
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { skillsOffered: skillId }
    });

    const populated = await SkillOffer.findById(offer._id)
      .populate('skill lookingFor', 'name category icon');

    res.status(201).json({ success: true, offer: populated });
  } catch (error) {
    next(error);
  }
};

exports.getDiscoverCards = async (req, res, next) => {
  try {
    const { lat, lng, radius = 15, category, page = 1, limit = 10 } = req.query;

    const query = {
      isActive: true,
      user: { $ne: req.user._id }
    };

    if (category && category !== 'all') {
      const skills = await Skill.find({ category });
      query.skill = { $in: skills.map(s => s._id) };
    }

    let offers = [];

    if (lat && lng) {
      // Geo query (excludes remote-only) — $near cannot be inside $or
      const geoQuery = {
        ...query,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseFloat(radius) * 1000
          }
        }
      };
      const geoOffers = await SkillOffer.find(geoQuery)
        .populate('user', 'name avatar trustScore location bio skillsWanted isOnline')
        .populate('skill lookingFor', 'name category icon color')
        .limit(parseInt(limit));

      // Remote offers separately
      const remoteOffers = await SkillOffer.find({ ...query, isRemote: true })
        .populate('user', 'name avatar trustScore location bio skillsWanted isOnline')
        .populate('skill lookingFor', 'name category icon color')
        .limit(5);

      // Merge and deduplicate
      const seen = new Set();
      for (const o of [...geoOffers, ...remoteOffers]) {
        if (!seen.has(o._id.toString())) { seen.add(o._id.toString()); offers.push(o); }
      }
      offers = offers.slice(0, parseInt(limit));
    } else {
      offers = await SkillOffer.find(query)
        .populate('user', 'name avatar trustScore location bio skillsWanted isOnline')
        .populate('skill lookingFor', 'name category icon color')
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));
    }

    const cardsWithDistance = offers.map(offer => {
      const obj = offer.toObject();
      if (lat && lng && offer.location?.coordinates) {
        const [oLng, oLat] = offer.location.coordinates;
        const d = Math.sqrt(Math.pow(parseFloat(lng) - oLng, 2) + Math.pow(parseFloat(lat) - oLat, 2)) * 111;
        obj.distanceKm = parseFloat(d.toFixed(1));
      }
      return obj;
    });

    res.json({ success: true, cards: cardsWithDistance });
  } catch (error) {
    next(error);
  }
};
