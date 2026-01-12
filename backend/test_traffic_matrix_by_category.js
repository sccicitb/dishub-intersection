// Test untuk traffic matrix by vehicle category endpoint
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testTrafficMatrixByCategoryAPI() {
  try {
    console.log('🚀 Testing Traffic Matrix by Vehicle Category API...\n');

    // Test 1: Get matrix for specific date range
    console.log('📊 Test 1: Get traffic matrix for Jan 5-6, 2026 (simpang_id=2)');
    console.log('URL: /api/vehicles/traffic-matrix-by-category?simpang_id=2&start_date=2026-01-05&end_date=2026-01-06\n');
    
    const response1 = await axios.get(`${API_BASE_URL}/vehicles/traffic-matrix-by-category`, {
      params: {
        simpang_id: 2,
        start_date: '2026-01-05',
        end_date: '2026-01-06'
      }
    });

    console.log('✅ Response Status:', response1.status);
    console.log('📄 Response Data:');
    console.log(JSON.stringify(response1.data, null, 2));
    console.log('\n---\n');

    // Test 2: Single day
    console.log('📊 Test 2: Get traffic matrix for single day (simpang_id=2)');
    console.log('URL: /api/vehicles/traffic-matrix-by-category?simpang_id=2&start_date=2026-01-05&end_date=2026-01-05\n');
    
    const response2 = await axios.get(`${API_BASE_URL}/vehicles/traffic-matrix-by-category`, {
      params: {
        simpang_id: 2,
        start_date: '2026-01-05',
        end_date: '2026-01-05'
      }
    });

    console.log('✅ Response Status:', response2.status);
    console.log('📄 Response Data:');
    console.log(JSON.stringify(response2.data, null, 2));
    console.log('\n---\n');

    // Test 3: Different simpang
    console.log('📊 Test 3: Get traffic matrix for different simpang (simpang_id=3)');
    console.log('URL: /api/vehicles/traffic-matrix-by-category?simpang_id=3&start_date=2026-01-05&end_date=2026-01-06\n');
    
    const response3 = await axios.get(`${API_BASE_URL}/vehicles/traffic-matrix-by-category`, {
      params: {
        simpang_id: 3,
        start_date: '2026-01-05',
        end_date: '2026-01-06'
      }
    });

    console.log('✅ Response Status:', response3.status);
    console.log('📄 Response Data:');
    console.log(JSON.stringify(response3.data, null, 2));
    console.log('\n---\n');

    // Test 4: Error - Missing simpang_id
    console.log('❌ Test 4: Error test - Missing simpang_id');
    try {
      await axios.get(`${API_BASE_URL}/vehicles/traffic-matrix-by-category`, {
        params: {
          start_date: '2026-01-05',
          end_date: '2026-01-06'
        }
      });
    } catch (error) {
      console.log('✅ Expected Error:', error.response?.data?.message);
    }
    console.log('\n---\n');

    // Test 5: Error - Invalid date format
    console.log('❌ Test 5: Error test - Invalid date format');
    try {
      await axios.get(`${API_BASE_URL}/vehicles/traffic-matrix-by-category`, {
        params: {
          simpang_id: 2,
          start_date: '05-01-2026',
          end_date: '2026-01-06'
        }
      });
    } catch (error) {
      console.log('✅ Expected Error:', error.response?.data?.message);
    }
    console.log('\n---\n');

    // Test 6: Error - start_date after end_date
    console.log('❌ Test 6: Error test - start_date after end_date');
    try {
      await axios.get(`${API_BASE_URL}/vehicles/traffic-matrix-by-category`, {
        params: {
          simpang_id: 2,
          start_date: '2026-01-06',
          end_date: '2026-01-05'
        }
      });
    } catch (error) {
      console.log('✅ Expected Error:', error.response?.data?.message);
    }

    console.log('\n✨ All tests completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testTrafficMatrixByCategoryAPI();
