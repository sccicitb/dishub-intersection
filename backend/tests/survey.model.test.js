// File : survey.model.test.js
const surveyModel = require('../app/models/survey.model');
const db = require('../app/config/db');

// Mock DB connection
jest.mock('../app/config/db');

describe('Unit Test: getVehicleDataGrouped', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should group and sum vehicle data per slot and period', async () => {
    db.query.mockResolvedValueOnce([[
      {
        waktu: '2025-05-26T05:04:00', // Pagi, slot 1 ("05:00 - 05:15")
        SM: 5,
        MP: 3,
        AUP: 2
      },
      {
        waktu: '2025-05-26T05:16:00', // Pagi, slot 2 ("05:15 - 05:30")
        SM: 6,
        MP: 4,
        AUP: 1
      },
      {
        waktu: '2025-05-26T12:03:00', // Siang, slot 1 ("12:00 - 12:15")
        SM: 2,
        MP: 1,
        AUP: 1
      }
    ]]);

    const filters = {
      cameraId: null,
      approach: null,
      direction: null
    };
    const includedSubCodes = ['SM', 'MP', 'AUP'];
    const result = await surveyModel.getVehicleDataGrouped(filters, includedSubCodes);

    expect(result).toHaveProperty('vehicleData');
    expect(Array.isArray(result.vehicleData)).toBe(true);

    const pagiPeriod = result.vehicleData.find(p => p.period === 'Pagi');
    const siangPeriod = result.vehicleData.find(p => p.period === 'Siang');

    expect(pagiPeriod).toBeDefined();
    expect(siangPeriod).toBeDefined();

    expect(pagiPeriod.timeSlots.length).toBe(2); // 2 slot di pagi
    expect(siangPeriod.timeSlots.length).toBe(1);

    expect(pagiPeriod.timeSlots[0].time).toBe('05:00 - 05:15');
    expect(pagiPeriod.timeSlots[0].data.total).toBe(10); // 5+3+2
    expect(pagiPeriod.timeSlots[1].time).toBe('05:15 - 05:30');
    expect(pagiPeriod.timeSlots[1].data.total).toBe(11); // 6+4+1

    expect(siangPeriod.timeSlots[0].time).toBe('12:00 - 12:15');
    expect(siangPeriod.timeSlots[0].data.total).toBe(4); // 2+1+1

    expect(pagiPeriod.timeSlots[0].data.SM).toBe(5);
    expect(pagiPeriod.timeSlots[1].data.MP).toBe(4);
    expect(siangPeriod.timeSlots[0].data.AUP).toBe(1);
  });

  it('should return empty array if no matching rows', async () => {
    db.query.mockResolvedValueOnce([[]]);
    const result = await surveyModel.getVehicleDataGrouped({}, ['SM', 'MP']);
    expect(result).toEqual({ vehicleData: [] });
  });

  it('should accumulate data if multiple rows in the same slot', async () => {
    db.query.mockResolvedValueOnce([[
      {
        waktu: '2025-05-26T05:03:00', // "05:00 - 05:15"
        SM: 2,
        MP: 1,
        AUP: 1
      },
      {
        waktu: '2025-05-26T05:10:00', // same slot "05:00 - 05:15"
        SM: 3,
        MP: 2,
        AUP: 1
      }
    ]]);
    const result = await surveyModel.getVehicleDataGrouped({}, ['SM', 'MP', 'AUP']);
    const pagiPeriod = result.vehicleData.find(p => p.period === 'Pagi');
    expect(pagiPeriod).toBeDefined();
    expect(pagiPeriod.timeSlots.length).toBe(1);
    expect(pagiPeriod.timeSlots[0].data.total).toBe(10); // (2+3)+(1+2)+(1+1) = 5+3+2 = 10
    expect(pagiPeriod.timeSlots[0].data.SM).toBe(5);
    expect(pagiPeriod.timeSlots[0].data.MP).toBe(3);
    expect(pagiPeriod.timeSlots[0].data.AUP).toBe(2);
  });

  it('should correctly apply filters in query (cameraId, approach, direction)', async () => {
    db.query.mockResolvedValueOnce([[]]);
    const filters = {
      cameraId: 1,
      approach: 'utara',
      direction: 'lurus'
    };
    await surveyModel.getVehicleDataGrouped(filters, ['SM', 'MP']);
    const lastCall = db.query.mock.calls[0];
    expect(lastCall[1][0]).toBe(1);
    expect(lastCall[1][1]).toBe('utara');
    expect(lastCall[1][2]).toBe('lurus');
    expect(typeof lastCall[1][3]).toBe('string'); // start
    expect(typeof lastCall[1][4]).toBe('string'); // end
  });

  it('should skip rows not in defined period', async () => {
    db.query.mockResolvedValueOnce([[
      {
        waktu: '2025-05-26T23:55:00',
        SM: 1,
        MP: 2,
        AUP: 3
      }
    ]]);
    const result = await surveyModel.getVehicleDataGrouped({}, ['SM', 'MP', 'AUP']);
    const malamPeriod = result.vehicleData.find(p => p.period === 'Malam');
    expect(malamPeriod).toBeDefined();
    expect(malamPeriod.timeSlots[0].data.total).toBe(6); // 1+2+3
    expect(malamPeriod.timeSlots[0].time).toBe('23:45 - 24:00');
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