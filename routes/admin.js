const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect, adminOnly } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// ─────────────────────────────────────
//  USER MANAGEMENT
// ─────────────────────────────────────

// GET /api/admin/users — all users (no password)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/admin/users/pending — pending users
router.get('/users/pending', async (req, res) => {
  try {
    const users = await User.find({ accountStatus: 'pending', role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/admin/users/:id — full user detail (no password)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// PATCH /api/admin/users/:id/approve
router.patch('/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.accountStatus = 'active';
    await user.save();
    res.json({ message: `Account for ${user.email} approved`, user });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// PATCH /api/admin/users/:id/suspend
router.patch('/users/:id/suspend', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.accountStatus = 'suspended';
    await user.save();
    res.json({ message: `Account for ${user.email} suspended`, user });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// PATCH /api/admin/users/:id/balance
router.patch('/users/:id/balance', async (req, res) => {
  try {
    const { balance, totalInvested, totalProfit } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (balance       !== undefined) user.balance       = balance;
    if (totalInvested !== undefined) user.totalInvested = totalInvested;
    if (totalProfit   !== undefined) user.totalProfit   = totalProfit;
    await user.save();
    res.json({ message: 'Balance updated', user });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// ─────────────────────────────────────
//  CODE ISSUANCE
// ─────────────────────────────────────

// POST /api/admin/users/:id/issue-codes
router.post('/users/:id/issue-codes', async (req, res) => {
  try {
    const { authCode, policyCode } = req.body;
    const user = await User.findById(req.params.id).select('+authCode +policyCode');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.authCode    = authCode    || `AUTH-${uuidv4().slice(0, 8).toUpperCase()}`;
    user.policyCode  = policyCode  || `POL-${uuidv4().slice(0, 8).toUpperCase()}`;
    user.authCodeUsed   = false;
    user.policyCodeUsed = false;
    await user.save();
    res.json({ message: 'Codes issued', authCode: user.authCode, policyCode: user.policyCode, userId: user._id, userEmail: user.email });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/admin/users/:id/codes
router.get('/users/:id/codes', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('+authCode +policyCode');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ userId: user._id, email: user.email, authCode: user.authCode, policyCode: user.policyCode });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// ─────────────────────────────────────
//  TRANSACTION MANAGEMENT
// ─────────────────────────────────────

// GET /api/admin/transactions
router.get('/transactions', async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type)   filter.type   = type;
    const transactions = await Transaction.find(filter)
      .populate('user', 'firstName lastName email balance')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// PATCH /api/admin/transactions/:id/approve
router.patch('/transactions/:id/approve', async (req, res) => {
  try {
    const { adminNote } = req.body;
    const transaction   = await Transaction.findById(req.params.id).populate('user');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    const user = await User.findById(transaction.user._id);

    if (transaction.type === 'deposit') {
      user.balance       += transaction.amount;
      user.totalInvested += transaction.amount;
      await user.save();
    } else if (transaction.type === 'withdrawal') {
      if (user.balance < transaction.amount)
        return res.status(400).json({ message: 'User has insufficient balance' });
      user.balance -= transaction.amount;
      await user.save();
    }

    transaction.status     = 'completed';
    transaction.adminNote  = adminNote || null;
    transaction.approvedBy = req.user._id;
    transaction.approvedAt = new Date();
    await transaction.save();
    res.json({ message: 'Transaction approved', transaction });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// PATCH /api/admin/transactions/:id/reject
router.patch('/transactions/:id/reject', async (req, res) => {
  try {
    const { adminNote } = req.body;
    const transaction   = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    transaction.status     = 'rejected';
    transaction.adminNote  = adminNote || 'Rejected by admin';
    transaction.approvedBy = req.user._id;
    transaction.approvedAt = new Date();
    await transaction.save();
    res.json({ message: 'Transaction rejected', transaction });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers    = await User.countDocuments({ role: 'user' });
    const pendingUsers  = await User.countDocuments({ accountStatus: 'pending', role: 'user' });
    const activeUsers   = await User.countDocuments({ accountStatus: 'active',  role: 'user' });
    const pendingTx     = await Transaction.countDocuments({ status: 'pending' });
    const codeReqTx     = await Transaction.countDocuments({ status: 'codes_submitted' });
    const depAgg        = await Transaction.aggregate([{ $match: { type: 'deposit',    status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const witAgg        = await Transaction.aggregate([{ $match: { type: 'withdrawal', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    res.json({
      totalUsers, pendingUsers, activeUsers,
      pendingTransactions:     pendingTx,
      codeRequiredTransactions: codeReqTx,
      totalDeposits:    depAgg[0]?.total || 0,
      totalWithdrawals: witAgg[0]?.total || 0,
    });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
