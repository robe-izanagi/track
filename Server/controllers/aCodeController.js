require('dotenv').config();
const connectDB = require('../db');
const AccountCode = require('../models/AccountCode');
const mongoose = require('mongoose');

exports.generateAccountCode = async (req, res) => {
  try {
    console.log('DB readyState:', mongoose.connection.readyState); // Check if DB is connected (should be 1)

    const { accountCode1, accountCode2, userType, generateBy } = req.body;

    if (!userType || !generateBy || !accountCode1 || !accountCode2) {
      return res.status(400).json({ error: 'Provide all input fields' });
    }

    // Find if already exists
    const exists = await AccountCode.findOne({ accountCode1: accountCode1, accountCode2: accountCode2 });
    if (!exists) {
      const newCode = new AccountCode({ accountCode1, accountCode2, userType, generateBy, usedBy: null });
      const savedCode = await newCode.save(); // Save and capture result
      console.log('Created and saved Account Code:', accountCode1, accountCode2, 'ID:', savedCode._id);

      // Double-check: Query the DB to confirm
      const confirm = await AccountCode.findById(savedCode._id);
      console.log('Confirmed in DB:', confirm ? 'Yes' : 'No');
    } else {
      console.log('Already exists:', accountCode1, accountCode2);
    }

    return res.status(201).json({ message: 'Account code generated successfully' }); // Fixed message
  } catch (error) {
    console.error('Generate error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};

exports.fetchAccountCodes = async (req, res) => {
  try {
    const codes = await AccountCode.find({}).sort({ createdAt: -1 }); // Fetch all, sorted by newest first
    res.status(200).json({ codes });
  } catch (error) {
    console.error('Fetch codes error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

exports.getListAccountCode = async (req, res) => {
  try {
    // read from query when using GET
    const { generateBy, userType } = req.query;

    const ownCodes = await AccountCode.find({
      generateBy: generateBy,
      usedBy: null // only used codes; change to null if you want unused
    }).sort({ createdAt: -1 });

    const ownCodesUserType = await AccountCode.find({
      generateBy: generateBy,
      usedBy: null,
      userType: userType
    }).sort({ createdAt: -1 });

    return res.status(200).json({ ownCodes, ownCodesUserType });
  } catch (error) {
    console.error('Fetch codes error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};

exports.getCountCodes = async (req, res) => {
  try {
    const total = await AccountCode.countDocuments();

    const available = await AccountCode.countDocuments({
      usedBy: null
    });

    const adminCount = await AccountCode.countDocuments({
      userType: "admin"
    });

    const userCount = await AccountCode.countDocuments({
      userType: "user"
    });

    const activeUserCount = await AccountCode.countDocuments({
      userType: "user",
      usedBy: { $ne: null }
    });
    const activeAdminCount = await AccountCode.countDocuments({
      userType: "admin",
      usedBy: { $ne: null }
    });

    res.json({
      total,
      available,
      adminCount,
      userCount,
      activeAdminCount,
      activeUserCount
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
}
