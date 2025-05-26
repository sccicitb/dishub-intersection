const fs = require('fs');
const path = require('path');
const subCodeMap = require('../helpers/subCodeMap');
const surveyModel = require('../models/survey.model');

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

module.exports = { getHourlySummary };
