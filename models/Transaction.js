const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'withdrawal', 'investment', 'profit'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    cryptoType: { type: String, enum: ['BTC', 'ETH', 'USDT', 'BNB', 'USD'], default: 'USD' },

    // Proof of payment — base64 image uploaded by user
    proofImage: { type: String, default: null },  // base64 data URL
    proofName:  { type: String, default: null },  // original filename

    // Withdrawal codes
    authCodeProvided:  { type: String, default: null },
    policyCodeProvided:{ type: String, default: null },
    codesVerified:     { type: Boolean, default: false },

    // Withdrawal destination
    walletAddress: { type: String, default: null },
    bankDetails: {
      bankName:      String,
      accountName:   String,
      accountNumber: String,
      routingNumber: String,
      swiftCode:     String,
    },

    // Admin approval
    status: {
      type: String,
      enum: ['pending', 'code_required', 'codes_submitted', 'approved', 'rejected', 'completed'],
      default: 'pending'
    },
    adminNote:  { type: String, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },

    description: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
