// app/controllers/survey.controller.js
const fs = require('fs');
const path = require('path');
const subCodeMap = require('../helpers/subCodeMap');
const { getPeriodsAndSlots } = require('../helpers/arus');
const surveyModel = require('../models/survey.model');
const mapsModel = require('../models/maps.model');

const getHourlySummary = async (req, res) => {
  try {
    const filters = {
      cameraId: req.query.camera_id,
      approach: req.query.approach,
      direction: req.query.direction,
      classificationType: req.query.classification || 'luar_kota',
      date: req.query.date // opsional, string "YYYY-MM-DD" atau undefined
    };

    const classificationPath = path.join(__dirname, '../data/classification.json');
    const classificationJson = JSON.parse(fs.readFileSync(classificationPath, 'utf-8'));

    const rawSubCodes = classificationJson
      .filter(item => item.type === filters.classificationType)
      .map(item => item.subCode);

    const includedSubCodes = rawSubCodes.map(code => subCodeMap[code] || code);

    const data = await surveyModel.getVehicleDataGrouped(filters, includedSubCodes);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch vehicle data' });
  }
};

const exportVehicleData = async (req, res) => {
  try {
    const { simpang_id, date } = req.query;
    if (!simpang_id || !date) return res.status(400).json({ error: 'simpang_id and date required' });

    // Ambil info simpang
    const simpang = await mapsModel.getSimpangById(simpang_id);
    if (!simpang) return res.status(404).json({ error: 'Simpang not found' });

    // Ambil data arus
    const arusRows = await surveyModel.getArusBySimpangDate(simpang_id, date);

    // Proses periods & slot (pakai helper baru)
    const periods = getPeriodsAndSlots(arusRows);

    // Compose surveyInfo
    const surveyInfo = {
      simpangCode: simpang.id,
      direction: simpang.kategori,
      surveyor: 'VIANA',
      date
    };

    return res.json({ surveyInfo, periods });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getHourlySummary, exportVehicleData };
