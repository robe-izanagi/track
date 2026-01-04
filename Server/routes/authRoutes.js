// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');

// keep your original routes + the new SSO/profile routes
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);

// Admin unblock (protected by x-admin-secret header)
router.post('/admin/unblock/:userId', authCtrl.adminUnblock);

// Google SSO login/register
router.post('/google', authCtrl.googleAuth);

// Link Google to existing account (expects Authorization: Bearer <token>)
router.post('/google/link', authCtrl.linkGoogle);

// Profile endpoints (expects Authorization: Bearer <token>)
router.get('/profile', authCtrl.getProfile);
router.put('/profile', authCtrl.updateProfile);

module.exports = router;
