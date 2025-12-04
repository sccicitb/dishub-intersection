// Test untuk traffic matrix endpoint
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const TEST_TOKEN = 'your-test-token'; // Akan diganti dengan token real

async function testTrafficMatrixAPI() {
  try {
    console.log('Testing Traffic Matrix API...\n');

    // Test 1: Get matrix for specific date
    console.log('Test 1: Get matrix for 2025-12-02');
    const response1 = await axios.get(`${API_BASE_URL}/surveys/traffic-matrix`, {
      params: {
        simpang_id: 1,
        date: '2025-12-02',
        approach: 'semua'
      },
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('Response 1:', JSON.stringify(response1.data, null, 2));
    console.log('\n---\n');

    // Test 2: Get matrix filtered by approach (Timur)
    console.log('Test 2: Get matrix filtered by approach (timur)');
    const response2 = await axios.get(`${API_BASE_URL}/surveys/traffic-matrix`, {
      params: {
        simpang_id: 1,
        date: '2025-12-02',
        approach: 'timur'
      },
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('Response 2:', JSON.stringify(response2.data, null, 2));
    console.log('\n---\n');

    // Test 3: Get matrix with Indonesian format date
    console.log('Test 3: Get matrix with slash date format');
    const response3 = await axios.get(`${API_BASE_URL}/surveys/traffic-matrix`, {
      params: {
        simpang_id: 1,
        date: '2025/12/02',
        approach: 'selatan'
      },
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('Response 3:', JSON.stringify(response3.data, null, 2));

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testTrafficMatrixAPI();
