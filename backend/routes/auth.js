// This file defines all authentication routes
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signup, login } = require('../controllers/authController');

// SIGNUP route - POST /api/auth/signup
router.post(
  '/signup',
  [
    // Validate input
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  signup
);

// LOGIN route - POST /api/auth/login
router.post(
  '/login',
  [
    // Validate input
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

module.exports = router;
