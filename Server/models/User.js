// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  // email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // security fields
  loginAttempts: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'blocked', 'inactive'], default: 'active' },
  lastSuccessfulLogin: { type: Date, default: null },
  blockedUntil: { type: Date, default: null },

  // SSO / Google fields
  emailVerified: { type: Boolean, default: false },
  googleId: { type: String, default: null },
  name: { type: String, default: null },
  emailToken: { type: String, default: null },
  googleEmail: { type: String, default: null },
  googleId: { type: String, default: null },


  role: { type: String, required: true, enum: ['admin', 'user'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
