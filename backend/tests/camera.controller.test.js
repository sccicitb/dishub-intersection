const httpMocks = require('node-mocks-http');
const cameraController = require('../app/controllers/camera.controller');
const cameraModel = require('../app/models/camera.model');
jest.mock('../app/models/camera.model');

describe('camera.controller.js', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAllCameras returns camera array', async () => {
    const mockCameras = [{ id: 1, name: 'Kamera A' }];
    cameraModel.getAllCameras.mockResolvedValue(mockCameras);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    await cameraController.getAllCameras(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().cameras).toEqual(mockCameras);
  });

  it('getCameraById returns camera', async () => {
    const cam = { id: 1, name: 'Kamera 1' };
    cameraModel.getCameraById.mockResolvedValue(cam);

    const req = httpMocks.createRequest({ params: { id: 1 } });
    const res = httpMocks.createResponse();
    await cameraController.getCameraById(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(cam);
  });

  it('createCamera returns created camera', async () => {
    cameraModel.createCamera.mockResolvedValue(5);
    cameraModel.getCameraById.mockResolvedValue({ id: 5, name: 'Kamera Baru' });

    const req = httpMocks.createRequest({
      body: {
        name: 'Kamera Baru',
        location: '-6.9,107.6',
        status: 1,
        url: '',
        thumbnail_url: '',
        resolution: '1080p',
        socket_event: 'result_detection_5',
        ID_Simpang: 2
      }
    });
    const res = httpMocks.createResponse();
    await cameraController.createCamera(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData().id).toBe(5);
  });

  it('updateCamera returns updated camera', async () => {
    cameraModel.updateCamera.mockResolvedValue({ affectedRows: 1 });
    cameraModel.getCameraById.mockResolvedValue({ id: 1, name: 'Kamera Update' });

    const req = httpMocks.createRequest({
      params: { id: 1 },
      body: {
        name: 'Kamera Update',
        location: '-6.91,107.61',
        status: 0,
        url: '',
        thumbnail_url: '',
        resolution: '1080p',
        socket_event: 'result_detection_6',
        ID_Simpang: 2
      }
    });
    const res = httpMocks.createResponse();
    await cameraController.updateCamera(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().name).toBe('Kamera Update');
  });

  it('deleteCameraById returns 200 if deleted', async () => {
    cameraModel.deleteCameraById.mockResolvedValue({ affectedRows: 1 });

    const req = httpMocks.createRequest({ params: { id: 5 } });
    const res = httpMocks.createResponse();
    await cameraController.deleteCameraById(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().message).toMatch(/deleted/);
  });
});
