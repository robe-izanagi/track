// models/AccountCode.js
const mongoose = require('mongoose');

const accountCodeSchema = new mongoose.Schema({
  // codeId: { type: Number, required: true },
  accountCode1: { type: String, required: true },
  accountCode2: { type: String, required: true },
  userType:     { type: String, required: true, enum: ['admin', 'user'], default: 'user' },
  generateBy:   { type: String, required: false },
  usedBy:       { type: String, default: null } 
}, { timestamps: true });

module.exports = mongoose.model('AccountCode', accountCodeSchema);
