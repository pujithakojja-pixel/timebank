require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Skill = require('./models/Skill');
const SkillOffer = require('./models/SkillOffer');
const TimeWallet = require('./models/TimeWallet');
const Transaction = require('./models/Transaction');
const Trade = require('./models/Trade');
const Match = require('./models/Match');
const Message = require('./models/Message');
const Vouch = require('./models/Vouch');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timebank';

const SKILLS_DATA = [
  { name: 'Web Development', category: 'Technology', icon: '💻', color: '#6C63FF', description: 'HTML, CSS, JavaScript, React, Node.js' },
  { name: 'Python Programming', category: 'Technology', icon: '🐍', color: '#4CAF50', description: 'Data science, automation, web scraping' },
  { name: 'UI/UX Design', category: 'Design', icon: '🎨', color: '#FF6584', description: 'Figma, Adobe XD, user research' },
  { name: 'Spanish', category: 'Languages', icon: '🇪🇸', color: '#FF9800', description: 'Conversational and business Spanish' },
  { name: 'French', category: 'Languages', icon: '🇫🇷', color: '#2196F3', description: 'All levels, native speaker' },
  { name: 'Mandarin Chinese', category: 'Languages', icon: '🇨🇳', color: '#F44336', description: 'HSK 1-6, business Chinese' },
  { name: 'Guitar', category: 'Music', icon: '🎸', color: '#9C27B0', description: 'Acoustic and electric, all genres' },
  { name: 'Piano', category: 'Music', icon: '🎹', color: '#607D8B', description: 'Classical and contemporary' },
  { name: 'Photography', category: 'Photography', icon: '📷', color: '#795548', description: 'Portrait, landscape, events' },
  { name: 'Video Editing', category: 'Design', icon: '🎬', color: '#FF5722', description: 'Premiere Pro, DaVinci Resolve' },
  { name: 'Yoga', category: 'Sports & Fitness', icon: '🧘', color: '#00BCD4', description: 'Hatha, Vinyasa, meditation' },
  { name: 'Cooking', category: 'Cooking', icon: '👨‍🍳', color: '#FFC107', description: 'Italian, Asian, baking' },
  { name: 'Data Science', category: 'Technology', icon: '📊', color: '#3F51B5', description: 'ML, pandas, visualization' },
  { name: 'Graphic Design', category: 'Design', icon: '🖌️', color: '#E91E63', description: 'Illustrator, Photoshop, branding' },
  { name: 'Content Writing', category: 'Writing', icon: '✍️', color: '#009688', description: 'Blog posts, copywriting, SEO' },
  { name: 'Tutoring - Math', category: 'Education', icon: '📐', color: '#673AB7', description: 'Algebra, calculus, statistics' },
  { name: 'Fitness Training', category: 'Sports & Fitness', icon: '💪', color: '#FF6B35', description: 'Strength, cardio, HIIT' },
  { name: 'Gardening', category: 'Home & Garden', icon: '🌱', color: '#4CAF50', description: 'Urban gardening, composting' },
  { name: 'Home Repair', category: 'Home & Garden', icon: '🔧', color: '#607D8B', description: 'Plumbing, electrical basics, carpentry' },
  { name: 'Life Coaching', category: 'Business', icon: '🎯', color: '#FF4081', description: 'Career guidance, goal setting' }
];

const USERS_DATA = [
  {
    name: 'Alex Rivera',
    email: 'alex@demo.com',
    password: 'demo1234',
    bio: 'Full-stack developer passionate about building community tools. I love teaching what I know and learning new skills.',
    location: { lat: 40.7580, lng: -73.9855, city: 'Manhattan', country: 'USA', displayName: 'Midtown, NYC' },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4',
    skillsOffered: ['Web Development', 'Python Programming'],
    skillsWanted: ['Spanish', 'Guitar'],
    availability: [
      { day: 'monday', startTime: '18:00', endTime: '21:00' },
      { day: 'wednesday', startTime: '18:00', endTime: '21:00' },
      { day: 'saturday', startTime: '10:00', endTime: '16:00' }
    ],
    timeCredits: 12,
    trustScore: 85,
    completedTrades: 8,
    hoursExchanged: 12
  },
  {
    name: 'Sofia Chen',
    email: 'sofia@demo.com',
    password: 'demo1234',
    bio: 'Language teacher and photographer. I speak 4 languages and love capturing moments that tell stories.',
    location: { lat: 40.7282, lng: -73.9942, city: 'Brooklyn', country: 'USA', displayName: 'Brooklyn, NYC' },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia&backgroundColor=ffdfbf',
    skillsOffered: ['Spanish', 'Photography', 'Mandarin Chinese'],
    skillsWanted: ['Web Development', 'Yoga'],
    availability: [
      { day: 'tuesday', startTime: '16:00', endTime: '20:00' },
      { day: 'thursday', startTime: '16:00', endTime: '20:00' },
      { day: 'sunday', startTime: '11:00', endTime: '15:00' }
    ],
    timeCredits: 18,
    trustScore: 92,
    completedTrades: 14,
    hoursExchanged: 20
  },
  {
    name: 'Marcus Johnson',
    email: 'marcus@demo.com',
    password: 'demo1234',
    bio: 'Personal trainer and guitarist. Helping people reach their fitness goals while jamming on weekends.',
    location: { lat: 40.7831, lng: -73.9712, city: 'Upper West Side', country: 'USA', displayName: 'Upper West Side, NYC' },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=c0aede',
    skillsOffered: ['Fitness Training', 'Guitar'],
    skillsWanted: ['Cooking', 'Data Science'],
    availability: [
      { day: 'monday', startTime: '06:00', endTime: '09:00' },
      { day: 'wednesday', startTime: '06:00', endTime: '09:00' },
      { day: 'friday', startTime: '06:00', endTime: '09:00' },
      { day: 'saturday', startTime: '09:00', endTime: '13:00' }
    ],
    timeCredits: 7,
    trustScore: 78,
    completedTrades: 6,
    hoursExchanged: 8
  },
  {
    name: 'Priya Patel',
    email: 'priya@demo.com',
    password: 'demo1234',
    bio: 'Data scientist and yoga instructor. Passionate about mindfulness and helping others understand complex data.',
    location: { lat: 40.7489, lng: -73.9680, city: 'Midtown East', country: 'USA', displayName: 'Midtown East, NYC' },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=d1f7c4',
    skillsOffered: ['Data Science', 'Yoga'],
    skillsWanted: ['UI/UX Design', 'Photography'],
    availability: [
      { day: 'tuesday', startTime: '07:00', endTime: '09:00' },
      { day: 'thursday', startTime: '07:00', endTime: '09:00' },
      { day: 'sunday', startTime: '09:00', endTime: '12:00' }
    ],
    timeCredits: 22,
    trustScore: 88,
    completedTrades: 11,
    hoursExchanged: 16
  },
  {
    name: 'Liam O\'Brien',
    email: 'liam@demo.com',
    password: 'demo1234',
    bio: 'Chef and French teacher. I\'ll cook you an amazing meal and maybe teach you some French along the way.',
    location: { lat: 40.7614, lng: -73.9776, city: 'Hell\'s Kitchen', country: 'USA', displayName: 'Hell\'s Kitchen, NYC' },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam&backgroundColor=ffd5dc',
    skillsOffered: ['Cooking', 'French'],
    skillsWanted: ['Guitar', 'Home Repair'],
    availability: [
      { day: 'monday', startTime: '10:00', endTime: '14:00' },
      { day: 'friday', startTime: '10:00', endTime: '14:00' },
      { day: 'saturday', startTime: '14:00', endTime: '19:00' }
    ],
    timeCredits: 15,
    trustScore: 82,
    completedTrades: 9,
    hoursExchanged: 14
  },
  {
    name: 'Emma Wilson',
    email: 'emma@demo.com',
    password: 'demo1234',
    bio: 'Graphic designer and writer. I love storytelling through visuals and words. Always looking to expand my tech skills.',
    location: { lat: 40.6892, lng: -73.9836, city: 'Park Slope', country: 'USA', displayName: 'Park Slope, Brooklyn' },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=b6e3f4',
    skillsOffered: ['Graphic Design', 'Content Writing', 'UI/UX Design'],
    skillsWanted: ['Python Programming', 'Data Science'],
    availability: [
      { day: 'wednesday', startTime: '19:00', endTime: '22:00' },
      { day: 'saturday', startTime: '10:00', endTime: '15:00' },
      { day: 'sunday', startTime: '14:00', endTime: '18:00' }
    ],
    timeCredits: 9,
    trustScore: 76,
    completedTrades: 5,
    hoursExchanged: 7
  },
  {
    name: 'James Kim',
    email: 'james@demo.com',
    password: 'demo1234',
    bio: 'Math tutor and home repair enthusiast. Making complex concepts simple and fixing things that need fixing.',
    location: { lat: 40.7505, lng: -73.9934, city: 'Chelsea', country: 'USA', displayName: 'Chelsea, NYC' },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=c0aede',
    skillsOffered: ['Tutoring - Math', 'Home Repair'],
    skillsWanted: ['Guitar', 'Cooking'],
    availability: [
      { day: 'tuesday', startTime: '17:00', endTime: '21:00' },
      { day: 'thursday', startTime: '17:00', endTime: '21:00' },
      { day: 'sunday', startTime: '10:00', endTime: '14:00' }
    ],
    timeCredits: 6,
    trustScore: 71,
    completedTrades: 4,
    hoursExchanged: 5
  },
  {
    name: 'Aisha Mohammed',
    email: 'aisha@demo.com',
    password: 'demo1234',
    bio: 'Life coach and yoga practitioner. I help people find their purpose and bring mindfulness into everyday life.',
    location: { lat: 40.7411, lng: -74.0018, city: 'West Village', country: 'USA', displayName: 'West Village, NYC' },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha&backgroundColor=ffdfbf',
    skillsOffered: ['Life Coaching', 'Yoga'],
    skillsWanted: ['Web Development', 'Spanish'],
    availability: [
      { day: 'monday', startTime: '17:00', endTime: '20:00' },
      { day: 'wednesday', startTime: '17:00', endTime: '20:00' },
      { day: 'saturday', startTime: '09:00', endTime: '13:00' }
    ],
    timeCredits: 11,
    trustScore: 89,
    completedTrades: 10,
    hoursExchanged: 15
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Skill.deleteMany({}),
      SkillOffer.deleteMany({}),
      TimeWallet.deleteMany({}),
      Transaction.deleteMany({}),
      Trade.deleteMany({}),
      Match.deleteMany({}),
      Message.deleteMany({}),
      Vouch.deleteMany({}),
      Notification.deleteMany({})
    ]);

    // Create skills
    console.log('📚 Creating skills...');
    const skills = await Skill.insertMany(SKILLS_DATA);
    const skillMap = {};
    skills.forEach(s => { skillMap[s.name] = s; });

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of USERS_DATA) {
      const { skillsOffered, skillsWanted, location, ...rest } = userData;
      const user = new User({
        ...rest,
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat],
          city: location.city,
          country: location.country,
          displayName: location.displayName
        },
        skillsOffered: skillsOffered.map(s => skillMap[s]?._id).filter(Boolean),
        skillsWanted: skillsWanted.map(s => skillMap[s]?._id).filter(Boolean),
        isVerified: true
      });
      await user.save();
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create wallets
    console.log('💰 Creating wallets...');
    for (const user of createdUsers) {
      const wallet = await TimeWallet.create({
        user: user._id,
        balance: user.timeCredits,
        totalEarned: user.timeCredits + Math.floor(Math.random() * 20),
        totalSpent: Math.floor(Math.random() * 15),
        pendingCredits: 0
      });

      // Create initial transaction
      await Transaction.create({
        sender: user._id,
        receiver: user._id,
        amount: 5,
        type: 'initial_grant',
        status: 'completed',
        description: 'Welcome bonus - 5 Time Credits'
      });
    }

    // Create skill offers
    console.log('🎯 Creating skill offers...');
    for (const user of createdUsers) {
      for (const skillId of user.skillsOffered) {
        const skill = skills.find(s => s._id.toString() === skillId.toString());
        if (!skill) continue;

        await SkillOffer.create({
          user: user._id,
          skill: skillId,
          title: `${skill.name} lessons with ${user.name}`,
          description: `I offer ${skill.name.toLowerCase()} sessions. ${user.bio}`,
          hourlyRate: 1,
          minHours: 1,
          maxHours: 3,
          location: user.location,
          isRemote: Math.random() > 0.5,
          isActive: true,
          tags: [skill.category.toLowerCase()],
          completionCount: user.completedTrades
        });
      }
    }

    // Create completed trades with vouches
    console.log('🤝 Creating trades...');
    const tradePairs = [
      { initiator: 0, receiver: 1, iSkill: 'Web Development', rSkill: 'Spanish', status: 'completed' },
      { initiator: 1, receiver: 2, iSkill: 'Photography', rSkill: 'Guitar', status: 'completed' },
      { initiator: 3, receiver: 0, iSkill: 'Yoga', rSkill: 'Python Programming', status: 'vouched' },
      { initiator: 4, receiver: 3, iSkill: 'Cooking', rSkill: 'Data Science', status: 'completed' },
      { initiator: 2, receiver: 4, iSkill: 'Fitness Training', rSkill: 'French', status: 'in_progress' },
      { initiator: 5, receiver: 6, iSkill: 'Graphic Design', rSkill: 'Tutoring - Math', status: 'accepted' },
      { initiator: 7, receiver: 0, iSkill: 'Life Coaching', rSkill: 'Web Development', status: 'scheduled' },
      { initiator: 0, receiver: 3, iSkill: 'Web Development', rSkill: 'Yoga', status: 'requested' }
    ];

    const createdTrades = [];
    for (const tp of tradePairs) {
      const initiator = createdUsers[tp.initiator];
      const receiver = createdUsers[tp.receiver];
      const iSkill = skillMap[tp.iSkill];
      const rSkill = skillMap[tp.rSkill];

      const chatRoom = `trade:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const trade = await Trade.create({
        initiator: initiator._id,
        receiver: receiver._id,
        initiatorOffer: {
          skill: iSkill?._id,
          skillName: tp.iSkill,
          hours: 2,
          description: `2 hours of ${tp.iSkill}`
        },
        receiverOffer: {
          skill: rSkill?._id,
          skillName: tp.rSkill,
          hours: 2,
          description: `2 hours of ${tp.rSkill}`
        },
        status: tp.status,
        scheduledAt: tp.status === 'scheduled' ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : undefined,
        completedAt: ['completed', 'vouched'].includes(tp.status) ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : undefined,
        creditsTransferred: ['completed', 'vouched'].includes(tp.status),
        chatRoom,
        statusHistory: [
          { status: 'requested', changedBy: initiator._id, timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          { status: tp.status, changedBy: receiver._id, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        ]
      });

      createdTrades.push({ trade, initiator, receiver, chatRoom });

      // Create messages for this trade
      const msgContents = [
        `Hey! I saw your offer and I think we'd make a great match!`,
        `That sounds wonderful! I've been looking for someone with your skills.`,
        `When would you be available? I'm free most evenings.`,
        `How about this Saturday at 2pm? We could do a 2-hour session.`,
        `Perfect! Looking forward to it!`
      ];

      for (let m = 0; m < msgContents.length; m++) {
        const sender = m % 2 === 0 ? initiator : receiver;
        await Message.create({
          room: chatRoom,
          sender: sender._id,
          content: msgContents[m],
          readBy: [
            { user: initiator._id, readAt: new Date() },
            { user: receiver._id, readAt: new Date() }
          ],
          createdAt: new Date(Date.now() - (msgContents.length - m) * 60 * 60 * 1000)
        });
      }

      // Create transactions for completed trades
      if (['completed', 'vouched'].includes(tp.status)) {
        await Transaction.create({
          sender: receiver._id,
          receiver: initiator._id,
          amount: 2,
          type: 'trade_payment',
          trade: trade._id,
          skill: iSkill?._id,
          skillName: tp.iSkill,
          status: 'completed',
          description: `2 credits for 2h of ${tp.iSkill}`
        });

        await Transaction.create({
          sender: initiator._id,
          receiver: receiver._id,
          amount: 2,
          type: 'trade_payment',
          trade: trade._id,
          skill: rSkill?._id,
          skillName: tp.rSkill,
          status: 'completed',
          description: `2 credits for 2h of ${tp.rSkill}`
        });
      }
    }

    // Create vouches for completed trades
    console.log('⭐ Creating vouches...');
    const completedTrades = createdTrades.filter(ct =>
      ['completed', 'vouched'].includes(ct.trade.status)
    );

    const vouchQualities = ['reliable', 'skilled', 'friendly', 'communicative', 'punctual'];

    for (const ct of completedTrades) {
      // Initiator vouches for receiver
      await Vouch.create({
        from: ct.initiator._id,
        to: ct.receiver._id,
        trade: ct.trade._id,
        qualities: vouchQualities.slice(0, 3),
        comment: 'Amazing experience! Highly recommend.',
        rating: 5,
        skillName: ct.trade.receiverOffer.skillName,
        isVerified: true
      });

      // Receiver vouches for initiator
      await Vouch.create({
        from: ct.receiver._id,
        to: ct.initiator._id,
        trade: ct.trade._id,
        qualities: ['skilled', 'patient', 'professional'],
        comment: 'Great teacher, very patient and knowledgeable.',
        rating: 5,
        skillName: ct.trade.initiatorOffer.skillName,
        isVerified: true
      });
    }

    // Create matches
    console.log('🎯 Creating matches...');
    for (let i = 0; i < createdUsers.length; i++) {
      for (let j = i + 1; j < createdUsers.length; j++) {
        const userA = createdUsers[i];
        const userB = createdUsers[j];

        const aOffered = userA.skillsOffered.map(s => s.toString());
        const aWanted = userA.skillsWanted.map(s => s.toString());
        const bOffered = userB.skillsOffered.map(s => s.toString());
        const bWanted = userB.skillsWanted.map(s => s.toString());

        const aOffersB = aOffered.some(id => bWanted.includes(id));
        const bOffersA = bOffered.some(id => aWanted.includes(id));

        if (aOffersB || bOffersA) {
          await Match.create({
            users: [userA._id, userB._id],
            type: 'direct',
            score: aOffersB && bOffersA ? 85 : 55,
            reasons: aOffersB && bOffersA ? ['Perfect skill exchange match', 'Nearby location'] : ['Complementary skills'],
            skillsInvolved: [...aOffered, ...bOffered].slice(0, 3),
            status: 'active',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          });
        }
      }
    }

    // Create circular match example
    const [userA, userB, userC] = createdUsers;
    const skillAtoB = skills.find(s => s.name === 'Web Development');
    const skillBtoC = skills.find(s => s.name === 'Photography');
    const skillCtoA = skills.find(s => s.name === 'Yoga');

    if (skillAtoB && skillBtoC && skillCtoA) {
      await Match.create({
        users: [userA._id, userB._id, userC._id],
        type: 'circular',
        score: 80,
        reasons: ['3-way circular trade', 'Everyone benefits!'],
        skillsInvolved: [skillAtoB._id, skillBtoC._id, skillCtoA._id],
        circularChain: [
          { user: userA._id, offersSkill: skillAtoB._id, offersSkillName: 'Web Development', needsSkill: skillCtoA._id, needsSkillName: 'Yoga', hours: 1 },
          { user: userB._id, offersSkill: skillBtoC._id, offersSkillName: 'Photography', needsSkill: skillAtoB._id, needsSkillName: 'Web Development', hours: 1 },
          { user: userC._id, offersSkill: skillCtoA._id, offersSkillName: 'Yoga', needsSkill: skillBtoC._id, needsSkillName: 'Photography', hours: 1 }
        ],
        status: 'active',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    // Create notifications
    console.log('🔔 Creating notifications...');
    await Notification.create({
      user: createdUsers[0]._id,
      type: 'new_match',
      title: 'New Match Found!',
      body: 'Sofia Chen is a great match for you - Perfect skill exchange!',
      icon: '🎯',
      link: '/matches',
      isRead: false,
      relatedUser: createdUsers[1]._id
    });

    await Notification.create({
      user: createdUsers[0]._id,
      type: 'vouch_received',
      title: 'New Vouch Received!',
      body: 'Priya Patel vouched for you as: skilled, reliable, communicative',
      icon: '⭐',
      link: '/profile',
      isRead: false,
      relatedUser: createdUsers[3]._id
    });

    await Notification.create({
      user: createdUsers[0]._id,
      type: 'trade_request',
      title: 'New Trade Request',
      body: 'Aisha Mohammed wants to trade Life Coaching with you',
      icon: '🤝',
      link: '/trades',
      isRead: true,
      relatedUser: createdUsers[7]._id
    });

    console.log('\n✨ Database seeded successfully!');
    console.log('📧 Demo accounts:');
    USERS_DATA.forEach(u => console.log(`   ${u.email} / ${u.password}`));
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
