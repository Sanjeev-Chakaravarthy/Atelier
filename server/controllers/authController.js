const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const https = require('https');

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

// @desc  Google OAuth Redirect — initiates the server-side OAuth flow
// @route GET /api/auth/google
exports.googleRedirect = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const protocol = req.get('x-forwarded-proto') || req.protocol;
  const callbackUrl = `${protocol}://${req.get('host')}/api/auth/google/callback`;
  
  if (global.logToDB) {
    global.logToDB('OAUTH_REDIRECT_START', {
      clientId: clientId ? `${clientId.slice(0, 15)}...` : 'undefined',
      protocol,
      host: req.get('host'),
      callbackUrl
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  console.log('Google OAuth redirect → callbackUrl:', callbackUrl);
  res.redirect(googleAuthUrl);
};

// @desc  Google OAuth Callback — exchanges auth code for tokens, logs user in
// @route GET /api/auth/google/callback
exports.googleCallback = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (global.logToDB) {
    global.logToDB('OAUTH_CALLBACK_START', {
      queryKeys: Object.keys(req.query),
      hasCode: !!req.query.code,
      clientUrl
    });
  }

  try {
    const { code } = req.query;
    if (!code) {
      console.error('Google callback: no authorization code received');
      if (global.logToDB) {
        global.logToDB('OAUTH_CALLBACK_ERROR', { error: 'No authorization code in query params' });
      }
      return res.redirect(`${clientUrl}/login?error=no_code`);
    }

    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const callbackUrl = `${protocol}://${req.get('host')}/api/auth/google/callback`;

    // Exchange authorization code for tokens using native https module
    const postData = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code',
    }).toString();

    if (global.logToDB) {
      global.logToDB('OAUTH_TOKEN_EXCHANGE_PREPARE', {
        callbackUrl,
        clientId: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.slice(0, 15)}...` : 'undefined',
        hasSecret: !!process.env.GOOGLE_CLIENT_SECRET
      });
    }

    console.log('Exchanging code for token with data length:', postData.length);

    const tokenData = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const reqPost = https.request(options, (resPost) => {
        let rawData = '';
        resPost.on('data', (chunk) => { rawData += chunk; });
        resPost.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve(parsed);
          } catch (e) {
            reject(new Error('Failed to parse Google token JSON: ' + rawData));
          }
        });
      });

      reqPost.on('error', (err) => {
        reject(err);
      });

      reqPost.write(postData);
      reqPost.end();
    });

    console.log('Google token response received. Keys:', Object.keys(tokenData));

    if (global.logToDB) {
      global.logToDB('OAUTH_TOKEN_EXCHANGE_RESULT', {
        success: !tokenData.error,
        keys: Object.keys(tokenData),
        error: tokenData.error || null,
        error_description: tokenData.error_description || null
      });
    }

    if (tokenData.error) {
      console.error('Google token exchange error payload:', tokenData);
      return res.redirect(`${clientUrl}/login?error=token_exchange_failed`);
    }

    // Decode the id_token to get user info
    const payload = jwt.decode(tokenData.id_token);
    if (global.logToDB) {
      global.logToDB('OAUTH_ID_TOKEN_DECODED', {
        hasPayload: !!payload,
        email: payload ? payload.email : null,
        name: payload ? payload.name : null
      });
    }

    if (!payload || !payload.email) {
      console.error('Google callback: invalid id_token payload');
      return res.redirect(`${clientUrl}/login?error=invalid_token`);
    }

    // Find or create user
    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      const randomPassword = crypto.randomBytes(20).toString('hex');
      user = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email.toLowerCase(),
        avatar: payload.picture || '',
        defaultAvatar: payload.picture || '',
        password: randomPassword,
      });
      if (global.logToDB) {
        global.logToDB('OAUTH_USER_CREATED', { email: user.email, id: user._id });
      }
    } else {
      let isModified = false;
      if (!user.avatar && payload.picture) {
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
      if (global.logToDB) {
        global.logToDB('OAUTH_USER_LOGGED_IN', { email: user.email, id: user._id });
      }
    }

    const localToken = generateToken(user._id);

    const redirectUrl = new URL(`${clientUrl}/login`);
    redirectUrl.searchParams.set('token', localToken);
    redirectUrl.searchParams.set('user', JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      defaultAvatar: user.defaultAvatar || '',
      theme: user.theme,
      notifications: user.notifications,
      focusTime: user.focusTime || 0,
      focusSessions: user.focusSessions || 0,
    }));

    if (global.logToDB) {
      global.logToDB('OAUTH_REDIRECT_FRONTEND', { redirectUrl: redirectUrl.toString() });
    }

    res.redirect(redirectUrl.toString());
  } catch (err) {
    console.error('Google callback error:', err);
    if (global.logToDB) {
      global.logToDB('OAUTH_CALLBACK_EXCEPTION', {
        message: err.message,
        stack: err.stack
      });
    }
    res.redirect(`${clientUrl}/login?error=server_error`);
  }
};
