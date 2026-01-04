// controllers/adminUserController.js
const User = require('../models/User');

/**
 * GET /api/admin/users
 * Protected by adminAuth middleware
 */
exports.listUsers = async (req, res) => {
  try {
    // return selected fields only
    const users = await User.find({}, 'username googleEmail role status blockedUntil lastSuccessfulLogin').sort({ createdAt: -1 }).lean();
    return res.json({ count: users.length, users });
  } catch (err) {
    console.error('List users error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/block/:userId
 * Body: { minutes?: number } (optional; default 30)
 * Protected by adminAuth
 */
exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const minutes = Number(req.body.minutes) || 30;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // set blocked
    const now = new Date();
    user.status = 'blocked';
    user.loginAttempts = 0;
    user.blockedUntil = new Date(now.getTime() + minutes * 60000);
    await user.save();

    return res.json({ message: `User blocked for ${minutes} minute(s)`, blockedUntil: user.blockedUntil });
  } catch (err) {
    console.error('Block user error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/unblock/:userId
 * Protected by adminAuth
 */
exports.unblockUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.status = 'active';
    user.loginAttempts = 0;
    user.blockedUntil = null;
    await user.save();

    return res.json({ message: 'User unblocked' });
  } catch (err) {
    console.error('Unblock user error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
