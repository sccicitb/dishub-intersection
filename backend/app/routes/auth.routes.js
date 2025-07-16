// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// POST /api/auth/login - User login
router.post('/login', authController.login);

// GET /api/auth/me - Get current user info (requires authentication)
router.get('/me', authenticateToken, authController.getCurrentUser);

// PUT /api/auth/profile - Update user profile (requires authentication)
router.put('/profile', authenticateToken, authController.updateProfile);

// POST /api/auth/logout - Logout (optional - for future use)
router.post('/logout', authenticateToken, authController.logout);

module.exports = router; 