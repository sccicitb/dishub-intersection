const httpMocks = require('node-mocks-http');
const mapsController = require('../app/controllers/maps.controller');
const mapsModel = require('../app/models/maps.model');
jest.mock('../app/models/maps.model');
jest.spyOn(console, 'error').mockImplementation(() => {});
describe('maps.controller.js', () => {
  afterEach(() => jest.clearAllMocks());

  it('fetchBuildingsRaw returns formatted buildings', async () => {
    const dummyData = [
      { id: 2, name: 'Simpang Prambanan', latitude: -7.75, longitude: 110.48, kategori: 'timur' }
    ];
    mapsModel.getBuildingsRaw.mockResolvedValue(dummyData);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    await mapsController.fetchBuildingsRaw(req, res);

    expect(res.statusCode).toBe(200);
    const result = res._getJSONData();
    expect(result.buildings[0]).toMatchObject({
      id: 2,
      name: 'Simpang Prambanan',
      location: { latitude: -7.75, longitude: 110.48 },
      model_detection: true,
      category: 'timur'
    });
  });

  it('fetchAllCamerasRaw returns cameras', async () => {
    const dummyCameras = [
      { camera_id: 1, id: 'detection1', location_id: 2, title: 'Camera 1', socketEvent: 'result_detection_2' }
    ];
    mapsModel.getAllCamerasRaw.mockResolvedValue(dummyCameras);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    await mapsController.fetchAllCamerasRaw(req, res);

    expect(res.statusCode).toBe(200);
    const result = res._getJSONData();
    expect(result[0].id).toBe('detection1');
    expect(result[0].location_id).toBe(2);
  });

  it('fetchBuildingsWithCameras returns buildings with nested cameras', async () => {
    const mockBuildings = [
      { id: 2, name: 'Simpang Prambanan', latitude: -7.75, longitude: 110.48, kategori: 'timur' }
    ];
    const mockCameras = [
      { camera_id: 1, location_id: 2, title: 'Camera 1', socketEvent: 'result_detection_2' }
    ];
    mapsModel.getBuildingsWithCameras.mockResolvedValue({ buildings: mockBuildings, cameras: mockCameras });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    await mapsController.fetchBuildingsWithCameras(req, res);

    expect(res.statusCode).toBe(200);
    const result = res._getJSONData();
    expect(result.buildings[0].cameras).toBeDefined();
    expect(result.buildings[0].cameras[0].id).toBe('detection1');
    expect(result.buildings[0].cameras[0].location_id).toBe(2);
  });

  it('should handle error in fetchBuildingsRaw', async () => {
    mapsModel.getBuildingsRaw.mockRejectedValue(new Error('DB error'));
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await mapsController.fetchBuildingsRaw(req, res);
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toHaveProperty('error', 'Internal server error');
  });

  it('should handle error in fetchAllCamerasRaw', async () => {
    mapsModel.getAllCamerasRaw.mockRejectedValue(new Error('DB error'));
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await mapsController.fetchAllCamerasRaw(req, res);
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toHaveProperty('error', 'Internal server error');
  });

  it('should handle error in fetchBuildingsWithCameras', async () => {
    mapsModel.getBuildingsWithCameras.mockRejectedValue(new Error('DB error'));
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await mapsController.fetchBuildingsWithCameras(req, res);
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toHaveProperty('error', 'Internal server error');
  });
});
