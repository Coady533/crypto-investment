const express = require('express');
const router  = express.Router();
const Transaction = require('../models/Transaction');
const User        = require('../models/User');
const { protect, activeAccount } = require('../middleware/auth');

// POST /api/transactions/deposit — initial deposit request
router.post('/deposit', protect, activeAccount, async (req, res) => {
  try {
    const { amount, cryptoType, description, proofImage, proofName } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Please enter a valid deposit amount' });

    const transaction = await Transaction.create({
      user:        req.user._id,
      type:        'deposit',
      amount,
      cryptoType:  cryptoType || 'USD',
      description,
      proofImage:  proofImage || null,
      proofName:   proofName  || null,
      status:      'pending'
    });

    res.status(201).json({
      message: 'Deposit request submitted. Awaiting admin approval.',
      transaction
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/transactions/withdraw
router.post('/withdraw', protect, activeAccount, async (req, res) => {
  try {
    const { amount, cryptoType, walletAddress, bankDetails } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Please enter a valid withdrawal amount' });

    const user = await User.findById(req.user._id);
    if (user.balance < amount)
      return res.status(400).json({ message: 'Insufficient balance' });

    const transaction = await Transaction.create({
      user:         req.user._id,
      type:         'withdrawal',
      amount,
      cryptoType:   cryptoType || 'USD',
      walletAddress: walletAddress || null,
      bankDetails:   bankDetails   || null,
      status:        'code_required'
    });

    res.status(201).json({
      message: 'Withdrawal request submitted. You will receive an authentication code and policy code from admin to proceed.',
      transaction
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/transactions/withdraw/verify-codes
router.post('/withdraw/verify-codes', protect, activeAccount, async (req, res) => {
  try {
    const { transactionId, authCode, policyCode } = req.body;
    if (!transactionId || !authCode || !policyCode)
      return res.status(400).json({ message: 'Transaction ID, auth code, and policy code are all required' });

    const transaction = await Transaction.findOne({
      _id:  transactionId,
      user: req.user._id,
      type: 'withdrawal'
    });
    if (!transaction)
      return res.status(404).json({ message: 'Transaction not found' });

    if (['completed', 'approved'].includes(transaction.status))
      return res.status(400).json({ message: 'This withdrawal has already been processed' });

    const user = await User.findById(req.user._id);
    if (!user.authCode || !user.policyCode)
      return res.status(400).json({ message: 'No codes have been issued for your account. Contact admin.' });

    if (user.authCode   !== authCode)   return res.status(400).json({ message: 'Invalid authentication code' });
    if (user.policyCode !== policyCode) return res.status(400).json({ message: 'Invalid policy code' });

    transaction.authCodeProvided   = authCode;
    transaction.policyCodeProvided = policyCode;
    transaction.codesVerified      = true;
    transaction.status             = 'codes_submitted';
    await transaction.save();

    res.json({ message: 'Codes verified. Your withdrawal is now pending admin final approval.', transaction });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/transactions/my
router.get('/my', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(50);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/transactions/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
