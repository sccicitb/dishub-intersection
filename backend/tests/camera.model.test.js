const db = require('../app/config/db');
const cameraModel = require('../app/models/camera.model');

jest.mock('../app/config/db');

describe('camera.model.js', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAllCameras returns array of cameras', async () => {
    const mockRows = [{ id: 1, name: 'Kamera 1' }];
    db.query.mockResolvedValue([mockRows]);
    const result = await cameraModel.getAllCameras();
    expect(result).toEqual(mockRows);
  });

  it('getCameraById returns camera', async () => {
    const mockRows = [{ id: 1, name: 'Kamera 1' }];
    db.query.mockResolvedValue([mockRows]);
    const result = await cameraModel.getCameraById(1);
    expect(result).toEqual(mockRows[0]);
  });

  it('createCamera inserts and returns insertId', async () => {
    const mockResult = { insertId: 10 };
    const data = {
      name: 'Kamera Insert',
      url: 'http://cam-url',
      thumbnail_url: '',
      location: '-6.90,107.60',
      resolution: '1080p',
      status: 1,
      socket_event: 'result_detection_10',
      ID_Simpang: 2
    };
    db.query.mockResolvedValue([mockResult]);
    const result = await cameraModel.createCamera(data);
    expect(result).toBe(10);
  });

  it('updateCamera updates and returns affectedRows', async () => {
    const mockResult = { affectedRows: 1 };
    const data = {
      name: 'Kamera Updated',
      url: '',
      thumbnail_url: '',
      location: '-6.91,107.61',
      resolution: '1080p',
      status: 0,
      socket_event: 'result_detection_11',
      ID_Simpang: 2
    };
    db.query.mockResolvedValue([mockResult]);
    const result = await cameraModel.updateCamera(10, data);
    expect(result).toEqual(mockResult);
  });

  it('deleteCameraById deletes camera', async () => {
    const mockResult = { affectedRows: 1 };
    db.query.mockResolvedValue([mockResult]);
    const result = await cameraModel.deleteCameraById(10);
    expect(result).toEqual(mockResult);
  });
});
