// controllers/user.controller.js
const userModel = require('../models/user.model');
const roleModel = require('../models/role.model');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    
    res.json({
      success: true,
      data: {
        users,
        total: users.length
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching users',
      code: 500
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const currentUser = req.user;

    // Check if user is requesting their own data or is admin
    const isOwnData = parseInt(id) === currentUserId;
    const isAdmin = currentUser.roles.some(role => role.name === 'admin');

    if (!isOwnData && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions to view this user',
        code: 403
      });
    }

    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
        code: 404
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching user',
      code: 500
    });
  }
};

// Create new user (admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role_id, status = 'active' } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name, email, and password are required',
        code: 400
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid email format',
        code: 400
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters long',
        code: 400
      });
    }

    // Check if email already exists
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email already exists',
        code: 400
      });
    }

    // Create user
    const userId = await userModel.createUser({
      name,
      email,
      password,
      status
    });

    // Assign role if provided
    if (role_id) {
      const role = await roleModel.getRoleById(role_id);
      if (role) {
        await userModel.assignRole(userId, role_id, req.user.id);
      }
    }

    // Get created user
    const user = await userModel.getUserById(userId);
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while creating user',
      code: 500
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, status } = req.body;
    const currentUserId = req.user.id;
    const currentUser = req.user;

    // Check if user is updating their own data or is admin
    const isOwnData = parseInt(id) === currentUserId;
    const isAdmin = currentUser.roles.some(role => role.name === 'admin');

    if (!isOwnData && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions to update this user',
        code: 403
      });
    }

    // Get current user data
    const currentUserData = await userModel.getUserById(id);
    if (!currentUserData) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
        code: 404
      });
    }

    // Validate input
    if (!name && !email && status === undefined) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'At least one field must be provided',
        code: 400
      });
    }

    // Check if email already exists (if changing email)
    if (email && email !== currentUserData.email) {
      const existingUser = await userModel.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Email already exists',
          code: 400
        });
      }
    }

    // Update user
    const updateData = {
      name: name || currentUserData.name,
      email: email || currentUserData.email,
      status: status !== undefined ? status : currentUserData.status
    };

    await userModel.updateUser(id, updateData);

    // Get updated user
    const updatedUser = await userModel.getUserById(id);
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while updating user',
      code: 500
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Prevent self-deletion
    if (parseInt(id) === currentUserId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Cannot delete your own account',
        code: 400
      });
    }

    // Check if user exists
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
        code: 404
      });
    }

    // Delete user
    const deleted = await userModel.deleteUser(id);
    if (!deleted) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete user',
        code: 500
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while deleting user',
      code: 500
    });
  }
};

// Assign role to user (admin only)
const assignRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id } = req.body;

    // Validate input
    if (!role_id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Role ID is required',
        code: 400
      });
    }

    // Check if user exists
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
        code: 404
      });
    }

    // Check if role exists
    const role = await roleModel.getRoleById(role_id);
    if (!role) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Role not found',
        code: 404
      });
    }

    // Assign role
    const assigned = await userModel.assignRole(id, role_id, req.user.id);
    if (!assigned) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to assign role',
        code: 500
      });
    }

    res.json({
      success: true,
      message: 'Role assigned successfully'
    });

  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while assigning role',
      code: 500
    });
  }
};

// Remove role from user (admin only)
const removeRole = async (req, res) => {
  try {
    const { id, role_id } = req.params;

    // Check if user exists
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
        code: 404
      });
    }

    // Check if role exists
    const role = await roleModel.getRoleById(role_id);
    if (!role) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Role not found',
        code: 404
      });
    }

    // Remove role
    const removed = await userModel.removeRole(id, role_id);
    if (!removed) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'User does not have this role',
        code: 400
      });
    }

    res.json({
      success: true,
      message: 'Role removed successfully'
    });

  } catch (error) {
    console.error('Remove role error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while removing role',
      code: 500
    });
  }
};

// Change password - user can change their own password, admin can change any password
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const currentUserId = req.user.id;
    const currentUser = req.user;

    // Check if current user is admin
    const isAdmin = currentUser.roles.some(role => role.name === 'admin');
    const isOwnPassword = parseInt(id) === currentUserId;

    // User can only change their own password, unless they are admin
    if (!isOwnPassword && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only change your own password',
        code: 403
      });
    }

    // Validate input
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'New password and confirm password are required',
        code: 400
      });
    }

    // For non-admin users, verify old password is provided
    if (!isAdmin && !oldPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Old password is required',
        code: 400
      });
    }

    // Validate new password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'New password and confirm password do not match',
        code: 400
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'New password must be at least 6 characters long',
        code: 400
      });
    }

    // Get target user
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
        code: 404
      });
    }

    // If oldPassword is provided, verify it first (for both users and admins)
    if (oldPassword) {
      const passwordMatch = await userModel.verifyPassword(oldPassword, user.password);
      if (!passwordMatch) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Old password is incorrect',
          code: 400
        });
      }

      // Validate new password is different from old password
      if (oldPassword === newPassword) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'New password must be different from old password',
          code: 400
        });
      }
    }

    // Update password
    const updated = await userModel.updatePassword(id, newPassword);
    if (!updated) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update password',
        code: 500
      });
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while changing password',
      code: 500
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignRole,
  removeRole,
  changePassword
}; 
