// UNIT TEST untuk controller maps.controller.js
// ------------------------------------------------------------
// Fokus: fungsi fetchBuildings() mengubah data SQL menjadi JSON yang benar
// Tanpa mengakses server atau router
// ------------------------------------------------------------

const httpMocks = require('node-mocks-http');
const mapsController = require('../app/controllers/maps.controller');
const mapsModel = require('../app/models/maps.model');

// Mock model function
jest.mock('../app/models/maps.model');

describe('Unit Test: fetchBuildings controller', () => {
  it('should return formatted buildings JSON', async () => {
    const dummyData = [
      {
        id: 1,
        name: 'Prambanan',
        latitude: -7.75539,
        longitude: 110.48903,
        kategori: 'timur',
        camera_id: 2,
        camera_name: 'Kamera Depan',
        socket_event: 'result_detection_2'
      },
      {
        id: 2,
        name: 'Demen Glagah',
        latitude: -7.888059,
        longitude: 110.092591,
        kategori: 'barat',
        camera_id: null,
        camera_name: null,
        socket_event: null
      }
    ];

    mapsModel.getBuildings.mockResolvedValue(dummyData);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await mapsController.fetchBuildings(req, res);

    const result = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(result).toHaveProperty('buildings');
    expect(result.buildings.length).toBe(2);
    expect(result.buildings[0]).toHaveProperty('camera');
    expect(result.buildings[1].camera).toBeNull();
    expect(result.buildings[0].model_detection).toBe(true);
    expect(result.buildings[1].model_detection).toBe(false);
  });
});
