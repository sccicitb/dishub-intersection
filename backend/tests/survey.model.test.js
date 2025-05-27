// File : survey.model.test.js
const surveyModel = require('../app/models/survey.model');
const db = require('../app/config/db');
const arusHelper = require('../app/helpers/arus');

jest.mock('../app/config/db');
jest.mock('../app/helpers/arus');

describe('Unit Test: getVehicleDataGrouped with interval', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should group vehicle data per 15min slot by default', async () => {
    db.query.mockResolvedValueOnce([
      [
        { waktu: '2025-05-26T06:00:00', SM: 5, MP: 3, AUP: 2 },
        { waktu: '2025-05-26T06:15:00', SM: 6, MP: 4, AUP: 1 }
      ]
    ]);
    arusHelper.getPeriodsAndSlots.mockReturnValue([
      {
        name: 'Pagi',
        timeSlots: [
          { time: '06:00 - 06:15', status: 1, data: { sm: 5, mp: 3, aup: 2, total: 10 } },
          { time: '06:15 - 06:30', status: 1, data: { sm: 6, mp: 4, aup: 1, total: 11 } }
        ]
      }
    ]);

    const filters = { cameraId: null, approach: null, direction: null, date: '2025-05-26' };
    const includedSubCodes = ['SM', 'MP', 'AUP'];
    const result = await surveyModel.getVehicleDataGrouped(filters, includedSubCodes);
    expect(arusHelper.getPeriodsAndSlots).toHaveBeenCalledWith(expect.any(Array), '15min');
    expect(result.vehicleData[0].timeSlots[0].time).toBe('06:00 - 06:15');
    expect(result.vehicleData[0].timeSlots[1].time).toBe('06:15 - 06:30');
  });

  it('should group vehicle data per 1h slot when interval=1h', async () => {
    db.query.mockResolvedValueOnce([
      [
        { waktu: '2025-05-26T06:01:00', SM: 2, MP: 2, AUP: 1 },
        { waktu: '2025-05-26T06:55:00', SM: 4, MP: 3, AUP: 2 }
      ]
    ]);
    arusHelper.getPeriodsAndSlots.mockReturnValue([
      {
        name: 'Pagi',
        timeSlots: [
          { time: '06:00 - 07:00', status: 1, data: { sm: 6, mp: 5, aup: 3, total: 14 } }
        ]
      }
    ]);
    const filters = { cameraId: 1, approach: 'utara', direction: 'lurus', date: '2025-05-26' };
    const includedSubCodes = ['SM', 'MP', 'AUP'];
    const result = await surveyModel.getVehicleDataGrouped(filters, includedSubCodes, '1h');
    expect(arusHelper.getPeriodsAndSlots).toHaveBeenCalledWith(expect.any(Array), '1h');
    expect(result.vehicleData[0].timeSlots[0].time).toBe('06:00 - 07:00');
    expect(result.vehicleData[0].timeSlots[0].data.sm).toBe(6);
    expect(result.vehicleData[0].timeSlots[0].data.total).toBe(14);
  });

  it('should fallback to 15min if interval is missing/unknown', async () => {
    db.query.mockResolvedValueOnce([[]]);
    arusHelper.getPeriodsAndSlots.mockReturnValue([]);

    const result = await surveyModel.getVehicleDataGrouped({}, ['SM', 'MP', 'AUP']);
    expect(arusHelper.getPeriodsAndSlots).toHaveBeenCalledWith(expect.any(Array), '15min');
    expect(result).toEqual({ vehicleData: [] });
  });

  it('should pass custom interval to helper if given as 60min', async () => {
    db.query.mockResolvedValueOnce([[]]);
    arusHelper.getPeriodsAndSlots.mockReturnValue([]);

    await surveyModel.getVehicleDataGrouped({}, ['SM', 'MP'], '60min');
    expect(arusHelper.getPeriodsAndSlots).toHaveBeenCalledWith(expect.any(Array), '60min');
  });

  it('should pass correct params to DB query', async () => {
    db.query.mockResolvedValueOnce([[]]);
    arusHelper.getPeriodsAndSlots.mockReturnValue([]);

    const filters = {
      cameraId: 3,
      approach: 'utara',
      direction: 'lurus',
      date: '2025-05-26'
    };
    await surveyModel.getVehicleDataGrouped(filters, ['SM', 'MP', 'AUP'], '1h');
    const callArgs = db.query.mock.calls[0];
    expect(callArgs[1][0]).toBe(3);
    expect(callArgs[1][1]).toBe('utara');
    expect(callArgs[1][2]).toBe('lurus');
    expect(callArgs[1][3]).toBe('2025-05-26 00:00:00');
    expect(callArgs[1][4]).toBe('2025-05-26 23:59:59');
  });

  it('should return empty vehicleData if DB returns no rows', async () => {
    db.query.mockResolvedValueOnce([[]]);
    arusHelper.getPeriodsAndSlots.mockReturnValue([]);
    const result = await surveyModel.getVehicleDataGrouped({}, ['SM', 'MP']);
    expect(result).toEqual({ vehicleData: [] });
  });
});

describe('Unit Test: getVehicleDataGrouped (Time Filtering)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should filter by date param and query only 1 day', async () => {
    db.query.mockResolvedValueOnce([[]]);
    const filters = {
      cameraId: null,
      approach: null,
      direction: null,
      date: '2025-04-20'
    };
    await surveyModel.getVehicleDataGrouped(filters, ['SM', 'MP']);
    const lastCall = db.query.mock.calls[0];
    expect(lastCall[0]).toMatch(/waktu BETWEEN \? AND \?/);
    expect(lastCall[1][0]).toBe('2025-04-20 00:00:00');
    expect(lastCall[1][1]).toBe('2025-04-20 23:59:59');
  });

  it('should filter from 00:00 today to next 15-min slot if date param not given', async () => {
    db.query.mockResolvedValueOnce([[]]);
    const realDate = Date;

    // Simulasi sekarang: 2025-06-01T14:21:05Z
    const fakeNow = new Date('2025-06-01T14:21:05Z');
    global.Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) return fakeNow;
        return new realDate(...args);
      }
      static now() { return fakeNow.getTime(); }
      static parse = realDate.parse;
      static UTC = realDate.UTC;
      static toISOString = realDate.toISOString;
    };

    await surveyModel.getVehicleDataGrouped({}, ['SM', 'MP']);

    const lastCall = db.query.mock.calls[0];
    expect(lastCall[1][0]).toBe('2025-06-01 00:00:00'); // Mulai 00:00
    expect(lastCall[1][1]).toBe('2025-06-01 14:30:00'); // Dibulatkan ke slot 15 menit ke atas: 14:21 -> 14:30

    global.Date = realDate;
  });

  it('should round time to next hour if minute > 45 (e.g., 04:59 → 05:00)', async () => {
    db.query.mockResolvedValueOnce([[]]);
    const realDate = Date;
    const fakeNow = new Date('2025-05-27T04:59:12Z');
    global.Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) return fakeNow;
        return new realDate(...args);
      }
      static now() { return fakeNow.getTime(); }
      static parse = realDate.parse;
      static UTC = realDate.UTC;
      static toISOString = realDate.toISOString;
    };

    await surveyModel.getVehicleDataGrouped({}, ['SM', 'MP']);
    const lastCall = db.query.mock.calls[0];
    expect(lastCall[1][0]).toBe('2025-05-27 00:00:00');
    expect(lastCall[1][1]).toBe('2025-05-27 05:00:00'); // 04:59 -> 05:00

    global.Date = realDate;
  });

  it('should work with filter params + waktu logic', async () => {
    db.query.mockResolvedValueOnce([[]]);
    const realDate = Date;
    const fakeNow = new Date('2025-06-01T12:44:00Z'); // 12:44 -> 12:45
    global.Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) return fakeNow;
        return new realDate(...args);
      }
      static now() { return fakeNow.getTime(); }
      static parse = realDate.parse;
      static UTC = realDate.UTC;
      static toISOString = realDate.toISOString;
    };

    await surveyModel.getVehicleDataGrouped({ cameraId: 3, approach: 'timur', direction: 'lurus' }, ['SM', 'MP']);
    const lastCall = db.query.mock.calls[0];
    expect(lastCall[1][0]).toBe(3);
    expect(lastCall[1][1]).toBe('timur');
    expect(lastCall[1][2]).toBe('lurus');
    expect(lastCall[1][3]).toBe('2025-06-01 00:00:00');
    expect(lastCall[1][4]).toBe('2025-06-01 12:45:00');

    global.Date = realDate;
  });

});

describe('Unit Test: getArusBySimpangDate', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should query arus rows by simpang and date', async () => {
    const mockRows = [
      { waktu: '2023-05-12T06:01:00', SM: 10, MP: 5, AUP: 2 }
    ];
    db.query.mockResolvedValueOnce([mockRows]);

    const result = await surveyModel.getArusBySimpangDate('1', '2023-05-12');
    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM arus WHERE ID_Simpang = ? AND DATE(waktu) = ?',
      ['1', '2023-05-12']
    );
    expect(result).toEqual(mockRows);
  });

  it('should return empty array if no result', async () => {
    db.query.mockResolvedValueOnce([[]]);
    const result = await surveyModel.getArusBySimpangDate('1', '2023-05-12');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});