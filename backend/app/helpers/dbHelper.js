/**
 * Database Helper - Provides utilities for reliable database operations
 * Handles connection pooling, retries, and graceful error handling
 */

/**
 * Execute query with automatic retry on connection errors
 * @param {Function} queryFn - Function that executes the database query
 * @param {Number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {Number} retryDelay - Delay between retries in milliseconds (default: 1000)
 * @returns {Promise} Query result
 */
const executeWithRetry = async (queryFn, maxRetries = 3, retryDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (err) {
      lastError = err;
      
      // Check if error is a connection error (ECONNRESET, ECONNREFUSED, etc.)
      const isConnectionError = err.code && 
        (err.code === 'ECONNRESET' || 
         err.code === 'ECONNREFUSED' || 
         err.code === 'PROTOCOL_CONNECTION_LOST' ||
         err.code === 'PROTOCOL_ERROR' ||
         err.code === 'ER_GET_CONNECTION_TIMEOUT');
      
      // Only retry on connection errors
      if (isConnectionError && attempt < maxRetries) {
        const waitTime = retryDelay * attempt; // Exponential backoff
        console.warn(
          `⚠️  Connection error (attempt ${attempt}/${maxRetries}): ${err.code}. ` +
          `Retrying in ${waitTime}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else if (attempt === maxRetries || !isConnectionError) {
        // No more retries or not a retryable error
        throw err;
      }
    }
  }
  
  throw lastError;
};

/**
 * Test database connection
 * @param {Object} db - Database pool object
 * @returns {Promise<Boolean>} true if connection successful
 */
const testConnection = async (db) => {
  try {
    const result = await executeWithRetry(
      () => db.execute('SELECT 1 as alive'),
      2,
      500
    );
    console.log('✅ Database connection test passed');
    return true;
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    return false;
  }
};

/**
 * Safely execute a database query
 * @param {Object} db - Database pool object
 * @param {String} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
const safeExecute = async (db, query, params = []) => {
  return executeWithRetry(
    () => db.execute(query, params),
    3,
    1000
  );
};

/**
 * Check if error is a database connection error
 * @param {Error} error - Error object
 * @returns {Boolean}
 */
const isConnectionError = (error) => {
  if (!error || !error.code) return false;
  
  const connectionErrors = [
    'ECONNRESET',
    'ECONNREFUSED',
    'PROTOCOL_CONNECTION_LOST',
    'PROTOCOL_ERROR',
    'ER_GET_CONNECTION_TIMEOUT',
    'ENOTFOUND',
    'ETIMEDOUT'
  ];
  
  return connectionErrors.includes(error.code);
};

module.exports = {
  executeWithRetry,
  testConnection,
  safeExecute,
  isConnectionError
};
