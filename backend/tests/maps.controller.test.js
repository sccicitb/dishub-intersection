// UNIT TEST untuk controller maps.controller.js
// ------------------------------------------------------------

const httpMocks = require('node-mocks-http');
const mapsController = require('../app/controllers/maps.controller');
const mapsModel = require('../app/models/maps.model');

jest.mock('../app/models/maps.model');

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

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
      }
    ];

    mapsModel.getBuildings.mockResolvedValue(dummyData);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await mapsController.fetchBuildings(req, res);

    expect(res.statusCode).toBe(200);
    const result = res._getJSONData();
    expect(result.buildings.length).toBe(1);
    expect(result.buildings[0].camera.id).toBe('detection2');
  });

  it('should handle error in fetchBuildings', async () => {
    mapsModel.getBuildings.mockRejectedValue(new Error('DB error'));

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await mapsController.fetchBuildings(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toHaveProperty('error', 'Internal server error');
  });
});

describe('Unit Test: getCameraById controller', () => {
  it('should return 200 and camera data if found', async () => {
    const dummyCamera = {
      id: 1,
      name: 'Camera 1',
      category: 'timur',
      status: 1,
      latitude: -7.7,
      longitude: 110.4,
      socket_event: 'result_detection'
    };

    mapsModel.getCameraById.mockResolvedValue(dummyCamera);

    const req = httpMocks.createRequest({ params: { id: 1 } });
    const res = httpMocks.createResponse();

    await mapsController.getCameraById(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().camera.id).toBe('detection1');
  });

  it('should return 404 if camera not found', async () => {
    mapsModel.getCameraById.mockResolvedValue(undefined);

    const req = httpMocks.createRequest({ params: { id: 999 } });
    const res = httpMocks.createResponse();

    await mapsController.getCameraById(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toBe('Camera not found');
  });

  it('should handle error in getCameraById', async () => {
    mapsModel.getCameraById.mockRejectedValue(new Error('Error'));

    const req = httpMocks.createRequest({ params: { id: 1 } });
    const res = httpMocks.createResponse();

    await mapsController.getCameraById(req, res);

    expect(res.statusCode).toBe(500);
  });
});

describe('Unit Test: deleteCameraById controller', () => {
  it('should return 200 when camera deleted', async () => {
    mapsModel.deleteCameraById.mockResolvedValue({ affectedRows: 1 });

    const req = httpMocks.createRequest({ params: { id: 1 } });
    const res = httpMocks.createResponse();

    await mapsController.deleteCameraById(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().message).toBe('Camera deleted successfully');
  });

  it('should return 404 when camera not found', async () => {
    mapsModel.deleteCameraById.mockResolvedValue({ affectedRows: 0 });

    const req = httpMocks.createRequest({ params: { id: 999 } });
    const res = httpMocks.createResponse();

    await mapsController.deleteCameraById(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toBe('Camera not found');
  });

  it('should handle error in deleteCameraById', async () => {
    mapsModel.deleteCameraById.mockRejectedValue(new Error('Error'));

    const req = httpMocks.createRequest({ params: { id: 1 } });
    const res = httpMocks.createResponse();

    await mapsController.deleteCameraById(req, res);

    expect(res.statusCode).toBe(500);
  });
});

describe('Unit Test: createCamera controller', () => {
  it('should return 201 and new camera ID', async () => {
    mapsModel.createCamera.mockResolvedValue(5);

    const req = httpMocks.createRequest({
      body: {
        name: 'Simpang ABC',
        category: 'barat',
        model_detection: true,
        location: { latitude: -7.7, longitude: 110.4 },
        camera: { title: 'Cam ABC', socketEvent: 'result_detection_5' }
      }
    });
    const res = httpMocks.createResponse();

    await mapsController.createCamera(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData().camera_id).toBe('detection5');
  });

  it('should handle error in createCamera', async () => {
    mapsModel.createCamera.mockRejectedValue(new Error('Failed'));

    const req = httpMocks.createRequest({
      body: {
        name: 'X',
        category: 'Y',
        model_detection: true,
        location: { latitude: 0, longitude: 0 },
        camera: { title: 'X', socketEvent: 'Z' }
      }
    });
    const res = httpMocks.createResponse();

    await mapsController.createCamera(req, res);

    expect(res.statusCode).toBe(500);
  });
});

describe('Unit Test: updateCamera controller', () => {
  it('should return 200 when camera updated', async () => {
    mapsModel.updateCamera.mockResolvedValue({ affectedRows: 1 });

    const req = httpMocks.createRequest({
      params: { id: 3 },
      body: {
        name: 'Simpang ABC',
        category: 'barat',
        model_detection: true,
        location: { latitude: -7.7, longitude: 110.4 },
        camera: { title: 'Cam Update', socketEvent: 'result_detection_update' }
      }
    });
    const res = httpMocks.createResponse();

    await mapsController.updateCamera(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().message).toBe('Camera updated successfully');
  });

  it('should return 404 if camera not found', async () => {
    mapsModel.updateCamera.mockResolvedValue({ affectedRows: 0 });

    const req = httpMocks.createRequest({
      params: { id: 999 },
      body: {
        name: 'Invalid',
        category: 'utara',
        model_detection: false,
        location: { latitude: 0, longitude: 0 },
        camera: { title: 'Cam Not Found', socketEvent: 'none' }
      }
    });
    const res = httpMocks.createResponse();

    await mapsController.updateCamera(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toBe('Camera not found');
  });

  it('should handle error in updateCamera', async () => {
    mapsModel.updateCamera.mockRejectedValue(new Error('Update error'));

    const req = httpMocks.createRequest({
      params: { id: 10 },
      body: {
        name: 'X',
        category: 'Y',
        model_detection: false,
        location: { latitude: 0, longitude: 0 },
        camera: { title: 'X', socketEvent: 'Z' }
      }
    });
    const res = httpMocks.createResponse();

    await mapsController.updateCamera(req, res);

    expect(res.statusCode).toBe(500);
  });
});
