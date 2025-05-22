// INTEGRATION TEST via Supertest untuk endpoint GET /api/maps/buildings
// ---------------------------------------------------------------------
// Fokus: menguji apakah route Express berjalan dan return JSON sesuai
// Ini men-trigger route asli di Express
// ---------------------------------------------------------------------

const request = require('supertest');
const app = require('../server'); // atau '../app' kalau kamu split

describe('Integration Test: GET /api/maps/buildings', () => {

  it('should return 200 and buildings array', async () => {
    const response = await request(app).get('/api/maps/buildings');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('buildings');
    expect(Array.isArray(response.body.buildings)).toBe(true);

    if (response.body.buildings.length > 0) {
      const first = response.body.buildings[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('location');
      expect(first).toHaveProperty('model_detection');
      expect(first).toHaveProperty('category');
      expect(first).toHaveProperty('camera');
    }
  });
});
