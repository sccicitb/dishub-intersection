const Vehicle = require("../models/vehicle.model.js");

const { getArusStatus, countArus } = require("../helpers/arus");

const simpangMap = {
  5: 'tempel',
  2: 'prambanan',
  4: 'piyungan',
  3: 'glagah',
};

exports.findAll = (req, res) => {
  Vehicle.getAll((err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err.message || "Some error occurred while retrieving data.",
      });
    } else {
      res.send({
        status: "ok",
        data: data,
      });
    }
  });
};

exports.getChartMasukKeluar = (req, res) => {
  const filter = req.query.filter || 'day'; // Get filter from query params
  const simpang = req.query.simpang || 'semua'; // Get simpang from query params (default: semua)
  const startDate = req.query['start-date']; // Get start-date for customrange
  const endDate = req.query['end-date']; // Get end-date for customrange
  
  Vehicle.getChartMasukKeluar((err, data) => {
    if (err) {
      return res.status(500).send({
        status: "error",
        message: err.message || "Some error occurred while retrieving data.",
      });
    }

    const enriched = data.map((item) => {
      const simpangName = simpangMap[item.ID_Simpang] || 'unknown';
      const status = getArusStatus(simpangName, item.dari_arah, item.ke_arah);
      return {
        ...item,
      };
    });

    const { totalIN, totalOUT } = countArus(enriched, simpangMap);

    res.send({
      status: "ok",
      data: enriched,
    });
  }, filter, simpang, startDate, endDate);
};

exports.getGroupTipeKendaraan = (req, res) => {
  const filter = req.query.filter || 'day'; // Get filter from query params
  const simpang = req.query.simpang || 'semua'; // Get simpang from query params (default: semua)
  const startDate = req.query['start-date']; // Get start-date for customrange
  const endDate = req.query['end-date']; // Get end-date for customrange
  
  Vehicle.getGroupTipeKendaraan((err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err.message || "Some error occurred while retrieving data.",
      });
    } else {
      res.send({
        status: "ok",
        data: data,
      });
    }
  }, filter, simpang, startDate, endDate);
};

exports.getMasukKeluarByArah = (req, res) => {
  const filter = req.query.filter || 'day'; // Get filter from query params
  const simpang = req.query.simpang || 'semua'; // Get simpang from query params (default: semua)
  const startDate = req.query['start-date']; // Get start-date for customrange
  const endDate = req.query['end-date']; // Get end-date for customrange
  
  Vehicle.getMasukKeluarByArah((err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err.message || "Some error occurred while retrieving data.",
      });
    } else {
      res.send({
        status: "ok",
        data: data,
      });
    }
  }, filter, simpang, startDate, endDate);
};

exports.getRataPerJam = (req, res) => {
  const filter = req.query.filter || 'day'; // Get filter from query params
  
  Vehicle.getRataPerJam((err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err.message || "Some error occurred while retrieving data.",
      });
    } else {
      res.send({
        status: "ok",
        data: data,
      });
    }
  }, filter);
};

exports.getRataPer15Menit = (req, res) => {
  const filter = req.query.filter || 'day'; // Get filter from query params
  const simpang = req.query.simpang || 'semua'; // Get simpang from query params (default: semua)
  const startDate = req.query['start-date']; // Get start-date for customrange
  const endDate = req.query['end-date']; // Get end-date for customrange
  
  Vehicle.getRataPer15Menit((err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err.message || "Some error occurred while retrieving data.",
      });
    } else {
      res.send({
        status: "ok",
        data: data,
      });
    }
  }, filter, simpang, startDate, endDate);
};

// =====================================================
// TRAFFIC MATRIX OPERATIONS (NEW)
// =====================================================

// Get complete traffic matrix (asal-tujuan + arah pergerakan)
// Support simpang_id=semua to aggregate all simpangs
// Support flexible filtering: day, week, month, quarter, year, or customrange
exports.getTrafficMatrix = async (req, res) => {
  try {
    const { simpang_id } = req.query;
    const filter = req.query.filter || 'day';
    const startDate = req.query['start-date'];
    const endDate = req.query['end-date'];
    
    // Validate required parameters
    if (!simpang_id) {
      return res.status(400).json({
        success: false,
        message: "simpang_id is required (use 'semua' for all simpangs)"
      });
    }
    
    // For customrange filter, validate dates are provided
    if (filter === 'customrange') {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "customrange filter requires both start-date and end-date (format: YYYY-MM-DD)"
        });
      }
      
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD"
        });
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        return res.status(400).json({
          success: false,
          message: "start-date cannot be after end-date"
        });
      }
    }
    
    // Get complete traffic matrix using Vehicle model
    const result = await Vehicle.getCompleteTrafficMatrix(simpang_id, filter, startDate, endDate);
    
    // Return success response with both matrices
    const displaySimpangId = simpang_id === 'semua' ? 'semua' : parseInt(simpang_id);
    
    res.json({
      success: true,
      message: "Traffic matrix retrieved successfully",
      data: {
        simpang_id: displaySimpangId,
        filter: filter,
        start_date: startDate || null,
        end_date: endDate || null,
        asalTujuan: result.asalTujuan,
        arahPergerakan: result.arahPergerakan
      }
    });
    
  } catch (error) {
    console.error("Error getting traffic matrix:", error);
    res.status(500).json({
      success: false,
      message: `Error retrieving traffic matrix: ${error.message}`
    });
  }
};

// ✅ NEW: Get traffic matrix with vehicle categories breakdown
// Response includes asal-tujuan matrix and arah pergerakan based on vehicle categories
exports.getTrafficMatrixByCategory = async (req, res) => {
  try {
    const { simpang_id, start_date, end_date } = req.query;
    
    // Validate required parameters
    if (!simpang_id) {
      return res.status(400).json({
        success: false,
        message: "simpang_id is required"
      });
    }
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "start_date and end_date are required (format: YYYY-MM-DD)"
      });
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }
    
    // Validate date range
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "start_date cannot be after end_date"
      });
    }
    
    // Get traffic matrix with vehicle category breakdown
    const result = await Vehicle.getCompleteTrafficMatrixByCategory(simpang_id, start_date, end_date);
    
    // Return success response with vehicle categories in arahPergerakan
    res.json({
      success: true,
      message: "Traffic matrix by vehicle category retrieved successfully",
      data: {
        simpang_id: parseInt(simpang_id),
        date_range: {
          start_date: start_date,
          end_date: end_date
        },
        asalTujuan: result.asalTujuan,
        arahPergerakan: result.arahPergerakan
      }
    });
    
  } catch (error) {
    console.error("Error getting traffic matrix by category:", error);
    res.status(500).json({
      success: false,
      message: `Error retrieving traffic matrix by category: ${error.message}`
    });
  }
};
// ✅ NEW: Get raw data from arus table with pagination and filtering
exports.getRawArusData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const simpang_id = req.query.simpang_id;
    const filter = req.query.filter || 'day';
    const startDate = req.query['start-date'];
    const endDate = req.query['end-date'];
    
    // Validate page and limit
    if (page < 1 || limit < 1 || limit > 1000) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit. Page must be >= 1, limit must be 1-1000"
      });
    }
    
    // For customrange filter, validate dates
    if (filter === 'customrange') {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "customrange filter requires both start-date and end-date (format: YYYY-MM-DD)"
        });
      }
      
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD"
        });
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        return res.status(400).json({
          success: false,
          message: "start-date cannot be after end-date"
        });
      }
    }
    
    // Build filters object
    const filters = {};
    if (simpang_id && simpang_id !== 'semua') {
      filters.simpang_id = simpang_id;
    }
    filters.filter = filter;
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    
    // Get raw data with pagination
    const result = await Vehicle.getRawArusData(page, limit, filters);
    
    res.json({
      success: true,
      message: "Raw arus data retrieved successfully",
      pagination: {
        page: page,
        limit: limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      },
      filters: {
        simpang_id: simpang_id || 'semua',
        filter: filter,
        start_date: startDate || null,
        end_date: endDate || null
      },
      data: result.data
    });
    
  } catch (error) {
    console.error("Error getting raw arus data:", error);
    res.status(500).json({
      success: false,
      message: `Error retrieving raw arus data: ${error.message}`
    });
  }
};

// ✅ NEW: Get traffic matrix by time periods (Dini Hari, Pagi, Siang, Sore, Malam)
exports.getTrafficMatrixByTimePeriods = async (req, res) => {
  try {
    const { simpang_id, date } = req.query;
    
    // Validate required parameters
    if (!simpang_id) {
      return res.status(400).json({
        success: false,
        message: "simpang_id is required (use 'semua' for all simpangs)"
      });
    }
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date is required (format: YYYY-MM-DD)"
      });
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }
    
    // Get traffic matrix by time periods
    const result = await Vehicle.getTrafficMatrixByTimePeriods(simpang_id, date);
    
    // Return success response with time periods breakdown
    const displaySimpangId = simpang_id === 'semua' ? 'semua' : parseInt(simpang_id);
    
    res.json({
      success: true,
      message: "Traffic matrix by time periods retrieved successfully",
      data: {
        simpang_id: displaySimpangId,
        date: date,
        arahPergerakanByPeriod: result
      }
    });
    
  } catch (error) {
    console.error("Error getting traffic matrix by time periods:", error);
    res.status(500).json({
      success: false,
      message: `Error retrieving traffic matrix by time periods: ${error.message}`
    });
  }
};

// ✅ NEW: Get traffic matrix by hours (00:00-01:00, 01:00-02:00, ..., 23:00-23:59)
exports.getTrafficMatrixByHours = async (req, res) => {
  try {
    const { simpang_id, date } = req.query;
    
    // Validate required parameters
    if (!simpang_id) {
      return res.status(400).json({
        success: false,
        message: "simpang_id is required (use 'semua' for all simpangs)"
      });
    }
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date is required (format: YYYY-MM-DD)"
      });
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }
    
    // Get traffic matrix by hours
    const result = await Vehicle.getTrafficMatrixByHours(simpang_id, date);
    
    // Return success response with hourly breakdown
    const displaySimpangId = simpang_id === 'semua' ? 'semua' : parseInt(simpang_id);
    
    res.json({
      success: true,
      message: "Traffic matrix by hours retrieved successfully",
      data: {
        simpang_id: displaySimpangId,
        date: date,
        arahPergerakanByHour: result
      }
    });
    
  } catch (error) {
    console.error("Error getting traffic matrix by hours:", error);
    res.status(500).json({
      success: false,
      message: `Error retrieving traffic matrix by hours: ${error.message}`
    });
  }
};
