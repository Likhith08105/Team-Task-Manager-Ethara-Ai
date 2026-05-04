
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.use(auth);

// GET dashboard stats - GET /api/dashboard
router.get('/', getDashboardStats);

module.exports = router;
