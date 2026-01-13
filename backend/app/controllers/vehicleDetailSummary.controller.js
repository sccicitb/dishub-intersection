const VehicleDetailSummary = require("../models/vehicleDetailSummary.model.js");

const simpangMap = {
  5: 'tempel',
  2: 'prambanan',
  4: 'piyungan',
  3: 'glagah',
};

// Get detailed masuk/keluar by arah and vehicle type for a single simpang
exports.getMasukKeluarDetailBySimpang = (req, res) => {
  const simpang_id = req.query.simpang_id;
  const date = req.query.date;

  // Validate required parameters
  if (!simpang_id) {
    return res.status(400).json({
      status: "error",
      message: "simpang_id query parameter is required"
    });
  }

  if (!date) {
    return res.status(400).json({
      status: "error",
      message: "date query parameter is required in YYYY-MM-DD format"
    });
  }

  VehicleDetailSummary.getMasukKeluarDetailBySimpang(simpang_id, date, (err, data) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: err.message || "Error retrieving vehicle detail summary"
      });
    }

    res.json({
      status: "ok",
      simpang_id: simpang_id,
      date: date,
      data: data
    });
  });
};

// Get detailed masuk/keluar by arah and vehicle type for multiple simpangs
exports.getMasukKeluarDetailBySimpangs = (req, res) => {
  const simpang_ids = req.query.simpang_ids; // Comma-separated string like "2,3,4,5"
  const date = req.query.date;

  // Validate required parameters
  if (!simpang_ids) {
    return res.status(400).json({
      status: "error",
      message: "simpang_ids query parameter is required (comma-separated, e.g., 2,3,4,5)"
    });
  }

  if (!date) {
    return res.status(400).json({
      status: "error",
      message: "date query parameter is required in YYYY-MM-DD format"
    });
  }

  // Parse comma-separated IDs
  const idsArray = simpang_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

  if (idsArray.length === 0) {
    return res.status(400).json({
      status: "error",
      message: "Invalid simpang_ids format. Use comma-separated integers (e.g., 2,3,4,5)"
    });
  }

  VehicleDetailSummary.getMasukKeluarDetailBySimpangs(idsArray, date, (err, data) => {
    if (err) {

      return res.status(500).json({
        status: "error",
        message: err.message || "Error retrieving vehicle detail summary"
      });
    }

    res.json({
      status: "ok",
      simpang_ids: idsArray,
      date: date,
      data: data
    });
  });
};

// Get detailed masuk/keluar by arah with 30-minute intervals
exports.getMasukKeluarDetailBy30Min = async (req, res) => {
  try {
    const simpang_id = req.query.simpang_id;
    const date = req.query.date;
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;

    // Validate required parameters
    if (!simpang_id) {
      return res.status(400).json({
        status: "error",
        message: "simpang_id query parameter is required (use 'semua' for all simpangs)"
      });
    }

    // Check if either date or date range is provided
    if (!date && (!start_date || !end_date)) {
      return res.status(400).json({
        status: "error",
        message: "Either 'date' or both 'start_date' and 'end_date' are required in YYYY-MM-DD format"
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (date && !dateRegex.test(date)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format. Use YYYY-MM-DD format"
      });
    }

    if (start_date && !dateRegex.test(start_date)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid start_date format. Use YYYY-MM-DD format"
      });
    }

    if (end_date && !dateRegex.test(end_date)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid end_date format. Use YYYY-MM-DD format"
      });
    }

    const result = await VehicleDetailSummary.getMasukKeluarDetailBy30Min(simpang_id, date, start_date, end_date);

    const displaySimpangId = simpang_id === 'semua' ? 'semua' : parseInt(simpang_id);

    const response = {
      status: "ok",
      simpang_id: displaySimpangId,
      slots: result
    };

    if (date) {
      response.date = date;
    } else {
      response.start_date = start_date;
      response.end_date = end_date;
    }

    res.json(response);
  } catch (error) {
    console.error("Error getting detail summary by 30min:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error retrieving vehicle detail summary by 30min"
    });
  }
};

// Get detailed masuk/keluar by arah with hourly intervals
exports.getMasukKeluarDetailByHour = async (req, res) => {
  try {
    const simpang_id = req.query.simpang_id;
    const date = req.query.date;
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;

    // Validate required parameters
    if (!simpang_id) {
      return res.status(400).json({
        status: "error",
        message: "simpang_id query parameter is required (use 'semua' for all simpangs)"
      });
    }

    // Check if either date or date range is provided
    if (!date && (!start_date || !end_date)) {
      return res.status(400).json({
        status: "error",
        message: "Either 'date' or both 'start_date' and 'end_date' are required in YYYY-MM-DD format"
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (date && !dateRegex.test(date)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format. Use YYYY-MM-DD format"
      });
    }

    if (start_date && !dateRegex.test(start_date)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid start_date format. Use YYYY-MM-DD format"
      });
    }

    if (end_date && !dateRegex.test(end_date)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid end_date format. Use YYYY-MM-DD format"
      });
    }

    const result = await VehicleDetailSummary.getMasukKeluarDetailByHour(simpang_id, date, start_date, end_date);

    const displaySimpangId = simpang_id === 'semua' ? 'semua' : parseInt(simpang_id);

    const response = {
      status: "ok",
      simpang_id: displaySimpangId,
      slots: result
    };

    if (date) {
      response.date = date;
    } else {
      response.start_date = start_date;
      response.end_date = end_date;
    }

    res.json(response);
  } catch (error) {
    console.error("Error getting detail summary by hour:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error retrieving vehicle detail summary by hour"
    });
  }
};
