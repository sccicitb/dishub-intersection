// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireAdmin, canManageUsers } = require('../middleware/role.middleware');

// GET /api/users - List all users (admin only)
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);

// POST /api/users - Create new user (admin only)
router.post('/', authenticateToken, requireAdmin, userController.createUser);

// GET /api/users/:id - Get user by ID (admin or self)
router.get('/:id', authenticateToken, userController.getUserById);

// PUT /api/users/:id - Update user (admin or self)
router.put('/:id', authenticateToken, userController.updateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

// POST /api/users/:id/role - Assign role to user (admin only)
router.post('/:id/role', authenticateToken, requireAdmin, userController.assignRole);

// DELETE /api/users/:id/role/:role_id - Remove role from user (admin only)
router.delete('/:id/role/:role_id', authenticateToken, requireAdmin, userController.removeRole);

module.exports = router; 