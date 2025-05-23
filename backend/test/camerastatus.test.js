const httpMocks = require('node-mocks-http');
const controller = require('../app/controllers/cameraStatus.controller');
const db = require('../app/config/db');

// Mock DB
jest.mock('../app/config/db');

describe('Camera Status Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('POST /status-log → should insert log and update camera', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { camera_id: 1, status: 1 }
    });
    const res = httpMocks.createResponse();

    // mock insert & update
    db.execute
      .mockResolvedValueOnce([{ insertId: 123 }]) // insert log
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // update camera

    await controller.createCameraStatusLog(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(201);
    expect(data.message).toBe('Status log saved and camera status updated');
    expect(data.data.status).toBe(1);
  });

  test('POST /status-log → should return 400 if params missing', async () => {
    const req = httpMocks.createRequest({ method: 'POST', body: {} });
    const res = httpMocks.createResponse();

    await controller.createCameraStatusLog(req, res);
    expect(res.statusCode).toBe(400);
  });

  test('GET /status-latest → should return latest status list', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    db.execute.mockResolvedValueOnce([
      [
        { camera_id: 1, status: 1, recorded_at: new Date('2025-05-22T13:00:00Z') }
      ]
    ]);

    await controller.getLatestCameraStatus(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('camera_id');
    expect(data[0]).toHaveProperty('status');
    expect(data[0]).toHaveProperty('last_updated');
  });

  test('GET /down-today → should return list of camera_id', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    db.execute.mockResolvedValueOnce([[{ camera_id: 2 }]]);
    await controller.getCamerasDownToday(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data.down).toEqual([2]);
  });

  test('GET /status-log/:id → should return status logs', async () => {
    const req = httpMocks.createRequest({ params: { id: 3 } });
    const res = httpMocks.createResponse();

    db.execute.mockResolvedValueOnce([
      [
        { id: 1, status: 1, recorded_at: new Date() }
      ]
    ]);

    await controller.getCameraStatusLogs(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.camera_id).toBe(3);
    expect(Array.isArray(data.logs)).toBe(true);
  });

  test('POST /status-log → should return 500 if db error', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { camera_id: 1, status: 1 }
    });
    const res = httpMocks.createResponse();

    db.execute.mockRejectedValue(new Error('DB Error'));

    await controller.createCameraStatusLog(req, res);
    expect(res.statusCode).toBe(500);
  });

  test('GET /status-latest → should return 500 if db error', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    db.execute.mockRejectedValue(new Error('DB Error'));
    await controller.getLatestCameraStatus(req, res);
    expect(res.statusCode).toBe(500);
  });

  test('GET /down-today → should return 500 if db error', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    db.execute.mockRejectedValue(new Error('DB Error'));
    await controller.getCamerasDownToday(req, res);
    expect(res.statusCode).toBe(500);
  });

  test('GET /status-log/:id → should return 500 if db error', async () => {
    const req = httpMocks.createRequest({ params: { id: 3 } });
    const res = httpMocks.createResponse();

    db.execute.mockRejectedValue(new Error('DB Error'));
    await controller.getCameraStatusLogs(req, res);
    expect(res.statusCode).toBe(500);
  });

});
