#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * Usage: 
 *   node test_db_connection.js
 * 
 * This script tests the database connection and verifies the fixes are working
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const db = require('./app/config/db');
const { testConnection, executeWithRetry, isConnectionError } = require('./app/helpers/dbHelper');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function runTests() {
  console.log(`\n${colors.blue}========================================`);
  console.log('Database Connection Test Suite');
  console.log(`========================================${colors.reset}\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: Basic Connection
  console.log(`${colors.blue}[Test 1]${colors.reset} Basic Database Connection`);
  try {
    const isConnected = await testConnection(db);
    if (isConnected) {
      console.log(`${colors.green}✅ PASSED${colors.reset}\n`);
      passed++;
    } else {
      console.log(`${colors.red}❌ FAILED${colors.reset}\n`);
      failed++;
    }
  } catch (err) {
    console.log(`${colors.red}❌ FAILED: ${err.message}${colors.reset}\n`);
    failed++;
  }

  // Test 2: Retry Logic
  console.log(`${colors.blue}[Test 2]${colors.reset} Retry Logic with Exponential Backoff`);
  try {
    let attemptCount = 0;
    const maxAttempts = 3;
    
    await executeWithRetry(
      () => {
        attemptCount++;
        if (attemptCount < maxAttempts) {
          // Simulate connection error on first 2 attempts
          const err = new Error('ECONNRESET');
          err.code = 'ECONNRESET';
          throw err;
        }
        return Promise.resolve('Success on attempt ' + attemptCount);
      },
      maxAttempts,
      100 // Shorter delay for testing
    );
    
    if (attemptCount === maxAttempts) {
      console.log(`${colors.green}✅ PASSED${colors.reset} (Retried ${attemptCount - 1} times before success)\n`);
      passed++;
    } else {
      console.log(`${colors.red}❌ FAILED${colors.reset} (Unexpected attempt count)\n`);
      failed++;
    }
  } catch (err) {
    console.log(`${colors.red}❌ FAILED: ${err.message}${colors.reset}\n`);
    failed++;
  }

  // Test 3: Connection Error Detection
  console.log(`${colors.blue}[Test 3]${colors.reset} Connection Error Detection`);
  try {
    const testErrors = [
      { code: 'ECONNRESET', expected: true },
      { code: 'ECONNREFUSED', expected: true },
      { code: 'PROTOCOL_ERROR', expected: true },
      { code: 'SYNTAX_ERROR', expected: false },
      { code: undefined, expected: false }
    ];

    let testsPassed = true;
    for (const test of testErrors) {
      const result = isConnectionError({ code: test.code });
      if (result !== test.expected) {
        testsPassed = false;
        break;
      }
    }

    if (testsPassed) {
      console.log(`${colors.green}✅ PASSED${colors.reset} (All error types correctly identified)\n`);
      passed++;
    } else {
      console.log(`${colors.red}❌ FAILED${colors.reset}\n`);
      failed++;
    }
  } catch (err) {
    console.log(`${colors.red}❌ FAILED: ${err.message}${colors.reset}\n`);
    failed++;
  }

  // Test 4: Query Execution
  console.log(`${colors.blue}[Test 4]${colors.reset} Query Execution with Database`);
  try {
    const [rows] = await executeWithRetry(
      () => db.execute('SELECT 1 as test_value'),
      3,
      1000
    );
    
    if (rows && rows[0] && rows[0].test_value === 1) {
      console.log(`${colors.green}✅ PASSED${colors.reset} (Query executed successfully)\n`);
      passed++;
    } else {
      console.log(`${colors.red}❌ FAILED${colors.reset} (Unexpected query result)\n`);
      failed++;
    }
  } catch (err) {
    console.log(`${colors.red}❌ FAILED: ${err.message}${colors.reset}\n`);
    failed++;
  }

  // Test 5: Check Cameras Table (if exists)
  console.log(`${colors.blue}[Test 5]${colors.reset} Verify Cameras Table Access`);
  try {
    const [cameras] = await executeWithRetry(
      () => db.execute('SELECT COUNT(*) as count FROM cameras'),
      3,
      1000
    );
    
    const count = cameras[0]?.count || 0;
    console.log(`${colors.green}✅ PASSED${colors.reset} (Found ${count} cameras)\n`);
    passed++;
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      console.log(`${colors.yellow}⚠️  SKIPPED${colors.reset} (cameras table not found)\n`);
    } else {
      console.log(`${colors.red}❌ FAILED: ${err.message}${colors.reset}\n`);
      failed++;
    }
  }

  // Summary
  console.log(`${colors.blue}========================================`);
  console.log('Test Summary');
  console.log(`========================================${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${passed + failed}\n`);

  if (failed === 0) {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}❌ Some tests failed. Check your database configuration.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err);
  process.exit(1);
});
