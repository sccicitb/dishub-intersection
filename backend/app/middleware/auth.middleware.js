// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

// Verify JWT token and extract user info
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token is required',
        code: 401
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here');
    
    // Get user from database to ensure they still exist and are active
    const user = await userModel.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found',
        code: 401
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Account is inactive',
        code: 401
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
        code: 401
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired',
        code: 401
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during authentication',
      code: 500
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here');
    
    // Get user from database
    const user = await userModel.getUserById(decoded.id);
    if (user && user.status === 'active') {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles
      };
    }

    next();

  } catch (error) {
    // If token is invalid, just continue without authentication
    next();
  }
};

// Check if user is authenticated (for routes that require auth)
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
      code: 401
    });
  }
  next();
};

// Extract user info from token without database check (for performance)
const extractUserFromToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token is required',
        code: 401
      });
    }

    // Verify token without database check
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here');
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      roles: decoded.roles
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
        code: 401
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired',
        code: 401
      });
    }

    console.error('Token extraction error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during token extraction',
      code: 500
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAuth,
  extractUserFromToken
}; 