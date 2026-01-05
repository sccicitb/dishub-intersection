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
exports.getTrafficMatrix = async (req, res) => {
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
    
    // Get complete traffic matrix using Vehicle model
    const result = await Vehicle.getCompleteTrafficMatrix(simpang_id, start_date, end_date);
    
    // Return success response with both matrices
    res.json({
      success: true,
      message: "Traffic matrix retrieved successfully",
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
    console.error("Error getting traffic matrix:", error);
    res.status(500).json({
      success: false,
      message: `Error retrieving traffic matrix: ${error.message}`
    });
  }
};


