const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true },
    country: { type: String, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Account status — admin must approve before user can transact
    accountStatus: {
      type: String,
      enum: ['pending', 'active', 'suspended'],
      default: 'pending'
    },

    // Wallet balances (in USD equivalent)
    balance: { type: Number, default: 0 },

    // Crypto holdings
    portfolio: {
      BTC: { type: Number, default: 0 },
      ETH: { type: Number, default: 0 },
      USDT: { type: Number, default: 0 },
      BNB: { type: Number, default: 0 }
    },

    // Total invested and profit
    totalInvested: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },

    // KYC info
    kycStatus: { type: String, enum: ['not_submitted', 'pending', 'verified'], default: 'not_submitted' },

    // Auth & policy codes issued by admin for withdrawals
    authCode: { type: String, default: null },
    policyCode: { type: String, default: null },
    authCodeUsed: { type: Boolean, default: false },
    policyCodeUsed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Omit sensitive fields from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.authCode;
  delete obj.policyCode;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
