// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'verysecretjwtkey';

module.exports = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || !payload.id) return res.status(401).json({ error: 'Invalid token' });

    const user = await User.findById(payload.id).lean();
    if (!user) return res.status(401).json({ error: 'User not found' });

    // attach user to request (non-mutable)
    req.user = user;
    next();
  } catch (err) {
    console.error('authMiddleware error', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};


// update