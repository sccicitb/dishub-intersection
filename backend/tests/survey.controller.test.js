const fs = require('fs');
const path = require('path');
const surveyController = require('../app/controllers/survey.controller');
const surveyModel = require('../app/models/survey.model');
const mapsModel = require('../app/models/maps.model');
const arusHelper = require('../app/helpers/arus');

// Mock model dan helper agar tidak benar-benar query db/file system
jest.mock('../app/models/survey.model');
jest.mock('../app/models/maps.model');
jest.mock('../app/helpers/arus');
jest.mock('fs');

jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Controller: getVehicleSummaryData', () => {
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

    await surveyController.getVehicleSummaryData(req, res);

    expect(fs.readFileSync).toHaveBeenCalled();
    expect(surveyModel.getVehicleDataGrouped).toHaveBeenCalledWith(
      {
        cameraId: '1',
        approach: 'utara',
        direction: 'lurus',
        classificationType: 'luar_kota',
        date: undefined
      },
      ['SM', 'MP'],
      '15min'
    );
    expect(res.json).toHaveBeenCalledWith({ ...mockData, interval: '15min' });
  });

  it('should default classificationType if not provided', async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    fs.readFileSync.mockReturnValueOnce(JSON.stringify([
      { type: 'luar_kota', subCode: 'SM' }
    ]));

    const mockData = { vehicleData: [] };
    surveyModel.getVehicleDataGrouped.mockResolvedValueOnce(mockData);

    await surveyController.getVehicleSummaryData(req, res);

    expect(surveyModel.getVehicleDataGrouped).toHaveBeenCalledWith(
      { cameraId: undefined, approach: undefined, direction: undefined, classificationType: 'luar_kota', date: undefined },
      ['SM'],
      '15min'
    );
    expect(res.json).toHaveBeenCalledWith({ ...mockData, interval: '15min' });
  });

  it('should handle errors gracefully and return 500', async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    fs.readFileSync.mockImplementationOnce(() => { throw new Error('File error'); });
    await surveyController.getVehicleSummaryData(req, res);

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

    fs.readFileSync.mockReturnValueOnce(JSON.stringify([
      { type: 'luar_kota', subCode: 'SM' }
    ]));

    const mockData = { vehicleData: [] };
    surveyModel.getVehicleDataGrouped.mockResolvedValueOnce(mockData);

    await surveyController.getVehicleSummaryData(req, res);
    expect(surveyModel.getVehicleDataGrouped).toHaveBeenCalledWith(
      expect.objectContaining({ date: '2025-05-28', classificationType: 'luar_kota' }),
      expect.any(Array),
      '15min'
    );
  });

  it('should call model with interval param if specified', async () => {
    const req = {
      query: {
        camera_id: '1',
        date: '2025-05-28',
        interval: '1h'
      }
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    fs.readFileSync.mockReturnValueOnce(JSON.stringify([{ type: 'luar_kota', subCode: 'SM' }]));
    const mockData = { vehicleData: [] };
    surveyModel.getVehicleDataGrouped.mockResolvedValueOnce(mockData);

    await surveyController.getVehicleSummaryData(req, res);

    expect(surveyModel.getVehicleDataGrouped).toHaveBeenCalledWith(
      expect.objectContaining({ cameraId: '1', date: '2025-05-28', classificationType: 'luar_kota' }),
      ['SM'],
      '1h'
    );
    expect(res.json).toHaveBeenCalledWith({ ...mockData, interval: '1h' });
  });
});

// Untuk exportVehicleData jika ingin test interval:
describe('Controller: exportVehicleData', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return JSON with correct surveyInfo and periods', async () => {
    const req = {
      query: {
        simpang_id: '1',
        date: '2023-05-12'
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    mapsModel.getSimpangById.mockResolvedValue({
      id: 1,
      kategori: 'Utara'
    });

    surveyModel.getArusBySimpangDate.mockResolvedValue([]);
    arusHelper.getPeriodsAndSlots.mockReturnValue([
      {
        name: 'Pagi',
        timeSlots: [
          {
            time: '06:00 - 06:15',
            status: 1,
            data: {
              sm: 10, mp: 5, aup: 1, trMp: 5, tr: 0, bs: 0, ts: 0,
              bb: 0, tb: 0, gandengSemitrailer: 0, ktb: 0, total: 16
            }
          }
        ]
      }
    ]);

    await surveyController.exportVehicleData(req, res);

    expect(mapsModel.getSimpangById).toHaveBeenCalledWith('1');
    expect(surveyModel.getArusBySimpangDate).toHaveBeenCalledWith('1', '2023-05-12');
    expect(arusHelper.getPeriodsAndSlots).toHaveBeenCalledWith([], '15min');

    expect(res.json).toHaveBeenCalledWith({
      surveyInfo: {
        simpangCode: 1,
        direction: 'Utara',
        surveyor: 'VIANA',
        date: '2023-05-12'
      },
      periods: [
        {
          name: 'Pagi',
          timeSlots: [
            {
              time: '06:00 - 06:15',
              status: 1,
              data: {
                sm: 10, mp: 5, aup: 1, trMp: 5, tr: 0, bs: 0, ts: 0,
                bb: 0, tb: 0, gandengSemitrailer: 0, ktb: 0, total: 16
              }
            }
          ]
        }
      ],
      interval: '15min'
    });
  });

  it('should return 400 if missing params', async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await surveyController.exportVehicleData(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'simpang_id and date required' });
  });

  it('should return 404 if simpang not found', async () => {
    const req = { query: { simpang_id: '999', date: '2023-05-12' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    mapsModel.getSimpangById.mockResolvedValue(null);

    await surveyController.exportVehicleData(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Simpang not found' });
  });

  it('should return 500 on unexpected error', async () => {
    const req = { query: { simpang_id: '1', date: '2023-05-12' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    mapsModel.getSimpangById.mockRejectedValue(new Error('DB error'));

    await surveyController.exportVehicleData(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('should pass interval param to helper for export', async () => {
    const req = {
      query: {
        simpang_id: '1',
        date: '2023-05-12',
        interval: '1h'
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    mapsModel.getSimpangById.mockResolvedValue({ id: 1, kategori: 'Utara' });
    surveyModel.getArusBySimpangDate.mockResolvedValue([]);
    arusHelper.getPeriodsAndSlots.mockReturnValue([
      {
        name: 'Pagi',
        timeSlots: [
          { time: '06:00 - 07:00', status: 1, data: { sm: 6, mp: 5, aup: 3, total: 14 } }
        ]
      }
    ]);

    await surveyController.exportVehicleData(req, res);
    expect(arusHelper.getPeriodsAndSlots).toHaveBeenCalledWith([], '1h');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ interval: '1h' }));
  });
});
