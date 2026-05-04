
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signup, login } = require('../controllers/authController');


router.post(
  '/signup',
  [
    
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  signup
);


router.post(
  '/login',
  [
    // validate input
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

module.exports = router;
