// models/role.model.js
const db = require('../config/db');

// Get all roles
const getAllRoles = async () => {
  const [rows] = await db.query(`
    SELECT r.*, COUNT(ur.user_id) as user_count
    FROM roles r
    LEFT JOIN user_roles ur ON r.id = ur.role_id
    GROUP BY r.id
    ORDER BY r.name
  `);
  return rows;
};

// Get role by ID
const getRoleById = async (id) => {
  const [rows] = await db.query('SELECT * FROM roles WHERE id = ?', [id]);
  return rows[0] || null;
};

// Get role by name
const getRoleByName = async (name) => {
  const [rows] = await db.query('SELECT * FROM roles WHERE name = ?', [name]);
  return rows[0] || null;
};

// Create new role
const createRole = async ({ name, description }) => {
  const [result] = await db.query(
    `INSERT INTO roles (name, description, created_at, updated_at)
     VALUES (?, ?, NOW(), NOW())`,
    [name, description]
  );
  return result.insertId;
};

// Update role
const updateRole = async (id, { name, description }) => {
  const [result] = await db.query(
    `UPDATE roles SET 
      name = ?, description = ?, updated_at = NOW()
     WHERE id = ?`,
    [name, description, id]
  );
  return result.affectedRows > 0;
};

// Delete role
const deleteRole = async (id) => {
  // Check if role is assigned to any users
  const [userCount] = await db.query(
    'SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?',
    [id]
  );
  
  if (userCount[0].count > 0) {
    throw new Error('Cannot delete role that is assigned to users');
  }
  
  const [result] = await db.query('DELETE FROM roles WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// Get users with specific role
const getUsersWithRole = async (roleId) => {
  const [rows] = await db.query(`
    SELECT u.*, ur.assigned_at, ur.assigned_by
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    WHERE ur.role_id = ?
    ORDER BY u.name
  `, [roleId]);
  return rows;
};

// Get role statistics
const getRoleStats = async () => {
  const [rows] = await db.query(`
    SELECT 
      r.id,
      r.name,
      r.description,
      COUNT(ur.user_id) as user_count,
      r.created_at
    FROM roles r
    LEFT JOIN user_roles ur ON r.id = ur.role_id
    GROUP BY r.id
    ORDER BY user_count DESC
  `);
  return rows;
};

// Check if role exists
const roleExists = async (name) => {
  const [rows] = await db.query(
    'SELECT COUNT(*) as count FROM roles WHERE name = ?',
    [name]
  );
  return rows[0].count > 0;
};

// Get default roles (admin, operator, viewer)
const getDefaultRoles = async () => {
  const [rows] = await db.query(`
    SELECT * FROM roles 
    WHERE name IN ('admin', 'operator', 'viewer')
    ORDER BY name
  `);
  return rows;
};

// Get role permissions (for future use)
const getRolePermissions = async (roleId) => {
  // This is a placeholder for future permission system
  // For now, we'll return basic role info
  const role = await getRoleById(roleId);
  if (!role) return null;
  
  // Define basic permissions based on role name
  const permissions = {
    admin: ['read', 'write', 'delete', 'manage_users', 'manage_roles'],
    operator: ['read', 'write', 'manage_cameras', 'manage_surveys'],
    viewer: ['read']
  };
  
  return {
    role,
    permissions: permissions[role.name] || ['read']
  };
};

module.exports = {
  getAllRoles,
  getRoleById,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  getUsersWithRole,
  getRoleStats,
  roleExists,
  getDefaultRoles,
  getRolePermissions
}; 
