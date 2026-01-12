const TrafficMatrix = require("../models/trafficMatrix.model");

// ✅ NEW: Get traffic matrix with flexible time interval filters
// Query: GET /api/traffic-matrix/by-filter?simpang_id=2&date=2025-03-28&interval=5min
// Parameters:
//   - simpang_id: ID simpang or 'semua' for all (required)
//   - date: YYYY-MM-DD or YYYY/MM/DD format (required)
//   - interval: 5min, 10min, 30min, 1hour (optional, default: 1hour)
// Note: 5min interval returns ~288 slots and may take 10-30 seconds
exports.getTrafficMatrixByFilter = async (req, res) => {
  try {
    const { simpang_id, date, interval = '1hour' } = req.query;
    
    // Validate required parameters
    if (!simpang_id) {
      return res.status(400).json({
        success: false,
        message: 'Parameter simpang_id is required',
        example: '/api/traffic-matrix/by-filter?simpang_id=2&date=2025-03-28&interval=5min'
      });
    }
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Parameter date is required (format: YYYY-MM-DD or YYYY/MM/DD)',
        example: '/api/traffic-matrix/by-filter?simpang_id=2&date=2025-03-28&interval=5min'
      });
    }
    
    // Validate interval
    const validIntervals = ['5min', '10min', '30min', '1hour'];
    if (!validIntervals.includes(interval)) {
      return res.status(400).json({
        success: false,
        message: `Invalid interval. Supported: ${validIntervals.join(', ')}`,
        example: '/api/traffic-matrix/by-filter?simpang_id=2&date=2025-03-28&interval=5min'
      });
    }
    
    // ✅ OPTIMIZED: Single batch query now instead of N queries
    // This should be much faster - 10-30 seconds for 5min interval instead of 2+ minutes
    const startTime = Date.now();
    const result = await TrafficMatrix.getTrafficMatrixByFilter(simpang_id, date, interval);
    const elapsedTime = Date.now() - startTime;
    
    const timePeriodInfo = {
      'Dini Hari': '00:00 - 05:59',
      'Pagi Hari': '06:00 - 11:59',
      'Siang Hari': '12:00 - 14:59',
      'Sore Hari': '15:00 - 17:59',
      'Malam Hari': '18:00 - 23:59'
    };
    
    res.status(200).json({
      success: true,
      message: 'Traffic matrix retrieved successfully',
      data: {
        simpang_id: simpang_id,
        date: date,
        interval: interval,
        timePeriods: timePeriodInfo,
        slotCount: Object.keys(result).length,
        processingTime: `${elapsedTime}ms`,
        slots: result
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ BONUS: Get hourly traffic matrix (shorthand for interval=1hour)
// Query: GET /api/traffic-matrix/by-hours?simpang_id=2&date=2025-03-28
exports.getTrafficMatrixByHours = async (req, res) => {
  try {
    const { simpang_id, date } = req.query;
    
    if (!simpang_id || !date) {
      return res.status(400).json({
        success: false,
        message: 'Parameters simpang_id and date are required',
        example: '/api/traffic-matrix/by-hours?simpang_id=2&date=2025-03-28'
      });
    }
    
    const result = await TrafficMatrix.getTrafficMatrixByFilter(simpang_id, date, '1hour');
    
    const timePeriodInfo = {
      'Dini Hari': '00:00 - 05:59',
      'Pagi Hari': '06:00 - 11:59',
      'Siang Hari': '12:00 - 14:59',
      'Sore Hari': '15:00 - 17:59',
      'Malam Hari': '18:00 - 23:59'
    };
    
    res.status(200).json({
      success: true,
      message: 'Traffic matrix by hours retrieved successfully',
      data: {
        simpang_id: simpang_id,
        date: date,
        interval: '1hour',
        timePeriods: timePeriodInfo,
        slots: result
      }
    });
  } catch (error) {
    console.error(`[ERROR] getTrafficMatrixByHours:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ BONUS: Get 5-minute traffic matrix
// Query: GET /api/traffic-matrix/by-5min?simpang_id=2&date=2025-03-28
exports.getTrafficMatrixBy5Min = async (req, res) => {
  try {
    const { simpang_id, date } = req.query;
    
    if (!simpang_id || !date) {
      return res.status(400).json({
        success: false,
        message: 'Parameters simpang_id and date are required',
        example: '/api/traffic-matrix/by-5min?simpang_id=2&date=2025-03-28'
      });
    }
    
    const result = await TrafficMatrix.getTrafficMatrixByFilter(simpang_id, date, '5min');
    
    const timePeriodInfo = {
      'Dini Hari': '00:00 - 05:59',
      'Pagi Hari': '06:00 - 11:59',
      'Siang Hari': '12:00 - 14:59',
      'Sore Hari': '15:00 - 17:59',
      'Malam Hari': '18:00 - 23:59'
    };
    
    res.status(200).json({
      success: true,
      message: 'Traffic matrix by 5 minutes retrieved successfully',
      data: {
        simpang_id: simpang_id,
        date: date,
        interval: '5min',
        timePeriods: timePeriodInfo,
        slotCount: Object.keys(result).length,
        slots: result
      }
    });
  } catch (error) {
    console.error(`[ERROR] getTrafficMatrixBy5Min:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ BONUS: Get 10-minute traffic matrix
// Query: GET /api/traffic-matrix/by-10min?simpang_id=2&date=2025-03-28
exports.getTrafficMatrixBy10Min = async (req, res) => {
  try {
    const { simpang_id, date } = req.query;
    
    if (!simpang_id || !date) {
      return res.status(400).json({
        success: false,
        message: 'Parameters simpang_id and date are required',
        example: '/api/traffic-matrix/by-10min?simpang_id=2&date=2025-03-28'
      });
    }
    
    const result = await TrafficMatrix.getTrafficMatrixByFilter(simpang_id, date, '10min');
    
    const timePeriodInfo = {
      'Dini Hari': '00:00 - 05:59',
      'Pagi Hari': '06:00 - 11:59',
      'Siang Hari': '12:00 - 14:59',
      'Sore Hari': '15:00 - 17:59',
      'Malam Hari': '18:00 - 23:59'
    };
    
    res.status(200).json({
      success: true,
      message: 'Traffic matrix by 10 minutes retrieved successfully',
      data: {
        simpang_id: simpang_id,
        date: date,
        interval: '10min',
        timePeriods: timePeriodInfo,
        slotCount: Object.keys(result).length,
        slots: result
      }
    });
  } catch (error) {
    console.error(`[ERROR] getTrafficMatrixBy10Min:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ BONUS: Get 30-minute traffic matrix
// Query: GET /api/traffic-matrix/by-30min?simpang_id=2&date=2025-03-28
exports.getTrafficMatrixBy30Min = async (req, res) => {
  try {
    const { simpang_id, date } = req.query;
    
    if (!simpang_id || !date) {
      return res.status(400).json({
        success: false,
        message: 'Parameters simpang_id and date are required',
        example: '/api/traffic-matrix/by-30min?simpang_id=2&date=2025-03-28'
      });
    }
    
    const result = await TrafficMatrix.getTrafficMatrixByFilter(simpang_id, date, '30min');
    
    const timePeriodInfo = {
      'Dini Hari': '00:00 - 05:59',
      'Pagi Hari': '06:00 - 11:59',
      'Siang Hari': '12:00 - 14:59',
      'Sore Hari': '15:00 - 17:59',
      'Malam Hari': '18:00 - 23:59'
    };
    
    res.status(200).json({
      success: true,
      message: 'Traffic matrix by 30 minutes retrieved successfully',
      data: {
        simpang_id: simpang_id,
        date: date,
        interval: '30min',
        timePeriods: timePeriodInfo,
        slotCount: Object.keys(result).length,
        slots: result
      }
    });
  } catch (error) {
    console.error(`[ERROR] getTrafficMatrixBy30Min:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
