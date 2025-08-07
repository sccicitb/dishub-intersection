const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,  // Gunakan default 3306 jika tidak ada di .env
  waitForConnections: true,
  connectionLimit: 10,  // Jumlah maksimal koneksi dalam pool
  queueLimit: 0
});

module.exports = pool; // Use callback-style for compatibility with existing models
