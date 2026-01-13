# Database Connection Issues - Troubleshooting Guide

## Problem: `ECONNRESET` Error

### Symptoms
```
Error: read ECONNRESET
Error in updateCameraStatusFromSurvey job: Error: read ECONNRESET
```

The cron job `updateCameraStatusFromSurvey` crashes with connection reset errors.

---

## Root Causes

### 1. **Database Connection Pool Timeout**
- Connection stays idle longer than database server timeout (usually 8 hours for MySQL)
- Pool doesn't close/refresh connections properly

### 2. **Too Many Concurrent Connections**
- Default pool limit (10) might be too low or too high
- All connections exhausted

### 3. **Network Issues**
- Intermittent network problems between app and database
- Database server restarts/maintenance

### 4. **Missing Keep-Alive**
- TCP keep-alive disabled
- Long-idle connections get dropped by firewall/proxy

---

## Solutions Applied

### ✅ Solution 1: Enhanced Connection Pool Configuration
**File:** `app/config/db.js`

```javascript
const pool = mysql.createPool({
  // ... other config ...
  enableKeepAlive: true,           // Enable TCP keep-alive
  keepAliveInitialDelayMs: 0,      // Keep-alive immediately
  restartConnections: true         // Auto-restart lost connections
});

// Handle connection errors gracefully
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});
```

### ✅ Solution 2: Retry Logic with Exponential Backoff
**File:** `jobs/updateCameraStatusFromSurvey.js`

Added `executeWithRetry` function that:
- Automatically retries failed queries up to 3 times
- Uses exponential backoff (1s, 2s, 4s delays)
- Only retries on connection errors
- Logs detailed error information

### ✅ Solution 3: Database Helper Utility
**File:** `app/helpers/dbHelper.js`

New utility module providing:
- `executeWithRetry()` - Execute queries with automatic retry
- `testConnection()` - Test DB connectivity
- `safeExecute()` - Safely execute any query
- `isConnectionError()` - Check if error is connection-related

---

## Usage Examples

### Using the Helper in Your Code

```javascript
const { executeWithRetry, safeExecute } = require('../helpers/dbHelper');

// Option 1: Using executeWithRetry directly
const data = await executeWithRetry(
  () => db.execute('SELECT * FROM cameras'),
  3,           // max retries
  1000         // delay in ms
);

// Option 2: Using safeExecute (recommended)
const [rows] = await safeExecute(
  db, 
  'SELECT * FROM cameras WHERE id = ?',
  [cameraId]
);
```

---

## Environment Configuration

### Required .env Variables
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=your_database
DB_PORT=3306
```

### Optional MySQL Connection Tuning
Add to MySQL server configuration (`my.cnf` or `my.ini`):

```ini
[mysqld]
max_connections = 100
wait_timeout = 28800          # 8 hours
interactive_timeout = 28800   # 8 hours
```

---

## Monitoring & Debugging

### Check Connection Pool Status
```javascript
// In your server or admin endpoint
const poolStatus = {
  activeConnections: db._connectionQueue?.length || 0,
  waitingRequests: db._waitQueue?.length || 0
};
console.log('Pool status:', poolStatus);
```

### Enable Detailed Logging
Add to `updateCameraStatusFromSurvey.js`:
```javascript
console.log('📊 Connection pool stats:');
console.log(`  - Active connections: ${db._connectionQueue?.length || 0}`);
console.log(`  - Waiting requests: ${db._waitQueue?.length || 0}`);
```

---

## Testing the Fix

### 1. Run Connection Test
```bash
# In Node.js console or separate test script
const db = require('./app/config/db');
const { testConnection } = require('./app/helpers/dbHelper');

await testConnection(db); // Should output: ✅ Database connection test passed
```

### 2. Check Cron Job Logs
Watch console output during cron execution:
```bash
npm start
# Wait for next 5-minute interval
# Should see: 📡 Checking camera status from survey data...
# Followed by camera status updates
```

### 3. Monitor Error Rate
Track connection errors in logs:
- Should significantly decrease after applying fixes
- Any remaining errors should show retry attempts

---

## Advanced Troubleshooting

### If Problems Persist:

1. **Increase Connection Pool Size**
   ```javascript
   connectionLimit: 20,  // Instead of 10
   ```

2. **Increase Timeout Values**
   ```javascript
   const newRetry = await executeWithRetry(fn, 5, 2000); // 5 retries, 2s initial delay
   ```

3. **Check Database Logs**
   ```sql
   -- MySQL logs location
   SHOW VARIABLES LIKE 'log_error';
   ```

4. **Verify Network Connectivity**
   ```bash
   ping your_db_host
   telnet your_db_host 3306
   ```

5. **Check Process Resources**
   ```bash
   # Windows
   Get-Process | Where-Object {$_.Name -like "*node*"}
   
   # Linux
   ps aux | grep node
   ```

---

## Best Practices

1. ✅ Always use retry logic for critical cron jobs
2. ✅ Monitor pool statistics regularly
3. ✅ Use exponential backoff for retries
4. ✅ Log detailed error information
5. ✅ Test database connectivity on startup
6. ✅ Gracefully handle failures (don't crash)
7. ✅ Set appropriate timeout values for your workload

---

## References

- MySQL2 Documentation: https://github.com/sidorares/node-mysql2
- Node.js Connection Pooling: https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/
- Exponential Backoff Pattern: https://en.wikipedia.org/wiki/Exponential_backoff

