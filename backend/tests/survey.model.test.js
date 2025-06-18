// File: tests/survey.model.test.js
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

    const filters = { simpangId: null, approach: null, direction: null, date: '2025-05-26' };
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

    const filters = { simpangId: 1, approach: 'utara', direction: 'lurus', date: '2025-05-26' };
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

  it('should pass correct params to DB query (filter + date)', async () => {
    db.query.mockResolvedValueOnce([[]]);
    arusHelper.getPeriodsAndSlots.mockReturnValue([]);

    const filters = {
      simpangId: 3,
      approach: 'utara',
      direction: 'lurus',
      date: '2025-05-26'
    };
    await surveyModel.getVehicleDataGrouped(filters, ['SM', 'MP', 'AUP'], '1h');

    const lastCall = db.query.mock.calls[0];
    expect(lastCall[1][0]).toBe(3);
    expect(lastCall[1][1]).toBe('utara');
    expect(lastCall[1][2]).toBe('lurus');
    expect(lastCall[1][3]).toBe('2025-05-26 00:00:00');
    expect(lastCall[1][4]).toBe('2025-05-26 23:59:59');
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

    const filters = { simpangId: null, approach: null, direction: null, date: '2025-04-20' };
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

    expect(lastCall[1][0]).toBe('2025-06-01 00:00:00');
    expect(lastCall[1][1]).toBe('2025-06-01 14:30:00');

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
    expect(lastCall[1][1]).toBe('2025-05-27 05:00:00');

    global.Date = realDate;
  });

  it('should work with filter params + waktu logic', async () => {
    db.query.mockResolvedValueOnce([[]]);
    const realDate = Date;
    const fakeNow = new Date('2025-06-01T12:44:00Z');
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

    await surveyModel.getVehicleDataGrouped(
      { simpangId: 3, approach: 'timur', direction: 'lurus' },
      ['SM', 'MP']
    );
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
    const mockRows = [{ waktu: '2023-05-12T06:01:00', SM: 10, MP: 5, AUP: 2 }];
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

describe('Unit Test: getDailySummaryByDateRange', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should aggregate daily summary between two dates', async () => {
    const dbRows = [
      { date: '2025-02-03', SM: 5, MP: 3, AUP: 2, TR: 0, BS: 0, TS: 0, BB: 0, TB: 0, GANDEG: 1, KTB: 0 },
      { date: '2025-02-04', SM: 4, MP: 6, AUP: 1, TR: 0, BS: 0, TS: 0, BB: 0, TB: 0, GANDEG: 2, KTB: 1 }
    ];
    db.query.mockResolvedValueOnce([dbRows]);

    const filters = { simpangId: '10', approach: 'utara', direction: 'lurus' };
    const includedSubCodes = ['SM', 'MP', 'AUP', 'TR', 'BS', 'TS', 'BB', 'TB', 'GANDEG', 'KTB'];

    const result = await surveyModel.getDailySummaryByDateRange(
      filters,
      includedSubCodes,
      '2025-02-03',
      '2025-02-04'
    );

    const callArgs = db.query.mock.calls[0];
    expect(callArgs[1][0]).toBe('2025-02-03 00:00:00');
    expect(callArgs[1][1]).toBe('2025-02-04 23:59:59');
    expect(callArgs[1][2]).toBe('10');
    expect(callArgs[1][3]).toBe('utara');
    expect(callArgs[1][4]).toBe('lurus');

    expect(result).toEqual([
      {
        date: '2025-02-03',
        sm: 5,
        mp: 3,
        aup: 2,
        tr: 0,
        bs: 0,
        ts: 0,
        bb: 0,
        tb: 0,
        gandeg: 1,
        ktb: 0,
        total: 11
      },
      {
        date: '2025-02-04',
        sm: 4,
        mp: 6,
        aup: 1,
        tr: 0,
        bs: 0,
        ts: 0,
        bb: 0,
        tb: 0,
        gandeg: 2,
        ktb: 1,
        total: 14
      }
    ]);
  });

  it('should return empty array if no rows from DB', async () => {
    db.query.mockResolvedValueOnce([[]]);
    const result = await surveyModel.getDailySummaryByDateRange(
      { simpangId: null, approach: null, direction: null },
      ['SM', 'MP'],
      '2025-02-01',
      '2025-02-05'
    );
    expect(result).toEqual([]);
  });
});

// describe('Unit Test: getMonthlySummary', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should populate daily array and monthlyTotal correctly', async () => {
//     // Februari 2025: 28 hari, workDays = 20
//     const dbRows = [
//       { date: '2025-02-01', SM: 2, MP: 3, AUP: 1, TR: 0, BS: 0, TS: 0, BB: 0, TB: 0, GANDEG: 0, KTB: 0 },
//       { date: '2025-02-15', SM: 4, MP: 1, AUP: 0, TR: 0, BS: 0, TS: 0, BB: 0, TB: 0, GANDEG: 1, KTB: 1 }
//     ];
//     db.query.mockResolvedValueOnce([dbRows]);

//     const includedSubCodes = ['SM', 'MP', 'AUP', 'TR', 'BS', 'TS', 'BB', 'TB', 'GANDEG', 'KTB'];
//     const filters = { simpangId: '20', approach: 'semua', direction: 'semua' };

//     const result = await surveyModel.getMonthlySummary(2, 2025, filters, includedSubCodes);

//     // Work days di Februari 2025 = 20
//     expect(result.workDays).toBe(20);

//     // Array days harus panjang 28
//     expect(result.days.length).toBe(28);

//     // Cek data 2025-02-01
//     const feb1 = result.days.find(d => d.date === '2025-02-01');
//     expect(feb1.data.sm).toBe(2);
//     expect(feb1.data.mp).toBe(3);
//     expect(feb1.data.aup).toBe(1);
//     expect(feb1.data.gandeg).toBe(0);
//     expect(feb1.data.ktb).toBe(0);

//     // Cek data 2025-02-02 (tidak ada di DB → 0)
//     const feb2 = result.days.find(d => d.date === '2025-02-02');
//     expect(feb2.data.total).toBe(0);

//     // Verifikasi monthlyTotal: sm=(2+4)=6, mp=(3+1)=4, aup=1, gandeg=(0+1)=1, ktb=1,
//     // total = 6 + 4 + 1 + 1 + 1 = 13
//     expect(result.monthlyTotal.sm).toBe(6);
//     expect(result.monthlyTotal.mp).toBe(4);
//     expect(result.monthlyTotal.aup).toBe(1);
//     expect(result.monthlyTotal.gandeg).toBe(1);
//     expect(result.monthlyTotal.ktb).toBe(1);
//     expect(result.monthlyTotal.total).toBe(13);
//   });
// });

describe('Unit Test: getYearlySummary', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should aggregate yearly data and compute LHRT correctly', async () => {
    // Setup mock data untuk empat periode
    const row2025 = { SM: 100, MP: 50, AUP: 25, TR: 0, BS: 0, TS: 0, BB: 0, TB: 0, GANDEG: 10, KTB: 5 };
    const row2026 = { SM: 200, MP: 100, AUP: 50, TR: 0, BS: 0, TS: 0, BB: 0, TB: 0, GANDEG: 20, KTB: 10 };
    const row2027 = { SM: 150, MP: 75, AUP: 30, TR: 0, BS: 0, TS: 0, BB: 0, TB: 0, GANDEG: 15, KTB: 7 };
    const row2028 = { SM: 120, MP: 60, AUP: 20, TR: 0, BS: 0, TS: 0, BB: 0, TB: 0, GANDEG: 12, KTB: 6 };

    db.query
      .mockResolvedValueOnce([[row2025]])
      .mockResolvedValueOnce([[row2026]])
      .mockResolvedValueOnce([[row2027]])
      .mockResolvedValueOnce([[row2028]]);

    const includedSubCodes = ['SM', 'MP', 'AUP', 'TR', 'BS', 'TS', 'BB', 'TB', 'GANDEG', 'KTB'];
    const filters = { simpangId: null, approach: null, direction: null };

    const startDateObj = new Date('2025-02-01');
    const { yearlyData, lhrtData } = await surveyModel.getYearlySummary(startDateObj, filters, includedSubCodes, 4);

    // Periksa index 0 (tahun 2025)
    expect(yearlyData[0].year).toBe('2025');
    expect(yearlyData[0].data.sm).toBe(100);
    expect(yearlyData[0].data.mp).toBe(50);
    expect(yearlyData[0].data.aup).toBe(25);
    expect(yearlyData[0].data.gandeg).toBe(10);
    expect(yearlyData[0].data.ktb).toBe(5);
    expect(yearlyData[0].data.total).toBe(100 + 50 + 25 + 10 + 5);

    // LHRT untuk 2025: daysInPeriod = 365
    expect(lhrtData[0].period).toBe('LHRT 2025');
    expect(lhrtData[0].daysInPeriod).toBe(365);
    expect(lhrtData[0].dailyAverage.sm).toBe(Math.round(100 / 365));
    expect(lhrtData[0].data.total).toBe(100 + 50 + 25 + 10 + 5);

    // Periksa index 1 (tahun 2026)
    expect(yearlyData[1].year).toBe('2026');
    expect(yearlyData[1].data.sm).toBe(200);
    expect(lhrtData[1].period).toBe('LHRT 2026');
    expect(lhrtData[1].daysInPeriod).toBe(365);
    expect(lhrtData[1].dailyAverage.gandeg).toBe(Math.round(20 / 365));
  });
});
