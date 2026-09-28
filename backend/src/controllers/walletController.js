const walletService = require('../services/walletService');
const TimeWallet = require('../models/TimeWallet');

exports.getWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getOrCreateWallet(req.user._id);
    const populated = await TimeWallet.findById(wallet._id).populate('user', 'name avatar');
    res.json({ success: true, wallet: populated });
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await walletService.getTransactionHistory(req.user._id, parseInt(page), parseInt(limit));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
