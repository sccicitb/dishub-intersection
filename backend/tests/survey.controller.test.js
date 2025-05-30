const fs = require('fs');
const path = require('path');
const surveyController = require('../app/controllers/survey.controller');
const surveyModel = require('../app/models/survey.model');
const mapsModel = require('../app/models/maps.model');

// Mocks
jest.mock('fs');
jest.mock('path');
jest.mock('../app/models/survey.model');
jest.mock('../app/models/maps.model');
jest.mock('../app/helpers/subCodeMap', () => ({}));
jest.mock('../app/helpers/classificationHelper', () => ({ getSubCodes: jest.fn() }));
jest.mock('../app/helpers/arus', () => ({ getPeriodsAndSlots: jest.fn() }));
jest.mock('../app/helpers/timeHelper', () => ({ getIntervals: jest.fn() }));
jest.mock('../app/helpers/turnLogic', () => ({
  TURN_MAP: {},
  ROWS: [],
  JENIS_KENDARAAN: []
}));

describe('survey.controller.js', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getVehicleSummaryData', () => {
    it('should return vehicle data JSON with correct interval', async () => {
      // Setup: classification.json mock, fs, subCodeMap, etc.
      const mockClassificationJson = [
        { type: 'luar_kota', subCode: 'A' }
      ];
      const mockSubCodeMap = { 'A': 'AA' };
      const mockVehicleData = { test: 'ok' };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockClassificationJson));
      jest.doMock('../app/helpers/subCodeMap', () => mockSubCodeMap);

      surveyModel.getVehicleDataGrouped.mockResolvedValue(mockVehicleData);

      const req = {
        query: {
          camera_id: '1',
          approach: 'utara',
          direction: 'lurus',
          classification: 'luar_kota',
          interval: '15min'
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await surveyController.getVehicleSummaryData(req, res);
      expect(surveyModel.getVehicleDataGrouped).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        test: 'ok',
        interval: '15min'
      }));
    });

    it('should return 500 on error', async () => {
      fs.readFileSync.mockImplementation(() => { throw new Error('Failed'); });

      const req = { query: {} };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await surveyController.getVehicleSummaryData(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch vehicle data' });
    });
  });

  describe('exportVehicleData', () => {
    it('should return 400 if params missing', async () => {
      const req = { query: {} };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await surveyController.exportVehicleData(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if simpang not found', async () => {
      mapsModel.getSimpangById.mockResolvedValue(null);

      const req = { query: { simpang_id: 11, date: '2024-01-01' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await surveyController.exportVehicleData(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Simpang not found' });
    });

    it('should return surveyInfo and periods on success', async () => {
      mapsModel.getSimpangById.mockResolvedValue({ id: 11, kategori: 'Utara' });
      surveyModel.getArusBySimpangDate.mockResolvedValue([{ mock: 1 }]);
      const mockPeriods = [{ period: 1, slots: [] }];
      const mockGetPeriodsAndSlots = require('../app/helpers/arus').getPeriodsAndSlots;
      mockGetPeriodsAndSlots.mockReturnValue(mockPeriods);

      const req = { query: { simpang_id: 11, date: '2024-01-01', interval: '15min' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await surveyController.exportVehicleData(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        surveyInfo: expect.any(Object),
        periods: mockPeriods,
        interval: '15min'
      }));
    });

    it('should return 500 on error', async () => {
      mapsModel.getSimpangById.mockRejectedValue(new Error('DB error'));
      const req = { query: { simpang_id: 1, date: '2024-01-01' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await surveyController.exportVehicleData(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe('getSurveyProporsi', () => {
    it('should return 400 if required params missing', async () => {
      const req = { query: {} };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await surveyController.getSurveyProporsi(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return JSON grid', async () => {
      const rows = [];
      surveyModel.getArusSummaryGrid.mockResolvedValue(rows);

      const req = { query: { ID_Simpang: 2, type: 'someType', date: '2024-01-01' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await surveyController.getSurveyProporsi(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return 500 on error', async () => {
      surveyModel.getArusSummaryGrid.mockRejectedValue(new Error('DB error'));
      const req = { query: { ID_Simpang: 2, type: 'someType', date: '2024-01-01' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await surveyController.getSurveyProporsi(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
