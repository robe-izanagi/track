// routes/adminUserRoutes.js
const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminUserController');
const adminAuth = require('../middlewares/adminAuth'); // re-use existing adminAuth middleware

// // GET /api/admin/users
// router.get('/users', adminAuth, adminCtrl.listUsers);

// // POST /api/admin/block/:userId
// router.post('/block/:userId', adminAuth, adminCtrl.blockUser);

// // POST /api/admin/unblock/:userId
// router.post('/unblock/:userId', adminAuth, adminCtrl.unblockUser);
// GET /api/admin/users
router.get('/users', adminCtrl.listUsers);

// POST /api/admin/block/:userId
router.post('/block/:userId', adminCtrl.blockUser);

// POST /api/admin/unblock/:userId
router.post('/unblock/:userId', adminCtrl.unblockUser);

module.exports = router;
