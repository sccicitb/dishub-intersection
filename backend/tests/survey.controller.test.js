const fs = require('fs');
const path = require('path');
const surveyController = require('../app/controllers/survey.controller');
const surveyModel = require('../app/models/survey.model');

// Mock model dan fs agar tidak benar-benar query db/file system
jest.mock('../app/models/survey.model');
jest.mock('fs');

jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Controller: getHourlySummary', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return vehicle data JSON with correct classification subCodes', async () => {
    const req = {
      query: {
        camera_id: '1',
        approach: 'utara',
        direction: 'lurus',
        classification: 'luar_kota'
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    // Mock classification.json
    const mockClassJson = JSON.stringify([
      { type: 'luar_kota', subCode: 'SM' },
      { type: 'luar_kota', subCode: 'MP' },
      { type: 'dalam_kota', subCode: 'XX' }
    ]);
    fs.readFileSync.mockReturnValueOnce(mockClassJson);

    const mockData = { vehicleData: [{ period: 'Pagi', timeSlots: [] }] };
    surveyModel.getVehicleDataGrouped.mockResolvedValueOnce(mockData);

    await surveyController.getHourlySummary(req, res);

    expect(fs.readFileSync).toHaveBeenCalled();
    expect(surveyModel.getVehicleDataGrouped).toHaveBeenCalledWith(
      {
        cameraId: '1',
        approach: 'utara',
        direction: 'lurus',
        classificationType: 'luar_kota'
      },
      ['SM', 'MP']
    );
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  it('should default classificationType if not provided', async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    fs.readFileSync.mockReturnValueOnce(JSON.stringify([
      { type: 'luar_kota', subCode: 'SM' }
    ]));

    const mockData = { vehicleData: [] };
    surveyModel.getVehicleDataGrouped.mockResolvedValueOnce(mockData);

    await surveyController.getHourlySummary(req, res);

    expect(surveyModel.getVehicleDataGrouped).toHaveBeenCalledWith(
      { cameraId: undefined, approach: undefined, direction: undefined, classificationType: 'luar_kota' },
      ['SM']
    );
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  it('should handle errors gracefully and return 500', async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    fs.readFileSync.mockImplementationOnce(() => { throw new Error('File error'); });
    await surveyController.getHourlySummary(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch vehicle data' });
  });

  it('should pass date param to model', async () => {
    const req = {
      query: { date: '2025-05-28' }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    // Mock classification.json agar tidak error
    fs.readFileSync.mockReturnValueOnce(JSON.stringify([
      { type: 'luar_kota', subCode: 'SM' }
    ]));

    const mockData = { vehicleData: [] };
    surveyModel.getVehicleDataGrouped.mockResolvedValueOnce(mockData);

    await surveyController.getHourlySummary(req, res);
    expect(surveyModel.getVehicleDataGrouped).toHaveBeenCalledWith(
      expect.objectContaining({ date: '2025-05-28' }),
      expect.any(Array)
    );
  });
});
