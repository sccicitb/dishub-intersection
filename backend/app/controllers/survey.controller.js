const fs = require('fs');
const path = require('path');
const subCodeMap = require('../helpers/subCodeMap');
const surveyModel = require('../models/survey.model');
const mapsModel = require('../models/maps.model');

// Pemetaan arah
const DIRECTION_MAP = {
  'utara': 'north', 'north': 'north',
  'selatan': 'south', 'south': 'south',
  'timur': 'east', 'east': 'east',
  'barat': 'west', 'west': 'west',
  'semua': 'semua'
};

const normalizeDirection = (dir) => DIRECTION_MAP[dir?.toLowerCase()] || dir;

// Putaran kendaraan (left, straight, right)
const TURN_MAP = {
  north: { left: 'west', straight: 'south', right: 'east' },
  south: { left: 'east', straight: 'north', right: 'west' },
  east: { left: 'north', straight: 'west', right: 'south' },
  west: { left: 'south', straight: 'east', right: 'north' }
};

const ROWS = [
  { row: 'row1', turn: 'left' },
  { row: 'row2', turn: 'straight' },
  { row: 'row3', turn: 'right' }
];

// Validasi interval
const validateInterval = (interval) => {
  const valid = ['5min', '10min', '15min', '1h', '60min'];
  return valid.includes(interval) ? interval : '15min';
};

// GET /api/surveys/data-summary - ambil data kendaraan
const getVehicleSummaryData = async (req, res) => {
  try {
    const filters = {
      simpangId: req.query.simpang_id,
      approach: normalizeDirection(req.query.approach),
      direction: normalizeDirection(req.query.direction),
      classificationType: req.query.classification || 'luar_kota'
    };

    // Baca klasifikasi dari file
    const classificationPath = path.join(__dirname, '../data/classification.json');
    const classificationJson = JSON.parse(fs.readFileSync(classificationPath, 'utf-8'));
    const rawSubCodes = classificationJson
      .filter(item => item.type === filters.classificationType)
      .map(item => item.subCode);
    const includedSubCodes = rawSubCodes.map(code => subCodeMap[code] || code);

    const reportType = req.query.reportType || 'hourly'; 

    // Hourly: per interval
    if (reportType === 'hourly') {
      const interval = validateInterval(req.query.interval?.toLowerCase());
      const date = req.query.date;
      const data = await surveyModel.getVehicleDataGrouped(
        { simpangId: filters.simpangId, approach: filters.approach, direction: filters.direction, date }, 
        includedSubCodes, interval
      );
      return res.json({ ...data, interval });
    }

    // Daily range
    if (reportType === 'dailyRange') {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate dan endDate wajib (YYYY-MM-DD)' });
      }
      const dailyRows = await surveyModel.getDailySummaryByDateRange(
        { simpangId: filters.simpangId, approach: filters.approach, direction: filters.direction },
        includedSubCodes, startDate, endDate
      );
      return res.json({ dailyData: dailyRows });
    }

    // Single month
    if (reportType === 'dailyMonth') {
      const month = parseInt(req.query.month, 10);
      const year = parseInt(req.query.year, 10);
      if (!month || !year) {
        return res.status(400).json({ error: 'month (1-12) dan year (YYYY) wajib' });
      }
      const oneMonthData = await surveyModel.getMonthlySummary(
        month, year,
        { simpangId: filters.simpangId, approach: filters.approach, direction: filters.direction },
        includedSubCodes
      );
      return res.json({ dailyData: [ oneMonthData ], lhrkData: [] });
    }

    // Multiple months
    if (reportType === 'monthly') {
      const monthsCSV = req.query.months;
      const year = parseInt(req.query.year, 10);
      if (!year) {
        return res.status(400).json({ error: 'year (YYYY) wajib' });
      }

      const monthList = monthsCSV
        ? monthsCSV.split(',').map(m => parseInt(m.trim(), 10)).filter(m => m >= 1 && m <= 12)
        : [1,2,3,4,5,6,7,8,9,10,11,12];

      const allMonthsData = [];
      for (const m of monthList) {
        const oneMonthData = await surveyModel.getMonthlySummary(
          m, year,
          { simpangId: filters.simpangId, approach: filters.approach, direction: filters.direction },
          includedSubCodes
        );
        allMonthsData.push(oneMonthData);
      }

      const lhrkData = allMonthsData.map(mObj => {
        const daysInPeriod = mObj.days.length;
        const data = { ...mObj.monthlyTotal };
        const dailyAverage = {};
        Object.keys(data).forEach(k => {
          dailyAverage[k] = daysInPeriod > 0 ? Math.round(data[k] / daysInPeriod) : 0;
        });
        return {
          period: `LHRK ${mObj.month.substr(0,3)}`,
          daysInPeriod, data, dailyAverage
        };
      });

      return res.json({ dailyData: allMonthsData, lhrkData });
    }

    // Yearly
    if (reportType === 'yearly') {
      const date = req.query.date;
      const numYears = parseInt(req.query.numYears, 10) || 4;
      if (!date) {
        return res.status(400).json({ error: 'date (YYYY-MM-DD) wajib untuk yearly' });
      }
      const startDateObj = new Date(date);
      if (isNaN(startDateObj.getTime())) {
        return res.status(400).json({ error: 'Format date salah, gunakan YYYY-MM-DD' });
      }
      const { yearlyData, lhrtData } = await surveyModel.getYearlySummary(
        startDateObj,
        { simpangId: filters.simpangId, approach: filters.approach, direction: filters.direction },
        includedSubCodes, numYears
      );
      return res.json({ yearlyData, lhrtData });
    }

    return res.status(400).json({ error: `reportType tidak dikenali: ${reportType}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal ambil data' });
  }
};

// GET /api/surveys/export-vehicle
const exportVehicleData = async (req, res) => {
  try {
    const { simpang_id, date, interval } = req.query;
    
    const summaryInterval = validateInterval(interval?.toLowerCase());
    if (!simpang_id || !date)
      return res.status(400).json({ error: 'simpang_id dan date wajib' });

    const simpang = await mapsModel.getSimpangById(simpang_id);
    if (!simpang)
      return res.status(404).json({ error: 'Simpang tidak ditemukan' });

    const arusRows = await surveyModel.getArusBySimpangDate(simpang_id, date);
    const periods = getPeriodsAndSlots(arusRows, summaryInterval);

    return res.json({
      surveyInfo: { simpangCode: simpang.id, direction: simpang.kategori, surveyor: 'VIANA', date },
      periods, interval: summaryInterval
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server" });
  }
};

// GET /api/surveys/proporsi
const getSurveyProporsi = async (req, res) => {
  try {
    const { ID_Simpang, type, date } = req.query;
    if (!ID_Simpang || !type) {
      return res.status(400).json({ message: "ID_Simpang dan type wajib" });
    }
    const queryDate = date || (new Date()).toISOString().slice(0, 10);
    const jenisKendaraanDB = Object.values(subCodeMap);
    const arahList = ['north', 'south', 'east', 'west'];
    const grid = {};
    let vehicleCount = 0;

    const rows = await surveyModel.getArusSummaryGrid(ID_Simpang, jenisKendaraanDB, queryDate);

    for (const arah of arahList) {
      grid[arah] = { row1: [], row2: [], row3: [] };
      for (let rowIdx = 0; rowIdx < ROWS.length; rowIdx++) {
        const { row, turn } = ROWS[rowIdx];
        const ke_arah = TURN_MAP[arah][turn];
        const found = rows.find(r => r.dari_arah === arah && r.ke_arah === ke_arah);
        for (let colIdx = 0; colIdx < jenisKendaraanDB.length; colIdx++) {
          const jenis = jenisKendaraanDB[colIdx];
          const total = found ? Number(found[jenis] || 0) : 0;
          grid[arah][row].push({
            id: `${arah[0]}${rowIdx + 1}-${colIdx + 1}`,
            content: total
          });
          vehicleCount += total;
        }
      }
    }
    grid.vehicleCount = vehicleCount;
    res.json(grid);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error server" });
  }
};

// GET /api/surveys/km-tabel
const getKMTabelData = async (req, res) => {
  const startTime = Date.now();
  try {
    const { simpang_id, date, interval, approach } = req.query;
    
    if (!simpang_id) {
      return res.status(400).json({ error: 'simpang_id wajib (2, 3, 4, 5)' });
    }
    if (!date) {
      return res.status(400).json({ error: 'date wajib (YYYY-MM-DD)' });
    }

    const simpangId = parseInt(simpang_id, 10);
    const requestInterval = validateInterval(interval?.toLowerCase());
    const requestApproach = approach || 'semua';

    const kmTabelData = await surveyModel.getKMTabelData(
      simpangId, date, requestInterval, requestApproach
    );

    const executionTime = Date.now() - startTime;

    return res.json({
      success: true,
      data: kmTabelData,
      metadata: {
        simpang_id: simpangId,
        date, interval: requestInterval, approach: requestApproach,
        execution_time_ms: executionTime,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const status = error.message.includes('Validation') ? 400 : 500;
    res.status(status).json({
      success: false,
      error: error.message,
      execution_time_ms: executionTime
    });
  }
};

// GET /api/surveys/traffic-matrix
const getTrafficMatrix = async (req, res) => {
  const startTime = Date.now();
  try {
    const { simpang_id, date, approach } = req.query;

    if (!simpang_id || !date) {
      return res.status(400).json({ success: false, error: 'simpang_id dan date wajib' });
    }

    const normalizedDate = date.includes('/') ? date.replace(/\//g, '-') : date;
    const normalizedApproach = normalizeDirection(approach || 'semua');

    const result = await surveyModel.getTrafficMatrix(simpang_id, normalizedDate, normalizedApproach);
    const executionTime = Date.now() - startTime;

    return res.json({
      success: true,
      data: {
        simpang_id: parseInt(simpang_id),
        date: normalizedDate,
        approach: normalizedApproach,
        asalTujuan: result.asalTujuan,
        arahPergerakan: result.arahPergerakan
      },
      execution_time_ms: executionTime
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    res.status(500).json({
      success: false,
      error: error.message,
      execution_time_ms: executionTime
    });
  }
};

// GET /api/surveys/available-directions
const getAvailableDirections = async (req, res) => {
  try {
    const { simpang_id } = req.query;
    if (!simpang_id) {
      return res.status(400).json({ error: 'simpang_id wajib' });
    }

    const directions = await surveyModel.getAvailableDirections(simpang_id);
    const directionMap = {
      'north': 'utara', 'south': 'selatan',
      'east': 'timur', 'west': 'barat'
    };

    return res.json({
      success: true,
      simpang_id: parseInt(simpang_id),
      available_directions: directions,
      available_directions_id: directions.map(d => directionMap[d] || d)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { 
  getVehicleSummaryData, 
  exportVehicleData, 
  getSurveyProporsi, 
  getKMTabelData,
  getTrafficMatrix,
  getAvailableDirections
};
