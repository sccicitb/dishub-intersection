/**
 * Database Performance Baseline Testing Script
 * 
 * This script tests the current performance of key queries from survey.model.js and vehicle.model.js
 * to establish a baseline before implementing database indexes.
 * 
 * Run this script before implementing indexes, then run again after to measure improvements.
 * 
 * Usage: node test_performance_baseline.js
 */

const db = require('./app/config/db');
const fs = require('fs');
const path = require('path');

// Performance test configuration
const TEST_CONFIG = {
  // Number of times to run each query for average timing
  ITERATIONS: 5,
  
  // Test data parameters
  SIMPANG_IDS: [2, 3, 4, 5],
  DIRECTIONS: ['north', 'south', 'east', 'west'],
  
  // Date ranges for testing
  TEST_DATES: {
    TODAY: new Date().toISOString().slice(0, 10),
    YESTERDAY: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    LAST_WEEK: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    LAST_MONTH: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  },
  
  // Vehicle type columns for testing
  VEHICLE_COLUMNS: ['SM', 'MP', 'AUP', 'TR', 'BS', 'TS', 'TB', 'BB', 'GANDENG', 'KTB']
};

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  databaseInfo: {},
  queryTests: [],
  summary: {}
};

/**
 * Utility function to measure query execution time and get EXPLAIN data
 */
async function measureQuery(name, sql, params = [], iterations = TEST_CONFIG.ITERATIONS) {
  console.log(`\n📊 Testing: ${name}`);
  console.log(`SQL: ${sql.replace(/\s+/g, ' ').trim()}`);
  console.log(`Params: ${JSON.stringify(params)}`);
  
  const times = [];
  let lastResult = null;
  let explainResult = null;
  let rowsExamined = 0;
  let rowsReturned = 0;
  
  try {
    // Get EXPLAIN information
    const explainSql = `EXPLAIN ${sql}`;
    const [explain] = await db.query(explainSql, params);
    explainResult = explain;
    
    // Calculate rows examined from EXPLAIN
    rowsExamined = explain.reduce((total, row) => {
      const rows = parseInt(row.rows) || 0;
      return total + rows;
    }, 0);
    
    // Run the actual query multiple times for timing
    for (let i = 0; i < iterations; i++) {
      const startTime = process.hrtime.bigint();
      const [result] = await db.query(sql, params);
      const endTime = process.hrtime.bigint();
      
      const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      times.push(executionTime);
      lastResult = result;
      rowsReturned = result.length;
      
      console.log(`  Iteration ${i + 1}: ${executionTime.toFixed(2)}ms`);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const testResult = {
      name,
      sql: sql.replace(/\s+/g, ' ').trim(),
      params,
      avgTime: parseFloat(avgTime.toFixed(2)),
      minTime: parseFloat(minTime.toFixed(2)),
      maxTime: parseFloat(maxTime.toFixed(2)),
      rowsExamined,
      rowsReturned,
      efficiency: rowsReturned > 0 ? parseFloat((rowsReturned / rowsExamined * 100).toFixed(2)) : 0,
      explainPlan: explainResult,
      iterations
    };
    
    console.log(`  ✅ Average: ${avgTime.toFixed(2)}ms, Rows examined: ${rowsExamined}, Rows returned: ${rowsReturned}`);
    
    return testResult;
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return {
      name,
      sql,
      params,
      error: error.message,
      avgTime: null,
      rowsExamined: null,
      rowsReturned: null
    };
  }
}

/**
 * Get database information and statistics
 */
async function getDatabaseInfo() {
  console.log('\n🔍 Gathering database information...');
  
  try {
    // Get table size and row count
    const [tableInfo] = await db.query(`
      SELECT 
        table_name,
        table_rows,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
        ROUND((data_length / 1024 / 1024), 2) AS data_mb,
        ROUND((index_length / 1024 / 1024), 2) AS index_mb
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'arus'
    `);
    
    // Get current indexes
    const [indexes] = await db.query(`
      SHOW INDEX FROM arus
    `);
    
    // Get database version
    const [version] = await db.query('SELECT VERSION() as version');
    
    // Get server variables
    const [variables] = await db.query(`
      SHOW VARIABLES WHERE Variable_name IN (
        'innodb_buffer_pool_size',
        'query_cache_size',
        'key_buffer_size',
        'sort_buffer_size'
      )
    `);
    
    const dbInfo = {
      version: version[0].version,
      tableInfo: tableInfo[0] || {},
      currentIndexes: indexes,
      serverVariables: variables,
      testDate: new Date().toISOString()
    };
    
    console.log(`📋 Database: MySQL ${dbInfo.version}`);
    console.log(`📊 Table 'arus': ${dbInfo.tableInfo.table_rows || 'Unknown'} rows, ${dbInfo.tableInfo.size_mb || 'Unknown'} MB`);
    console.log(`📇 Current indexes: ${indexes.length}`);
    
    return dbInfo;

    } catch (error) {
    console.error('❌ Error getting database info:', error.message);
    return { error: error.message };
  }
}

/**
 * Test queries from vehicle.model.js
 */
async function testVehicleModelQueries() {
  console.log('\n🚗 Testing Vehicle Model Queries');
  console.log('=' * 50);
  
  const tests = [];
  
  // Test 1: Simple simpang filtering (most common)
  tests.push(await measureQuery(
    'Simple Simpang Filter',
    'SELECT * FROM arus WHERE ID_Simpang = ? ORDER BY waktu DESC LIMIT 10',
    [TEST_CONFIG.SIMPANG_IDS[0]]
  ));
  
  // Test 2: Date filtering with timezone conversion (expensive)
  tests.push(await measureQuery(
    'Timezone Date Filter (Today)',
    `SELECT COUNT(*) as count FROM arus 
     WHERE DATE(CONVERT_TZ(waktu, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'))
     AND ID_Simpang = ?`,
    [TEST_CONFIG.SIMPANG_IDS[0]]
  ));
  
  // Test 3: Weekly aggregation with timezone
  tests.push(await measureQuery(
    'Weekly Aggregation with Timezone',
    `SELECT 
       COUNT(CASE WHEN dari_arah IN ('east', 'west', 'north', 'south') THEN 1 END) AS total_IN,
       COUNT(CASE WHEN ke_arah IN ('east', 'west', 'north', 'south') AND dari_arah IN ('east', 'west', 'north', 'south') THEN 1 END) AS total_OUT
     FROM arus
     WHERE WEEK(CONVERT_TZ(waktu, '+00:00', '+07:00'), 1) = WEEK(CONVERT_TZ(NOW(), '+00:00', '+07:00'), 1) 
     AND YEAR(CONVERT_TZ(waktu, '+00:00', '+07:00')) = YEAR(CONVERT_TZ(NOW(), '+00:00', '+07:00'))
     AND ID_Simpang IN (${TEST_CONFIG.SIMPANG_IDS.join(', ')})`
  ));
  
  // Test 4: ✅ OPTIMIZED: Hourly aggregation with simple HOUR() and BETWEEN
  tests.push(await measureQuery(
    'Optimized Hourly Traffic Aggregation',
    `SELECT
       HOUR(waktu) AS jam,
       COUNT(CASE WHEN dari_arah IN ('east', 'west', 'north', 'south') THEN 1 END) AS total_IN,
       COUNT(CASE WHEN ke_arah IN ('east', 'west', 'north', 'south') AND dari_arah IN ('east', 'west', 'north', 'south') THEN 1 END) AS total_OUT
     FROM arus
     WHERE waktu BETWEEN ? AND ?
     AND ID_Simpang IN (${TEST_CONFIG.SIMPANG_IDS.join(', ')})
     GROUP BY jam
     ORDER BY jam`,
    [
      `${TEST_CONFIG.TEST_DATES.TODAY} 00:00:00`,
      `${TEST_CONFIG.TEST_DATES.TODAY} 23:59:59`
    ]
  ));
  
  // Test 5: Direction-based filtering
  tests.push(await measureQuery(
    'Direction-based Traffic Flow',
    `SELECT 
       d.arah, 
       COALESCE(SUM(data.total_IN), 0) AS total_IN, 
       COALESCE(SUM(data.total_OUT), 0) AS total_OUT
     FROM (
       SELECT 'east' as arah UNION ALL SELECT 'north' as arah
       UNION ALL SELECT 'south' as arah UNION ALL SELECT 'west' as arah
     ) d
     LEFT JOIN (
       SELECT dari_arah AS arah, 1 AS total_IN, 0 AS total_OUT
       FROM arus
       WHERE DATE(CONVERT_TZ(waktu, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'))
       AND ID_Simpang IN (${TEST_CONFIG.SIMPANG_IDS.join(', ')})
       AND dari_arah IN ('east', 'west', 'north', 'south')
       UNION ALL
       SELECT ke_arah AS arah, 0 AS total_IN, 1 AS total_OUT
       FROM arus
       WHERE DATE(CONVERT_TZ(waktu, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'))
       AND ID_Simpang IN (${TEST_CONFIG.SIMPANG_IDS.join(', ')})
       AND ke_arah IN ('east', 'west', 'north', 'south')
       AND dari_arah IN ('east', 'west', 'north', 'south')
     ) data ON d.arah = data.arah
     GROUP BY d.arah
     ORDER BY d.arah`
  ));
  
  return tests;
}

/**
 * Test queries from survey.model.js
 */
async function testSurveyModelQueries() {
  console.log('\n📋 Testing Survey Model Queries');
  console.log('=' * 50);
  
  const tests = [];
  
  // Test 1: Basic time range filtering
  tests.push(await measureQuery(
    'Simple Date Range Filter',
    `SELECT waktu, ${TEST_CONFIG.VEHICLE_COLUMNS.join(', ')} 
     FROM arus 
     WHERE waktu IS NOT NULL 
     AND ID_Simpang = ? 
     AND waktu BETWEEN ? AND ?`,
    [
      TEST_CONFIG.SIMPANG_IDS[0],
      `${TEST_CONFIG.TEST_DATES.TODAY} 00:00:00`,
      `${TEST_CONFIG.TEST_DATES.TODAY} 23:59:59`
    ]
  ));
  
  // Test 2: ✅ OPTIMIZED: Date range filtering (using BETWEEN instead of DATE)
  tests.push(await measureQuery(
    'Optimized Date Range Filter',
    'SELECT * FROM arus WHERE ID_Simpang = ? AND waktu BETWEEN ? AND ?',
    [
      TEST_CONFIG.SIMPANG_IDS[0], 
      `${TEST_CONFIG.TEST_DATES.TODAY} 00:00:00`,
      `${TEST_CONFIG.TEST_DATES.TODAY} 23:59:59`
    ]
  ));
  
  // Test 3: ✅ OPTIMIZED: Direction and vehicle type aggregation (using BETWEEN)
  tests.push(await measureQuery(
    'Optimized Direction Vehicle Aggregation',
    `SELECT dari_arah, ke_arah, ${TEST_CONFIG.VEHICLE_COLUMNS.map(col => `SUM(\`${col}\`) AS \`${col}\``).join(', ')}
     FROM arus
     WHERE ID_Simpang = ? AND waktu BETWEEN ? AND ?
     GROUP BY dari_arah, ke_arah`,
    [
      TEST_CONFIG.SIMPANG_IDS[0], 
      `${TEST_CONFIG.TEST_DATES.TODAY} 00:00:00`,
      `${TEST_CONFIG.TEST_DATES.TODAY} 23:59:59`
    ]
  ));
  
  // Test 4: ✅ OPTIMIZED: Daily summary with CAST instead of DATE()
  tests.push(await measureQuery(
    'Optimized Daily Summary Range',
    `SELECT CAST(waktu AS DATE) AS date, ${TEST_CONFIG.VEHICLE_COLUMNS.map(col => `SUM(\`${col}\`) AS \`${col}\``).join(', ')}
     FROM arus
     WHERE waktu BETWEEN ? AND ?
     AND ID_Simpang = ?
     GROUP BY CAST(waktu AS DATE) 
     ORDER BY CAST(waktu AS DATE)`,
    [
      `${TEST_CONFIG.TEST_DATES.LAST_WEEK} 00:00:00`,
      `${TEST_CONFIG.TEST_DATES.TODAY} 23:59:59`,
      TEST_CONFIG.SIMPANG_IDS[0]
    ]
  ));
  
  // Test 5: ✅ OPTIMIZED: KM Tabel query with BETWEEN instead of DATE()
  tests.push(await measureQuery(
    'Optimized KM Tabel Query',
    `SELECT 
       HOUR(waktu) as hour,
       FLOOR(MINUTE(waktu) / 15) as minute_group,
       dari_arah,
       ke_arah,
       ${TEST_CONFIG.VEHICLE_COLUMNS.map(col => `SUM(${col}) as ${col}`).join(', ')}
     FROM arus 
     WHERE ID_Simpang = ? 
     AND waktu BETWEEN ? AND ?
     AND dari_arah IN ('east', 'west', 'north', 'south')
     GROUP BY HOUR(waktu), FLOOR(MINUTE(waktu) / 15), dari_arah, ke_arah
     ORDER BY hour, minute_group, dari_arah, ke_arah`,
    [
      TEST_CONFIG.SIMPANG_IDS[0], 
      `${TEST_CONFIG.TEST_DATES.TODAY} 00:00:00`,
      `${TEST_CONFIG.TEST_DATES.TODAY} 23:59:59`
    ]
  ));
  
  // Test 6: Multiple simpang aggregation
  tests.push(await measureQuery(
    'Multi-Simpang Aggregation',
    `SELECT ID_Simpang, dari_arah, ${TEST_CONFIG.VEHICLE_COLUMNS.map(col => `SUM(\`${col}\`) AS \`${col}\``).join(', ')}
     FROM arus
     WHERE ID_Simpang IN (${TEST_CONFIG.SIMPANG_IDS.join(', ')})
     AND waktu >= ? AND waktu < ?
     GROUP BY ID_Simpang, dari_arah`,
    [
      `${TEST_CONFIG.TEST_DATES.TODAY} 00:00:00`,
      `${TEST_CONFIG.TEST_DATES.TODAY} 23:59:59`
    ]
  ));
  
  return tests;
}

/**
 * Test edge cases and performance stress tests
 */
async function testEdgeCases() {
  console.log('\n⚡ Testing Edge Cases and Stress Tests');
  console.log('=' * 50);
  
  const tests = [];
  
  // Test 1: Large date range
  tests.push(await measureQuery(
    'Large Date Range (30 days)',
    `SELECT COUNT(*) as total_records
     FROM arus
     WHERE waktu BETWEEN ? AND ?
     AND ID_Simpang = ?`,
    [
      `${TEST_CONFIG.TEST_DATES.LAST_MONTH} 00:00:00`,
      `${TEST_CONFIG.TEST_DATES.TODAY} 23:59:59`,
      TEST_CONFIG.SIMPANG_IDS[0]
    ]
  ));
  
  // Test 2: Full table scan simulation
  tests.push(await measureQuery(
    'Full Table Scan (No Indexes)',
    'SELECT COUNT(*) as total FROM arus WHERE dari_arah IS NOT NULL',
    [],
    2 // Fewer iterations for expensive query
  ));
  
  // Test 3: ✅ OPTIMIZED: Complex aggregation with CAST instead of DATE()
  tests.push(await measureQuery(
    'Optimized Multi-Simpang Aggregation',
    `SELECT 
       ID_Simpang,
       CAST(waktu AS DATE) as date,
       HOUR(waktu) as hour,
       dari_arah,
       ke_arah,
       COUNT(*) as record_count,
       ${TEST_CONFIG.VEHICLE_COLUMNS.map(col => `SUM(${col}) as total_${col}`).join(', ')}
     FROM arus
     WHERE waktu BETWEEN ? AND ?
     GROUP BY ID_Simpang, CAST(waktu AS DATE), HOUR(waktu), dari_arah, ke_arah
     HAVING record_count > 0
     ORDER BY ID_Simpang, date, hour`,
    [
      `${TEST_CONFIG.TEST_DATES.YESTERDAY} 00:00:00`,
      `${TEST_CONFIG.TEST_DATES.TODAY} 23:59:59`
    ],
    2 // Fewer iterations for expensive query
  ));
  
  return tests;
}

/**
 * Generate performance report
 */
async function generateReport() {
  const reportPath = path.join(__dirname, 'PERFORMANCE_TESTING_RESULTS.md');
  
  // Calculate summary statistics
  const allTests = testResults.queryTests;
  const successfulTests = allTests.filter(test => !test.error);
  
  const summary = {
    totalTests: allTests.length,
    successfulTests: successfulTests.length,
    failedTests: allTests.length - successfulTests.length,
    avgExecutionTime: successfulTests.length > 0 
      ? (successfulTests.reduce((sum, test) => sum + test.avgTime, 0) / successfulTests.length).toFixed(2)
      : 0,
    totalRowsExamined: successfulTests.reduce((sum, test) => sum + (test.rowsExamined || 0), 0),
    totalRowsReturned: successfulTests.reduce((sum, test) => sum + (test.rowsReturned || 0), 0),
    overallEfficiency: 0
  };
  
  if (summary.totalRowsExamined > 0) {
    summary.overallEfficiency = ((summary.totalRowsReturned / summary.totalRowsExamined) * 100).toFixed(2);
  }
  
  testResults.summary = summary;
  
  // Generate markdown report
  let report = `# Database Performance Testing Results

## Test Overview

**Test Date:** ${testResults.timestamp}
**Database Version:** ${testResults.databaseInfo.version || 'Unknown'}
**Table Info:** ${testResults.databaseInfo.tableInfo.table_rows || 'Unknown'} rows, ${testResults.databaseInfo.tableInfo.size_mb || 'Unknown'} MB

## Test Summary

- **Total Tests:** ${summary.totalTests}
- **Successful:** ${summary.successfulTests}
- **Failed:** ${summary.failedTests}
- **Average Execution Time:** ${summary.avgExecutionTime}ms
- **Total Rows Examined:** ${summary.totalRowsExamined.toLocaleString()}
- **Total Rows Returned:** ${summary.totalRowsReturned.toLocaleString()}
- **Overall Efficiency:** ${summary.overallEfficiency}%

## Current Database Indexes

`;

  // Add current indexes
  if (testResults.databaseInfo.currentIndexes) {
    report += '| Key Name | Column | Type | Unique |\n|----------|---------|------|--------|\n';
    testResults.databaseInfo.currentIndexes.forEach(index => {
      report += `| ${index.Key_name} | ${index.Column_name} | ${index.Index_type} | ${index.Non_unique === 0 ? 'Yes' : 'No'} |\n`;
    });
  }

  report += `

## Detailed Test Results

### Performance Summary Table

| Test Name | Avg Time (ms) | Min Time (ms) | Max Time (ms) | Rows Examined | Rows Returned | Efficiency % |
|-----------|---------------|---------------|---------------|---------------|---------------|--------------|
`;

  // Add test results to table
  allTests.forEach(test => {
    if (!test.error) {
      report += `| ${test.name} | ${test.avgTime} | ${test.minTime} | ${test.maxTime} | ${test.rowsExamined || 'N/A'} | ${test.rowsReturned || 'N/A'} | ${test.efficiency || 'N/A'} |\n`;
    } else {
      report += `| ${test.name} | ERROR | ERROR | ERROR | ERROR | ERROR | ERROR |\n`;
    }
  });

  report += `

### Query Categories Analysis

#### 🚗 Vehicle Model Queries
These queries primarily focus on real-time traffic monitoring and timezone-based filtering.

#### 📋 Survey Model Queries  
These queries handle traffic data aggregation and reporting with complex grouping operations.

#### ⚡ Edge Cases and Stress Tests
These queries test system limits and performance under heavy load conditions.

## Performance Bottlenecks Identified

### Top 5 Slowest Queries

`;

  // Find slowest queries
  const slowestQueries = successfulTests
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, 5);

  slowestQueries.forEach((test, index) => {
    report += `${index + 1}. **${test.name}**: ${test.avgTime}ms (examined ${test.rowsExamined} rows)\n`;
  });

  report += `

### Efficiency Analysis

**Least Efficient Queries (High Row Examination Ratio):**

`;

  // Find least efficient queries
  const inefficientQueries = successfulTests
    .filter(test => test.efficiency !== undefined)
    .sort((a, b) => a.efficiency - b.efficiency)
    .slice(0, 5);

  inefficientQueries.forEach((test, index) => {
    report += `${index + 1}. **${test.name}**: ${test.efficiency}% efficiency (${test.rowsExamined} examined, ${test.rowsReturned} returned)\n`;
  });

  report += `

## Recommendations

Based on the performance testing results:

1. **Critical Priority**: Implement indexes on frequently filtered columns (ID_Simpang, waktu)
2. **High Priority**: Add composite indexes for common query patterns
3. **Medium Priority**: Consider functional indexes for date operations
4. **Monitor**: Track query performance improvements after index implementation

## Next Steps

1. ✅ Baseline performance documented
2. ⏳ Implement Priority 1 indexes from DATABASE_INDEXING_PLAN.md
3. ⏳ Re-run this test script to measure improvements
4. ⏳ Update this report with post-index results

---

*This report was generated automatically by test_performance_baseline.js*
*For index implementation guide, see DATABASE_INDEXING_PLAN.md*
`;

  // Write report to file
  fs.writeFileSync(reportPath, report);
  
  // Also save raw JSON data
  const jsonPath = path.join(__dirname, 'performance_test_results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(testResults, null, 2));
  
  console.log(`\n📊 Performance report generated: ${reportPath}`);
  console.log(`📊 Raw data saved: ${jsonPath}`);
  
  return reportPath;
}

/**
 * Main execution function
 */
async function runPerformanceTests() {
  console.log('🚀 Starting Database Performance Baseline Testing');
  console.log('=' * 60);
  
  try {
    // Gather database information
    testResults.databaseInfo = await getDatabaseInfo();
    
    // Run all test suites
    const vehicleTests = await testVehicleModelQueries();
    const surveyTests = await testSurveyModelQueries();
    const edgeTests = await testEdgeCases();
    
    // Combine all test results
    testResults.queryTests = [
      ...vehicleTests,
      ...surveyTests,
      ...edgeTests
    ];
    
    // Generate comprehensive report
    const reportPath = await generateReport();
    
    console.log('\n🎉 Performance testing completed successfully!');
    console.log(`📊 Results saved to: ${reportPath}`);
    console.log('\n📈 Summary:');
    console.log(`   Total tests: ${testResults.summary.totalTests}`);
    console.log(`   Successful: ${testResults.summary.successfulTests}`);
    console.log(`   Average execution time: ${testResults.summary.avgExecutionTime}ms`);
    console.log(`   Overall efficiency: ${testResults.summary.overallEfficiency}%`);
    
    console.log('\n🔧 Next steps:');
    console.log('   1. Review the generated report');
    console.log('   2. Implement indexes from DATABASE_INDEXING_PLAN.md');
    console.log('   3. Re-run this script to measure improvements');
    
  } catch (error) {
    console.error('💥 Error during performance testing:', error);
    process.exit(1);
  } finally {
    // Close database connection
      await db.end();
  }
}

// Run the performance tests if this script is executed directly
if (require.main === module) {
  runPerformanceTests();
}

module.exports = {
  runPerformanceTests,
  measureQuery,
  getDatabaseInfo,
  TEST_CONFIG
}; 