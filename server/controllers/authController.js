const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @desc  Register user
// @route POST /api/auth/register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const emailHash = crypto.createHash('md5').update(cleanEmail.trim()).digest('hex');
    const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=150`;

    const user = await User.create({ name, email, password, avatar: gravatarUrl, defaultAvatar: gravatarUrl });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        defaultAvatar: user.defaultAvatar || '',
        theme: user.theme,
        notifications: user.notifications,
        focusTime: user.focusTime || 0,
        focusSessions: user.focusSessions || 0,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Login user
// @route POST /api/auth/login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        defaultAvatar: user.defaultAvatar || '',
        theme: user.theme,
        notifications: user.notifications,
        focusTime: user.focusTime || 0,
        focusSessions: user.focusSessions || 0,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Get current user
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && !user.defaultAvatar) {
      if (user.avatar) {
        user.defaultAvatar = user.avatar;
      } else {
        const emailHash = crypto.createHash('md5').update(user.email.toLowerCase().trim()).digest('hex');
        user.defaultAvatar = `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=150`;
        user.avatar = user.defaultAvatar;
      }
      await user.save();
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Update profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar, theme, notifications, timezone, focusTime, focusSessions } = req.body;
    
    // Build update object dynamically to prevent overwriting existing fields with undefined
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) {
      if (avatar === '') {
        const userDoc = await User.findById(req.user.id);
        if (userDoc.defaultAvatar) {
          updates.avatar = userDoc.defaultAvatar;
        } else {
          const emailHash = crypto.createHash('md5').update(userDoc.email.toLowerCase().trim()).digest('hex');
          updates.avatar = `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=150`;
        }
      } else {
        updates.avatar = avatar;
      }
    }
    if (theme !== undefined) updates.theme = theme;
    if (notifications !== undefined) updates.notifications = notifications;
    if (timezone !== undefined) updates.timezone = timezone;
    if (focusTime !== undefined) updates.focusTime = focusTime;
    if (focusSessions !== undefined) updates.focusSessions = focusSessions;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Change password
// @route PUT /api/auth/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Forgot password
// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide an email address' });

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return a generic success message to prevent user enumeration (big company security standard)
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email address is registered, a password reset link has been dispatched to it.'
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Send simulated email or real SMTP mail
    await sendEmail({
      email: user.email,
      resetUrl
    });

    res.json({
      success: true,
      message: 'If that email address is registered, a password reset link has been dispatched to it.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Reset password
// @route POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Google OAuth Login
// @route POST /api/auth/google-login
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'No Google credential token provided' });

    // Decode the token (claims)
    const payload = jwt.decode(token);
    if (!payload) return res.status(400).json({ message: 'Invalid token structure' });

    // Validate claims
    const issOk = payload.iss === 'https://accounts.google.com' || payload.iss === 'accounts.google.com';
    const audOk = payload.aud === process.env.GOOGLE_CLIENT_ID;
    const expOk = payload.exp > Math.floor(Date.now() / 1000);

    if (!issOk || !audOk || !expOk) {
      return res.status(401).json({ message: 'Google authentication verification failed' });
    }

    // Find or create user
    let user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      const crypto = require('crypto');
      const randomPassword = crypto.randomBytes(20).toString('hex');
      const avatarUrl = payload.picture || '';

      user = await User.create({
        name: payload.name,
        email: payload.email.toLowerCase(),
        avatar: avatarUrl,
        defaultAvatar: avatarUrl,
        password: randomPassword
      });
    } else if (payload.picture) {
      let isModified = false;
      if (!user.avatar || user.avatar.includes('gravatar.com')) {
        user.avatar = payload.picture;
        isModified = true;
      }
      if (!user.defaultAvatar || user.defaultAvatar.includes('gravatar.com')) {
        user.defaultAvatar = payload.picture;
        isModified = true;
      }
      if (isModified) {
        await user.save();
      }
    }

    const localToken = generateToken(user._id);
    res.json({
      success: true,
      token: localToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        defaultAvatar: user.defaultAvatar || '',
        theme: user.theme,
        notifications: user.notifications,
        focusTime: user.focusTime || 0,
        focusSessions: user.focusSessions || 0,
      }
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
