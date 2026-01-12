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
      console.error('[ERROR] getMasukKeluarDetailBySimpang:', err);
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
      console.error('[ERROR] getMasukKeluarDetailBySimpangs:', err);
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
