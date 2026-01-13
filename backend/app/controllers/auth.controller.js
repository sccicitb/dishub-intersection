// controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required',
        code: 400
      });
    }

    // Get user by email
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials',
        code: 401
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Account is inactive',
        code: 401
      });
    }

    // Verify password
    const isValidPassword = await userModel.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials',
        code: 401
      });
    }

    // Update last login
    await userModel.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d'
      }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during login',
      code: 500
    });
  }
};

// Get current user info
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
        code: 404
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching user data',
      code: 500
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, currentPassword, newPassword } = req.body;

    // Get current user
    const currentUser = await userModel.getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
        code: 404
      });
    }

    // Validate input
    if (!name && !email && !newPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'At least one field must be provided',
        code: 400
      });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Current password is required to change password',
          code: 400
        });
      }

      const isValidPassword = await userModel.verifyPassword(currentPassword, currentUser.password);
      if (!isValidPassword) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Current password is incorrect',
          code: 400
        });
      }

      // Update password
      await userModel.updatePassword(userId, newPassword);
    }

    // Update other fields if provided
    if (name || email) {
      const updateData = {
        name: name || currentUser.name,
        email: email || currentUser.email,
        status: currentUser.status
      };
      
      await userModel.updateUser(userId, updateData);
    }

    // Get updated user
    const updatedUser = await userModel.getUserById(userId);
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while updating profile',
      code: 500
    });
  }
};

// Logout (optional - for future use)
const logout = async (req, res) => {
  try {
    // Since we're using JWT, we don't need to invalidate tokens on the server
    // The client should remove the token from storage
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during logout',
      code: 500
    });
  }
};

module.exports = {
  login,
  getCurrentUser,
  updateProfile,
  logout
}; 
