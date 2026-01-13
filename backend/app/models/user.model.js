// models/user.model.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Get all users with their roles
const getAllUsers = async () => {
  const [rows] = await db.query(`
    SELECT u.*, 
           GROUP_CONCAT(r.name) as role_names,
           GROUP_CONCAT(r.id) as role_ids
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);
  
  // Parse role names and IDs
  return rows.map(user => ({
    ...user,
    roles: user.role_names ? user.role_names.split(',').map((name, index) => ({
      id: parseInt(user.role_ids.split(',')[index]),
      name: name
    })) : []
  }));
};

// Get user by ID with roles
const getUserById = async (id) => {
  const [rows] = await db.query(`
    SELECT u.*, 
           GROUP_CONCAT(r.name) as role_names,
           GROUP_CONCAT(r.id) as role_ids
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.id = ?
    GROUP BY u.id
  `, [id]);
  
  if (rows.length === 0) return null;
  
  const user = rows[0];
  return {
    ...user,
    roles: user.role_names ? user.role_names.split(',').map((name, index) => ({
      id: parseInt(user.role_ids.split(',')[index]),
      name: name
    })) : []
  };
};

// Get user by email (for login)
const getUserByEmail = async (email) => {
  const [rows] = await db.query(`
    SELECT u.*, 
           GROUP_CONCAT(r.name) as role_names,
           GROUP_CONCAT(r.id) as role_ids
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.email = ?
    GROUP BY u.id
  `, [email]);
  
  if (rows.length === 0) return null;
  
  const user = rows[0];
  return {
    ...user,
    roles: user.role_names ? user.role_names.split(',').map((name, index) => ({
      id: parseInt(user.role_ids.split(',')[index]),
      name: name
    })) : []
  };
};

// Create new user
const createUser = async ({ name, email, password, status = 'active' }) => {
  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  const [result] = await db.query(
    `INSERT INTO users (name, email, password, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, NOW(), NOW())`,
    [name, email, hashedPassword, status]
  );
  
  return result.insertId;
};

// Update user
const updateUser = async (id, { name, email, status }) => {
  const [result] = await db.query(
    `UPDATE users SET 
      name = ?, email = ?, status = ?, updated_at = NOW()
     WHERE id = ?`,
    [name, email, status, id]
  );
  
  return result.affectedRows > 0;
};

// Update user password
const updatePassword = async (id, newPassword) => {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  
  const [result] = await db.query(
    `UPDATE users SET 
      password = ?, updated_at = NOW()
     WHERE id = ?`,
    [hashedPassword, id]
  );
  
  return result.affectedRows > 0;
};

// Delete user
const deleteUser = async (id) => {
  const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// Verify password
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Update last login
const updateLastLogin = async (id) => {
  const [result] = await db.query(
    `UPDATE users SET last_login = NOW() WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

// Assign role to user
const assignRole = async (userId, roleId, assignedBy = null) => {
  try {
    const [result] = await db.query(
      `INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE assigned_at = NOW()`,
      [userId, roleId, assignedBy]
    );
    return true;
  } catch (error) {
    console.error('Error assigning role:', error);
    return false;
  }
};

// Remove role from user
const removeRole = async (userId, roleId) => {
  const [result] = await db.query(
    'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
    [userId, roleId]
  );
  return result.affectedRows > 0;
};

// Get user roles
const getUserRoles = async (userId) => {
  const [rows] = await db.query(`
    SELECT r.*
    FROM roles r
    JOIN user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = ?
  `, [userId]);
  
  return rows;
};

// Check if user has specific role
const hasRole = async (userId, roleName) => {
  const [rows] = await db.query(`
    SELECT COUNT(*) as count
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = ? AND r.name = ?
  `, [userId, roleName]);
  
  return rows[0].count > 0;
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  updatePassword,
  deleteUser,
  verifyPassword,
  updateLastLogin,
  assignRole,
  removeRole,
  getUserRoles,
  hasRole
}; 
