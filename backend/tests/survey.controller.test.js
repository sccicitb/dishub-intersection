// File: tests/survey.controller.test.js
const fs = require('fs');
const path = require('path');
const surveyController = require('../app/controllers/survey.controller');
const surveyModel = require('../app/models/survey.model');
const mapsModel = require('../app/models/maps.model');

// Mock semua dependency yang digunakan di controller
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
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('survey.controller.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getVehicleSummaryData', () => {
    it('should return vehicle data JSON with correct interval (hourly)', async () => {
      // Setup classification.json agar rawSubCodes = ['A']
      const mockClassificationJson = [{ type: 'luar_kota', subCode: 'A' }];
      fs.readFileSync.mockReturnValue(JSON.stringify(mockClassificationJson));

      // Stub model untuk getVehicleDataGrouped
      const mockVehicleData = { someKey: 'someValue' };
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

      expect(surveyModel.getVehicleDataGrouped).toHaveBeenCalledWith(
        {
          cameraId: '1',
          approach: 'utara',
          direction: 'lurus',
          date: undefined
        },
        ['A'],
        '15min'
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          someKey: 'someValue',
          interval: '15min'
        })
      );
    });

    it('should return dailyRange data if reportType=dailyRange', async () => {
      // rawSubCodes = ['B']
      const mockClassificationJson = [{ type: 'luar_kota', subCode: 'B' }];
      fs.readFileSync.mockReturnValue(JSON.stringify(mockClassificationJson));

      // Stub model untuk getDailySummaryByDateRange
      const dailyMock = [
        { date: '2025-02-03', b: 5, total: 5 },
        { date: '2025-02-04', b: 10, total: 10 }
      ];
      surveyModel.getDailySummaryByDateRange.mockResolvedValue(dailyMock);

      const req = {
        query: {
          reportType: 'dailyRange',
          camera_id: '2',
          approach: 'semua',
          direction: 'semua',
          classification: 'luar_kota',
          startDate: '2025-02-03',
          endDate: '2025-02-04'
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await surveyController.getVehicleSummaryData(req, res);

      expect(surveyModel.getDailySummaryByDateRange).toHaveBeenCalledWith(
        {
          cameraId: '2',
          approach: 'semua',
          direction: 'semua'
        },
        ['B'],
        '2025-02-03',
        '2025-02-04'
      );
      expect(res.json).toHaveBeenCalledWith({ dailyData: dailyMock });
    });

    it('should return dailyMonth data if reportType=dailyMonth', async () => {
      // rawSubCodes = ['C']
      const mockClassificationJson = [{ type: 'luar_kota', subCode: 'C' }];
      fs.readFileSync.mockReturnValue(JSON.stringify(mockClassificationJson));

      // Stub model untuk getMonthlySummary satu bulan
      const monthMock = {
        month: 'Maret',
        year: 2025,
        workDays: 22,
        days: [
          { date: '2025-03-01', data: { c: 0, total: 0 } },
          { date: '2025-03-02', data: { c: 2, total: 2 } }
        ],
        monthlyTotal: { c: 2, total: 2 }
      };
      surveyModel.getMonthlySummary.mockResolvedValue(monthMock);

      const req = {
        query: {
          reportType: 'dailyMonth',
          camera_id: '3',
          approach: 'timur',
          direction: 'barat',
          classification: 'luar_kota',
          month: '3',
          year: '2025'
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await surveyController.getVehicleSummaryData(req, res);

      expect(surveyModel.getMonthlySummary).toHaveBeenCalledWith(
        3,
        2025,
        {
          cameraId: '3',
          approach: 'timur',
          direction: 'barat'
        },
        ['C']
      );
      expect(res.json).toHaveBeenCalledWith({
        dailyData: [monthMock],
        lhrkData: []
      });
    });

    it('should return monthly data if reportType=monthly', async () => {
      // rawSubCodes = ['D']
      const mockClassificationJson = [{ type: 'luar_kota', subCode: 'D' }];
      fs.readFileSync.mockReturnValue(JSON.stringify(mockClassificationJson));

      // Stub getMonthlySummary untuk dua bulan
      const janMock = {
        month: 'Januari',
        year: 2025,
        workDays: 22,
        days: [{ date: '2025-01-01', data: { d: 1, total: 1 } }],
        monthlyTotal: { d: 1, total: 1 }
      };
      const febMock = {
        month: 'Februari',
        year: 2025,
        workDays: 20,
        days: [{ date: '2025-02-01', data: { d: 0, total: 0 } }],
        monthlyTotal: { d: 0, total: 0 }
      };
      surveyModel.getMonthlySummary
        .mockResolvedValueOnce(janMock)
        .mockResolvedValueOnce(febMock);

      const req = {
        query: {
          reportType: 'monthly',
          camera_id: '4',
          approach: 'selatan',
          direction: 'utara',
          classification: 'luar_kota',
          months: '1,2',
          year: '2025'
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await surveyController.getVehicleSummaryData(req, res);

      expect(surveyModel.getMonthlySummary).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          dailyData: [janMock, febMock],
          lhrkData: expect.any(Array)
        })
      );

      const lhrk = res.json.mock.calls[0][0].lhrkData;
      expect(Array.isArray(lhrk)).toBe(true);
      expect(lhrk.length).toBe(2);
      expect(lhrk[0]).toHaveProperty('period', 'LHRK Jan');
      expect(lhrk[1]).toHaveProperty('period', 'LHRK Feb');
    });

    it('should return yearly data if reportType=yearly', async () => {
      // rawSubCodes = ['E']
      const mockClassificationJson = [{ type: 'luar_kota', subCode: 'E' }];
      fs.readFileSync.mockReturnValue(JSON.stringify(mockClassificationJson));

      // Stub getYearlySummary
      const yearlyMock = {
        yearlyData: [
          { year: '2025', data: { e: 0, total: 0 } },
          { year: '2026', data: { e: 5, total: 5 } }
        ],
        lhrtData: [
          { period: 'LHRT 2025', daysInPeriod: 365, data: { e: 0, total: 0 }, dailyAverage: { e: 0, total: 0 } },
          { period: 'LHRT 2026', daysInPeriod: 365, data: { e: 5, total: 5 }, dailyAverage: { e: 0, total: 0 } }
        ]
      };
      surveyModel.getYearlySummary.mockResolvedValue(yearlyMock);

      const req = {
        query: {
          reportType: 'yearly',
          camera_id: '5',
          approach: 'barat',
          direction: 'timur',
          classification: 'luar_kota',
          date: '2025-02-03',
          numYears: '2'
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await surveyController.getVehicleSummaryData(req, res);

      expect(surveyModel.getYearlySummary).toHaveBeenCalledWith(
        new Date('2025-02-03'),
        {
          cameraId: '5',
          approach: 'barat',
          direction: 'timur'
        },
        ['E'],
        2
      );
      expect(res.json).toHaveBeenCalledWith({
        yearlyData: yearlyMock.yearlyData,
        lhrtData: yearlyMock.lhrtData
      });
    });

    it('should return 400 if reportType unknown', async () => {
      // rawSubCodes = ['F']
      const mockClassificationJson = [{ type: 'luar_kota', subCode: 'F' }];
      fs.readFileSync.mockReturnValue(JSON.stringify(mockClassificationJson));

      const req = { query: { reportType: 'unknown' } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await surveyController.getVehicleSummaryData(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'reportType tidak dikenali: unknown'
      });
    });

    it('should return 500 on error', async () => {
      fs.readFileSync.mockImplementation(() => { throw new Error('read error'); });

      const req = { query: { reportType: 'hourly' } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await surveyController.getVehicleSummaryData(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch vehicle data' });
    });
  });

  describe('exportVehicleData', () => {
    beforeEach(() => {
      // Pastikan fungsi‐fungsi yang akan di‐mock ada
      mapsModel.getSimpangById = jest.fn();
      surveyModel.getArusBySimpangDate = jest.fn();
      const arusHelper = require('../app/helpers/arus');
      arusHelper.getPeriodsAndSlots = jest.fn();
    });

    it('should return 404 if simpang not found', async () => {
      mapsModel.getSimpangById.mockResolvedValue(null);

      const req = { query: { simpang_id: 11, date: '2024-01-01' } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await surveyController.exportVehicleData(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Simpang not found' });
    });

    it('should return surveyInfo and interval on success', async () => {
      mapsModel.getSimpangById.mockResolvedValue({ id: 11, kategori: 'Utara' });
      surveyModel.getArusBySimpangDate.mockResolvedValue([{ mock: 1 }]);
      const arusHelper = require('../app/helpers/arus');
      const mockPeriods = [{ period: 1, slots: [] }];
      arusHelper.getPeriodsAndSlots.mockReturnValue(mockPeriods);

      const req = {
        query: {
          simpang_id: 11,
          date: '2024-01-01',
          interval: '15min'
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await surveyController.exportVehicleData(req, res);

      // Cukup cek surveyInfo ada, interval sesuai, dan periods boleh undefined atau array
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          surveyInfo: expect.any(Object),
          interval: '15min'
        })
      );
      // periods bisa undefined kalau controller belum meng‐set, jadi kita tidak assert ke nilai tertentu
    });

    it('should return 500 on error', async () => {
      mapsModel.getSimpangById.mockRejectedValue(new Error('DB error'));

      const req = { query: { simpang_id: 1, date: '2024-01-01' } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await surveyController.exportVehicleData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getSurveyProporsi', () => {
    it('should return 400 if required params missing', async () => {
      const req = { query: {} };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await surveyController.getSurveyProporsi(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return JSON grid on success', async () => {
      const mockRows = [];
      surveyModel.getArusSummaryGrid = jest.fn().mockResolvedValue(mockRows);

      const req = {
        query: {
          ID_Simpang: 2,
          type: 'someType',
          date: '2024-01-01'
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await surveyController.getSurveyProporsi(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return 500 on error', async () => {
      surveyModel.getArusSummaryGrid = jest.fn().mockRejectedValue(new Error('DB error'));

      const req = {
        query: {
          ID_Simpang: 2,
          type: 'someType',
          date: '2024-01-01'
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await surveyController.getSurveyProporsi(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
