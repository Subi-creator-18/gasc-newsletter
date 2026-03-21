const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth.middleware');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return errorResponse(res, 'Email and password required');

    const user = await User.findOne({ email: email.toLowerCase() }).populate('department_id');
    if (!user || !user.is_active) return errorResponse(res, 'Invalid credentials', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return errorResponse(res, 'Invalid credentials', 401);

    const token = generateToken(user._id);
    return successResponse(res, { token, user }, 'Login successful');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// GET /api/auth/me — get current user
router.get('/me', auth, async (req, res) => {
  return successResponse(res, req.user);
});

// POST /api/auth/change-password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return errorResponse(res, 'Both passwords required');
    if (newPassword.length < 6) return errorResponse(res, 'New password must be at least 6 characters');

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return errorResponse(res, 'Current password is incorrect');

    user.password = newPassword;
    await user.save();
    return successResponse(res, null, 'Password changed successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;
