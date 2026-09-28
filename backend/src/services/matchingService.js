const User = require('../models/User');
const Match = require('../models/Match');
const SkillOffer = require('../models/SkillOffer');

const MAX_RADIUS_KM = parseFloat(process.env.MAX_RADIUS_KM) || 50;
const EARTH_RADIUS_KM = 6371;

const matchingService = {
  // Calculate distance between two GeoJSON points (km)
  calculateDistance(coords1, coords2) {
    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  // Check availability overlap
  checkAvailabilityOverlap(avail1, avail2) {
    if (!avail1.length || !avail2.length) return 0.5;
    const days1 = new Set(avail1.map(a => a.day));
    const days2 = new Set(avail2.map(a => a.day));
    const overlap = [...days1].filter(d => days2.has(d)).length;
    return overlap / Math.max(days1.size, days2.size);
  },

  // Find direct matches for a user
  async findDirectMatches(userId, radiusKm = MAX_RADIUS_KM) {
    const user = await User.findById(userId).populate('skillsOffered skillsWanted');
    if (!user) return [];

    const offeredSkillIds = user.skillsOffered.map(s => s._id);
    const wantedSkillIds = user.skillsWanted.map(s => s._id);

    if (!offeredSkillIds.length && !wantedSkillIds.length) return [];

    // Find users who need what this user offers AND offer what this user needs
    const candidateQuery = {
      _id: { $ne: userId },
      $or: []
    };

    if (offeredSkillIds.length > 0) {
      candidateQuery.$or.push({ skillsWanted: { $in: offeredSkillIds } });
    }
    if (wantedSkillIds.length > 0) {
      candidateQuery.$or.push({ skillsOffered: { $in: wantedSkillIds } });
    }

    // Add geospatial filter if user has location
    let candidates;
    if (user.location && user.location.coordinates && user.location.coordinates[0] !== 0) {
      candidates = await User.find({
        ...candidateQuery,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: user.location.coordinates },
            $maxDistance: radiusKm * 1000
          }
        }
      }).populate('skillsOffered skillsWanted').limit(50);
    } else {
      candidates = await User.find(candidateQuery).populate('skillsOffered skillsWanted').limit(50);
    }

    const matches = [];

    for (const candidate of candidates) {
      if (user.blockedUsers && user.blockedUsers.includes(candidate._id)) continue;

      const candidateOfferedIds = candidate.skillsOffered.map(s => s._id.toString());
      const candidateWantedIds = candidate.skillsWanted.map(s => s._id.toString());

      // Check bidirectional skill match
      const userOffersWhatCandidateNeeds = offeredSkillIds.some(id =>
        candidateWantedIds.includes(id.toString())
      );
      const candidateOffersWhatUserNeeds = wantedSkillIds.some(id =>
        candidateOfferedIds.includes(id.toString())
      );

      if (!userOffersWhatCandidateNeeds && !candidateOffersWhatUserNeeds) continue;

      // Calculate score
      let score = 0;
      const reasons = [];

      if (userOffersWhatCandidateNeeds && candidateOffersWhatUserNeeds) {
        score += 60;
        reasons.push('Perfect skill exchange match');
      } else if (userOffersWhatCandidateNeeds) {
        score += 30;
        reasons.push('You can help them');
      } else {
        score += 30;
        reasons.push('They can help you');
      }

      // Distance score
      let distanceKm = null;
      if (user.location?.coordinates && candidate.location?.coordinates &&
          user.location.coordinates[0] !== 0 && candidate.location.coordinates[0] !== 0) {
        distanceKm = this.calculateDistance(user.location.coordinates, candidate.location.coordinates);
        const distanceScore = Math.max(0, 20 * (1 - distanceKm / radiusKm));
        score += distanceScore;
        reasons.push(`${Math.round(distanceKm)} km away`);
      }

      // Trust score
      const trustContrib = (candidate.trustScore / 100) * 15;
      score += trustContrib;
      if (candidate.trustScore > 60) reasons.push('Highly trusted member');

      // Availability overlap
      const availOverlap = this.checkAvailabilityOverlap(
        user.availability || [], candidate.availability || []
      );
      score += availOverlap * 5;
      if (availOverlap > 0.5) reasons.push('Schedule overlap');

      // Identify matching skills
      const matchedSkillsOffered = user.skillsOffered.filter(s =>
        candidateWantedIds.includes(s._id.toString())
      );
      const matchedSkillsWanted = user.skillsWanted.filter(s =>
        candidateOfferedIds.includes(s._id.toString())
      );
      const skillsInvolved = [...matchedSkillsOffered, ...matchedSkillsWanted].map(s => s._id);

      matches.push({
        matchedUser: candidate,
        type: 'direct',
        score: Math.min(Math.round(score), 100),
        reasons,
        distanceKm,
        skillsInvolved,
        offersYou: matchedSkillsWanted,
        needsFromYou: matchedSkillsOffered,
        compatibilityDetails: {
          skillMatch: (userOffersWhatCandidateNeeds && candidateOffersWhatUserNeeds) ? 100 : 50,
          locationScore: distanceKm ? Math.max(0, 100 * (1 - distanceKm / radiusKm)) : 50,
          availabilityMatch: Math.round(availOverlap * 100),
          trustScore: candidate.trustScore
        }
      });
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, 20);
  },

  // Find circular trade matches (A→B→C→A chains)
  async findCircularMatches(userId, radiusKm = MAX_RADIUS_KM) {
    const user = await User.findById(userId).populate('skillsOffered skillsWanted');
    if (!user || !user.skillsOffered.length || !user.skillsWanted.length) return [];

    const offeredSkillIds = user.skillsOffered.map(s => s._id.toString());
    const wantedSkillIds = user.skillsWanted.map(s => s._id.toString());

    // Find all users in radius
    let nearbyUsers;
    if (user.location?.coordinates && user.location.coordinates[0] !== 0) {
      nearbyUsers = await User.find({
        _id: { $ne: userId },
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: user.location.coordinates },
            $maxDistance: radiusKm * 1000
          }
        }
      }).populate('skillsOffered skillsWanted').limit(100);
    } else {
      nearbyUsers = await User.find({ _id: { $ne: userId } })
        .populate('skillsOffered skillsWanted').limit(100);
    }

    const circularChains = [];

    // 3-way circular: User → B → C → User
    for (let i = 0; i < nearbyUsers.length; i++) {
      const userB = nearbyUsers[i];
      const bOffered = userB.skillsOffered.map(s => s._id.toString());
      const bWanted = userB.skillsWanted.map(s => s._id.toString());

      // User offers what B needs
      const userProvidesB = offeredSkillIds.some(id => bWanted.includes(id));
      if (!userProvidesB) continue;

      // Find skill User gives to B
      const skillAtoB = user.skillsOffered.find(s => bWanted.includes(s._id.toString()));

      for (let j = 0; j < nearbyUsers.length; j++) {
        if (i === j) continue;
        const userC = nearbyUsers[j];
        if (userC._id.toString() === userB._id.toString()) continue;

        const cOffered = userC.skillsOffered.map(s => s._id.toString());
        const cWanted = userC.skillsWanted.map(s => s._id.toString());

        // B offers what C needs
        const bProvidesC = bOffered.some(id => cWanted.includes(id));
        if (!bProvidesC) continue;

        // C offers what User needs
        const cProvidesUser = cOffered.some(id => wantedSkillIds.includes(id));
        if (!cProvidesUser) continue;

        // Find the connecting skills
        const skillBtoC = userB.skillsOffered.find(s => cWanted.includes(s._id.toString()));
        const skillCtoA = userC.skillsOffered.find(s => wantedSkillIds.includes(s._id.toString()));

        if (!skillAtoB || !skillBtoC || !skillCtoA) continue;

        const distBC = userB.location?.coordinates && userC.location?.coordinates ?
          this.calculateDistance(userB.location.coordinates, userC.location.coordinates) : null;
        const distCA = userC.location?.coordinates && user.location?.coordinates ?
          this.calculateDistance(userC.location.coordinates, user.location.coordinates) : null;

        circularChains.push({
          type: 'circular',
          score: 75,
          reasons: ['3-way circular trade - everyone benefits!', `${user.name} → ${userB.name} → ${userC.name} → ${user.name}`],
          circularChain: [
            {
              user: user,
              offersSkill: skillAtoB,
              offersSkillName: skillAtoB.name,
              needsSkill: skillCtoA,
              needsSkillName: skillCtoA.name,
              hours: 1
            },
            {
              user: userB,
              offersSkill: skillBtoC,
              offersSkillName: skillBtoC.name,
              needsSkill: skillAtoB,
              needsSkillName: skillAtoB.name,
              hours: 1
            },
            {
              user: userC,
              offersSkill: skillCtoA,
              offersSkillName: skillCtoA.name,
              needsSkill: skillBtoC,
              needsSkillName: skillBtoC.name,
              hours: 1
            }
          ],
          users: [user._id, userB._id, userC._id],
          skillsInvolved: [skillAtoB._id, skillBtoC._id, skillCtoA._id]
        });

        if (circularChains.length >= 5) break; // Limit circular results
      }
      if (circularChains.length >= 5) break;
    }

    return circularChains;
  },

  // Save matches to database
  async saveMatches(userId, directMatches, circularMatches) {
    const savedMatches = [];

    for (const match of directMatches.slice(0, 10)) {
      // Check if match already exists
      const existing = await Match.findOne({
        users: { $all: [userId, match.matchedUser._id] },
        status: 'active',
        type: 'direct'
      });
      if (existing) { savedMatches.push(existing); continue; }

      const saved = await Match.create({
        users: [userId, match.matchedUser._id],
        type: 'direct',
        score: match.score,
        reasons: match.reasons,
        skillsInvolved: match.skillsInvolved,
        distanceKm: match.distanceKm,
        compatibilityDetails: match.compatibilityDetails
      });
      savedMatches.push(saved);
    }

    for (const match of circularMatches.slice(0, 5)) {
      const userIds = match.users;
      const saved = await Match.create({
        users: userIds,
        type: 'circular',
        score: match.score,
        reasons: match.reasons,
        skillsInvolved: match.skillsInvolved,
        circularChain: match.circularChain.map(c => ({
          user: c.user._id,
          offersSkill: c.offersSkill._id,
          offersSkillName: c.offersSkillName,
          needsSkill: c.needsSkill._id,
          needsSkillName: c.needsSkillName,
          hours: c.hours
        }))
      });
      savedMatches.push(saved);
    }

    return savedMatches;
  }
};

module.exports = matchingService;
