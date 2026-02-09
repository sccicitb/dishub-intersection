const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
  enableKeepAlive: true,
  decimalNumbers: true,
  supportBigNumbers: true,
  // Connection timeout settings untuk prevent hanging
  connectTimeout: 10000,
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('[DB Pool Error]', err.code, ':', err.message);
});

// Handle connection acquire timeout
pool.on('enqueue', (callback) => {
  console.warn('[DB Pool] Waiting for available connection...');
});

module.exports = pool.promise();
