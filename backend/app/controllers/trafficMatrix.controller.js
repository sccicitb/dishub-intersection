const TrafficMatrix = require("../models/trafficMatrix.model");

// Waktu dalam sehari
const TIME_PERIODS = {
  'Dini Hari': '00:00 - 05:59',
  'Pagi Hari': '06:00 - 11:59',
  'Siang Hari': '12:00 - 14:59',
  'Sore Hari': '15:00 - 17:59',
  'Malam Hari': '18:00 - 23:59'
};

// Validasi parameter
const validateParams = (simpang_id, date) => {
  if (!simpang_id) return 'simpang_id wajib';
  if (!date) return 'date wajib (YYYY-MM-DD)';
  return null;
};

// Handler generic untuk semua interval
const getTrafficMatrixHandler = (interval) => async (req, res) => {
  try {
    const { simpang_id, date } = req.query;
    const error = validateParams(simpang_id, date);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const startTime = Date.now();
    const result = await TrafficMatrix.getTrafficMatrixByFilter(simpang_id, date, interval);
    const elapsed = Date.now() - startTime;

    res.status(200).json({
      success: true,
      data: {
        simpang_id, date, interval,
        timePeriods: TIME_PERIODS,
        slotCount: Object.keys(result).length,
        processingTime: `${elapsed}ms`,
        slots: result
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/traffic-matrix/by-filter
exports.getTrafficMatrixByFilter = async (req, res) => {
  try {
    const { simpang_id, date, interval = '1hour' } = req.query;
    const error = validateParams(simpang_id, date);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const startTime = Date.now();
    const result = await TrafficMatrix.getTrafficMatrixByFilter(simpang_id, date, interval);
    const elapsed = Date.now() - startTime;

    res.status(200).json({
      success: true,
      data: {
        simpang_id, date, interval,
        timePeriods: TIME_PERIODS,
        slotCount: Object.keys(result).length,
        processingTime: `${elapsed}ms`,
        slots: result
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/traffic-matrix/by-hours
exports.getTrafficMatrixByHours = getTrafficMatrixHandler('1hour');

// GET /api/traffic-matrix/by-5min
exports.getTrafficMatrixBy5Min = getTrafficMatrixHandler('5min');

// GET /api/traffic-matrix/by-10min
exports.getTrafficMatrixBy10Min = getTrafficMatrixHandler('10min');

// GET /api/traffic-matrix/by-30min
exports.getTrafficMatrixBy30Min = getTrafficMatrixHandler('30min');
