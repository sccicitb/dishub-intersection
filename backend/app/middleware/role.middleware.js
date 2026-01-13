// middleware/role.middleware.js

// Check if user has specific role
const hasRole = (roleName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 401
      });
    }

    const hasRequiredRole = req.user.roles.some(role => role.name === roleName);
    if (!hasRequiredRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. ${roleName} role required.`,
        code: 403
      });
    }

    next();
  };
};

// Check if user has any of the specified roles
const hasAnyRole = (roleNames) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 401
      });
    }

    const hasRequiredRole = req.user.roles.some(role => roleNames.includes(role.name));
    if (!hasRequiredRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. One of the following roles required: ${roleNames.join(', ')}`,
        code: 403
      });
    }

    next();
  };
};

// Check if user has all specified roles
const hasAllRoles = (roleNames) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 401
      });
    }

    const userRoleNames = req.user.roles.map(role => role.name);
    const hasAllRequiredRoles = roleNames.every(roleName => userRoleNames.includes(roleName));
    
    if (!hasAllRequiredRoles) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. All of the following roles required: ${roleNames.join(', ')}`,
        code: 403
      });
    }

    next();
  };
};

// Admin only access
const requireAdmin = hasRole('admin');

// Operator or Admin access
const requireOperatorOrAdmin = hasAnyRole(['operator', 'admin']);

// Viewer or higher access
const requireViewerOrHigher = hasAnyRole(['viewer', 'operator', 'admin']);

// Check if user can access user management (admin only)
const canManageUsers = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
      code: 401
    });
  }

  const isAdmin = req.user.roles.some(role => role.name === 'admin');
  if (!isAdmin) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'User management requires admin privileges',
      code: 403
    });
  }

  next();
};

// Check if user can access camera management
const canManageCameras = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
      code: 401
    });
  }

  const canManage = req.user.roles.some(role => 
    ['admin', 'operator'].includes(role.name)
  );
  
  if (!canManage) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Camera management requires operator or admin privileges',
      code: 403
    });
  }

  next();
};

// Check if user can access survey management
const canManageSurveys = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
      code: 401
    });
  }

  const canManage = req.user.roles.some(role => 
    ['admin', 'operator'].includes(role.name)
  );
  
  if (!canManage) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Survey management requires operator or admin privileges',
      code: 403
    });
  }

  next();
};

// Check if user can view data (any authenticated user)
const canViewData = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
      code: 401
    });
  }

  // Any authenticated user can view data
  next();
};

// Permission checking utility function
const checkPermission = (permission) => {
  const permissionMap = {
    'manage_users': canManageUsers,
    'manage_cameras': canManageCameras,
    'manage_surveys': canManageSurveys,
    'view_data': canViewData,
    'admin': requireAdmin,
    'operator': hasRole('operator'),
    'viewer': hasRole('viewer')
  };

  return permissionMap[permission] || canViewData;
};

// Role-based route protection with custom error messages
const protectRoute = (requiredRoles, customMessage = null) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 401
      });
    }

    const userRoleNames = req.user.roles.map(role => role.name);
    const hasRequiredRole = requiredRoles.some(roleName => userRoleNames.includes(roleName));
    
    if (!hasRequiredRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: customMessage || `Access denied. Required roles: ${requiredRoles.join(', ')}`,
        code: 403
      });
    }

    next();
  };
};

module.exports = {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  requireAdmin,
  requireOperatorOrAdmin,
  requireViewerOrHigher,
  canManageUsers,
  canManageCameras,
  canManageSurveys,
  canViewData,
  checkPermission,
  protectRoute
}; 
