// survey.controller.js
const fs = require('fs');
const path = require('path');
const subCodeMap = require('../helpers/subCodeMap');
const { getPeriodsAndSlots } = require('../helpers/arus');
const { getSubCodes } = require('../helpers/classificationHelper');
const { getIntervals } = require('../helpers/timeHelper');
const surveyModel = require('../models/survey.model');
const mapsModel = require('../models/maps.model');

/**
 * GET /api/surveys/data-summary
 * Query string:
 *   - reportType: 'hourly' (default existing), 
 *                 'dailyRange', 'dailyMonth', 'monthly', 'yearly'
 *   - camera_id, approach, direction, classification (seperti semula)
 *   - interval: '15min' | '1h' (bila reportType=hourly)
 *   - startDate, endDate        (bila dailyRange)
 *   - month, year               (bila dailyMonth atau monthly)
 *   - months (format '1,2,3'), year  (bila monthly, artinya beberapa bulan di tahun yg sama)
 *   - date (YYYY-MM-DD), numYears (bila yearly)
 */
const getVehicleSummaryData = async (req, res) => {
  try {
    // --- 1. Baca filter dasar ---
    const filters = {
      cameraId: req.query.camera_id,
      approach: req.query.approach,
      direction: req.query.direction,
      classificationType: req.query.classification || 'luar_kota'
    };

    // 1.1. Ambil subCode list (array) berdasarkan klasifikasi
    const classificationPath = path.join(__dirname, '../data/classification.json');
    const classificationJson = JSON.parse(fs.readFileSync(classificationPath, 'utf-8'));
    const rawSubCodes = classificationJson
      .filter(item => item.type === filters.classificationType)
      .map(item => item.subCode);
    const includedSubCodes = rawSubCodes.map(code => subCodeMap[code] || code);

    // --- 2. Tentukan tipe laporan (reportType) ---
    const reportType = req.query.reportType || 'hourly'; 
    // default: 'hourly' (per‐periode 15min/1h seperti sebelumnya)

    // --- 3. Switch case untuk tiap reportType ---
    if (reportType === 'hourly') {
      // 3.a Eksisting logic: per‐periode (15min/1h) untuk satu hari
      const interval = req.query.interval ? req.query.interval.toLowerCase() : '15min';
      const date = req.query.date; // optional; kalau kosong, model akan treat sebagai “today until now”

      // Panggil model lama
      const data = await surveyModel.getVehicleDataGrouped(
        { cameraId: filters.cameraId, approach: filters.approach, direction: filters.direction, date }, 
        includedSubCodes, 
        interval
      );
      return res.json({ ...data, interval });
    }

    // --------------------------------------------------------------
    // 3.b DAILY RANGE: dari startDate sampai endDate (per‐hari)
    // --------------------------------------------------------------
    if (reportType === 'dailyRange') {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate dan endDate wajib diisi (format YYYY-MM-DD).' });
      }
      // Panggil helper baru:
      const dailyRows = await surveyModel.getDailySummaryByDateRange(
        { cameraId: filters.cameraId, approach: filters.approach, direction: filters.direction },
        includedSubCodes,
        startDate,
        endDate
      );
      // Bentuk output serupa DataTableDaysMonth.json → kita embed di field `dailyData`
      // Kita tidak butuh monthlyTotal di sini, langsung kembalikan array tanggalnya:
      return res.json({ dailyData: dailyRows });
    }

    // --------------------------------------------------------------
    // 3.c DAILY BY SINGLE MONTH (dailyMonth)
    // --------------------------------------------------------------
    if (reportType === 'dailyMonth') {
      let month = parseInt(req.query.month, 10);
      let year = parseInt(req.query.year, 10);
      if (!month || !year) {
        return res.status(400).json({ error: 'month (1–12) dan year (YYYY) wajib diisi.' });
      }
      // Panggil getMonthlySummary untuk satu bulan
      const oneMonthData = await surveyModel.getMonthlySummary(
        month, year,
        { cameraId: filters.cameraId, approach: filters.approach, direction: filters.direction },
        includedSubCodes
      );
      // Sesuai DataTableDaysMonth.json: dailyData berbentuk array, disini hanya satu elemen bulannya
      return res.json({ 
        dailyData: [ /* array sebulan penuh */ oneMonthData ],
        lhrkData: [ /* kalau ingin LHRK untuk bulan ini? biasanya LHRK Jan, LHRK Feb dsm */ ]
      });
    }

    // --------------------------------------------------------------
    // 3.d MONTHLY: beberapa bulan di satu tahun
    // --------------------------------------------------------------
    if (reportType === 'monthly') {
      // Param: months= “1,2,3” (bisa string CSV), year=2025
      const monthsCSV = req.query.months;
      const year = parseInt(req.query.year, 10);

      if (!year) {
        return res.status(400).json({ error: 'Parameter year (YYYY) wajib diisi.' });
      }

      // Jika months kosong, gunakan default: semua bulan
      const monthList = monthsCSV
        ? monthsCSV.split(',').map(m => parseInt(m.trim(), 10)).filter(m => m >= 1 && m <= 12)
        : [1,2,3,4,5,6,7,8,9,10,11,12];

      // Panggil getMonthlySummary untuk tiap bulan di monthList
      const allMonthsData = [];
      for (const m of monthList) {
        const oneMonthData = await surveyModel.getMonthlySummary(
          m, year,
          { cameraId: filters.cameraId, approach: filters.approach, direction: filters.direction },
          includedSubCodes
        );
        allMonthsData.push(oneMonthData);
      }

      // Bentuk JSON final sama seperti DataTableDaysMonth.json:
      // { dailyData: [ { month: 'Januari', … }, { month: 'Februari', … }, … ], lhrkData: […] }
      // “lhrkData” untuk tiap bulan: misal periode LHRK Jan, LHRK Feb:
      const lhrkData = allMonthsData.map(mObj => {
        const daysInPeriod = mObj.days.length;
        const data = { ...mObj.monthlyTotal }; // total per bulan
        // dailyAverage = total / daysInPeriod
        const dailyAverage = {};
        Object.keys(data).forEach(k => {
          dailyAverage[k] = daysInPeriod > 0 ? Math.round(data[k] / daysInPeriod) : 0;
        });
        return {
          period: `LHRK ${mObj.month.substr(0,3)}`, // misal “LHRK Jan”
          daysInPeriod,
          data,
          dailyAverage
        };
      });

      return res.json({
        dailyData: allMonthsData,
        lhrkData
      });
    }

    // --------------------------------------------------------------
    // 3.e YEARLY: dimulai dari param date, jumlah periode = numYears (default 4)
    // --------------------------------------------------------------
    if (reportType === 'yearly') {
      const date = req.query.date;           // 'YYYY-MM-DD'
      const numYears = parseInt(req.query.numYears, 10) || 4;
      if (!date) {
        return res.status(400).json({ error: 'date (YYYY-MM-DD) wajib diisi untuk mode yearly.' });
      }
      const startDateObj = new Date(date);
      if (isNaN(startDateObj.getTime())) {
        return res.status(400).json({ error: 'Format date salah. Harus \'YYYY-MM-DD\'.' });
      }
      const { yearlyData, lhrtData } = await surveyModel.getYearlySummary(
        startDateObj,
        { cameraId: filters.cameraId, approach: filters.approach, direction: filters.direction },
        includedSubCodes,
        numYears
      );
      // Bentuk JSON final mirip DataTableYear.json:
      return res.json({ yearlyData, lhrtData });
    }

    // --------------------------------------------------------------
    // 4. Kalau reportType tidak dikenali
    // --------------------------------------------------------------
    return res.status(400).json({ error: `reportType tidak dikenali: ${reportType}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch vehicle data' });
  }
};

/**
 * GET /api/surveys/export-vehicle
 * Param: interval = '15min' (default) | '1h' | '60min'
 */
const exportVehicleData = async (req, res) => {
  try {
    const { simpang_id, date, interval } = req.query;
    const summaryInterval = (interval && ['1h', '1hour', '60min'].includes(interval.toLowerCase()))
      ? '1h'
      : '15min';

    if (!simpang_id || !date)
      return res.status(400).json({ error: 'simpang_id and date required' });

    // Get simpang info
    const simpang = await mapsModel.getSimpangById(simpang_id);
    if (!simpang)
      return res.status(404).json({ error: 'Simpang not found' });

    // Get arus data
    const arusRows = await surveyModel.getArusBySimpangDate(simpang_id, date);

    // Generate periods & slots with selected interval
    const periods = getPeriodsAndSlots(arusRows, summaryInterval);

    // Compose output (match sampleVehicleData.json)
    const surveyInfo = {
      simpangCode: simpang.id,
      direction: simpang.kategori,
      surveyor: 'VIANA',
      date
    };

    return res.json({ surveyInfo, periods, interval: summaryInterval });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSurveyProporsi = async (req, res) => {
  try {
    const { ID_Simpang, type, date } = req.query;
    if (!ID_Simpang || !type) {
      return res.status(400).json({ message: "ID_Simpang dan type wajib diisi" });
    }
    const queryDate = date || (new Date()).toISOString().slice(0, 10);
    const jenisKendaraanDB = JENIS_KENDARAAN.map(code => subCodeMap[code] || code);
    const arahList = ['north', 'south', 'east', 'west'];
    const grid = {};
    let vehicleCount = 0;

    // Ambil semua data sekali query
    const rows = await surveyModel.getArusSummaryGrid(ID_Simpang, jenisKendaraanDB, queryDate);

    for (const arah of arahList) {
      grid[arah] = { row1: [], row2: [], row3: [] };
      for (let rowIdx = 0; rowIdx < ROWS.length; rowIdx++) {
        const { row, turn } = ROWS[rowIdx];
        const ke_arah = TURN_MAP[arah][turn];
        // Cari baris yang sesuai dari hasil SQL
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
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getVehicleSummaryData, exportVehicleData, getSurveyProporsi, getSurveyProporsi };