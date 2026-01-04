// routes/accountCodeRoutes.js
const express = require('express');
const router = express.Router();
const { generateAccountCode, fetchAccountCodes, getCountCodes, getListAccountCode} = require('../controllers/aCodeController');
const adminAuth = require('../middlewares/adminAuth');

// POST /api/code/accountCode -> protected by adminAuth (token role=admin OR x-admin-secret)
// router.post('/generateAccountCode', adminAuth, generateAccountCode);
// router.get('/fetchAccountCodes', adminAuth, fetchAccountCodes);
router.post('/generateAccountCode', generateAccountCode);
router.get('/fetchAccountCodes', fetchAccountCodes);
router.get("/stats", getCountCodes);
router.get("/listAccountCodes", getListAccountCode);


module.exports = router;
