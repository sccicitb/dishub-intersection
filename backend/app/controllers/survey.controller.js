const fs = require('fs');
const path = require('path');
const subCodeMap = require('../helpers/subCodeMap');
const { getPeriodsAndSlots } = require('../helpers/arus');
const { getSubCodes } = require('../helpers/classificationHelper');
const { getIntervals } = require('../helpers/timeHelper');
const { TURN_MAP, ROWS, JENIS_KENDARAAN } = require('../helpers/turnLogic');
const surveyModel = require('../models/survey.model');
const mapsModel = require('../models/maps.model');


/**
 * GET /api/surveys/data-summary
 * Param: interval = '15min' (default) | '1h' | '60min'
 */
const getVehicleSummaryData = async (req, res) => {
  try {
    const filters = {
      cameraId: req.query.camera_id,
      approach: req.query.approach,
      direction: req.query.direction,
      classificationType: req.query.classification || 'luar_kota',
      date: req.query.date // opsional, string "YYYY-MM-DD" atau undefined
    };

    // Read subcode mapping
    const classificationPath = path.join(__dirname, '../data/classification.json');
    const classificationJson = JSON.parse(fs.readFileSync(classificationPath, 'utf-8'));

    const rawSubCodes = classificationJson
      .filter(item => item.type === filters.classificationType)
      .map(item => item.subCode);

    const includedSubCodes = rawSubCodes.map(code => subCodeMap[code] || code);

    // Param interval (default: '15min')
    const interval = req.query.interval ? req.query.interval.toLowerCase() : '15min';

    // Query vehicle data from model
    const data = await surveyModel.getVehicleDataGrouped(filters, includedSubCodes, interval);

    res.json({ ...data, interval });
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