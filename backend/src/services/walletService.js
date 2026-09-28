const TimeWallet = require('../models/TimeWallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// NOTE: MongoDB transactions require a replica set.
// For standalone MongoDB (local dev) we use sequential operations instead.
// This is safe for development. For production, use a replica set.

const walletService = {

  async getOrCreateWallet(userId) {
    let wallet = await TimeWallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await TimeWallet.create({ user: userId, balance: 5, totalEarned: 5 });
    }
    return wallet;
  },

  // Transfer credits between users (no session — works on standalone MongoDB)
  async transferCredits({ senderId, receiverId, amount, tradeId, skillId, skillName, description }) {
    const [senderWallet, receiverWallet] = await Promise.all([
      TimeWallet.findOne({ user: senderId }),
      TimeWallet.findOne({ user: receiverId })
    ]);

    if (!senderWallet) throw new Error('Sender wallet not found');
    if (!receiverWallet) throw new Error('Receiver wallet not found');
    if (senderWallet.balance < amount) throw new Error('Insufficient Time Credits');

    // Create transaction record first
    const transaction = await Transaction.create({
      sender: senderId,
      receiver: receiverId,
      amount,
      type: 'trade_payment',
      trade: tradeId,
      skill: skillId,
      skillName,
      status: 'completed',
      description: description || `${amount} credits for ${skillName}`
    });

    // Debit sender
    senderWallet.balance -= amount;
    senderWallet.totalSpent += amount;
    senderWallet.lastActivity = new Date();
    senderWallet.transactions.push(transaction._id);
    await senderWallet.save();

    // Credit receiver
    receiverWallet.balance += amount;
    receiverWallet.totalEarned += amount;
    receiverWallet.lastActivity = new Date();
    receiverWallet.transactions.push(transaction._id);
    await receiverWallet.save();

    // Update user timeCredits fields
    await Promise.all([
      User.findByIdAndUpdate(senderId,   { $inc: { timeCredits: -amount } }),
      User.findByIdAndUpdate(receiverId, { $inc: { timeCredits: amount } })
    ]);

    return { success: true, transaction };
  },

  // Grant initial 5 credits to new user
  async grantInitialCredits(userId) {
    // Check wallet doesn't already exist
    const existing = await TimeWallet.findOne({ user: userId });
    if (existing) return existing;

    const wallet = await TimeWallet.create({
      user: userId,
      balance: 5,
      totalEarned: 5
    });

    const transaction = await Transaction.create({
      sender: userId,
      receiver: userId,
      amount: 5,
      type: 'initial_grant',
      status: 'completed',
      description: 'Welcome bonus - 5 Time Credits to get started! 🎉'
    });

    wallet.transactions.push(transaction._id);
    await wallet.save();

    await User.findByIdAndUpdate(userId, { timeCredits: 5 });

    return wallet;
  },

  async getTransactionHistory(userId, page = 1, limit = 20) {
    const wallet = await TimeWallet.findOne({ user: userId });
    if (!wallet) return { transactions: [], total: 0, wallet: null };

    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate('skill', 'name category')
      .populate('trade', 'status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Transaction.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    return { transactions, total, wallet };
  }
};

module.exports = walletService;
