const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword, googleLogin, googleRedirect, googleCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

// Google OAuth — server-side redirect flow
router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);

// Google OAuth — GSI popup flow (frontend POST)
router.post('/google-login', googleLogin);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
