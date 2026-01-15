const VehicleDetailByTime = require("../models/vehicleDetailByTime.model.js");

// Get detailed masuk/keluar by time intervals for a single simpang
exports.getMasukKeluarDetailByTime = (req, res) => {
  const simpang_id = req.query.simpang_id;
  const date = req.query.date;
  const interval = req.query.interval || '1hour';

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

  VehicleDetailByTime.getMasukKeluarDetailByTime(simpang_id, date, interval, (err, data) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: err.message || "Error retrieving vehicle detail summary"
      });
    }

    res.json({
      status: "ok",
      data: data
    });
  });
};

// Shorthand endpoints
exports.getMasukKeluarDetailBy5Min = (req, res) => {
  const simpang_id = req.query.simpang_id;
  const date = req.query.date;

  VehicleDetailByTime.getMasukKeluarDetailByTime(simpang_id, date, '5min', (err, data) => {
    if (err) {
      console.error('[ERROR] getMasukKeluarDetailBy5Min:', err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Error retrieving vehicle detail summary"
      });
    }

    res.json({
      status: "ok",
      data: data
    });
  });
};

exports.getMasukKeluarDetailBy15Min = (req, res) => {
  const simpang_id = req.query.simpang_id;
  const date = req.query.date;

  VehicleDetailByTime.getMasukKeluarDetailByTime(simpang_id, date, '15min', (err, data) => {
    if (err) {
      console.error('[ERROR] getMasukKeluarDetailBy15Min:', err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Error retrieving vehicle detail summary"
      });
    }

    res.json({
      status: "ok",
      data: data
    });
  });
};

exports.getMasukKeluarDetailBy30Min = (req, res) => {
  const simpang_id = req.query.simpang_id;
  const date = req.query.date;

  VehicleDetailByTime.getMasukKeluarDetailByTime(simpang_id, date, '30min', (err, data) => {
    if (err) {
      console.error('[ERROR] getMasukKeluarDetailBy30Min:', err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Error retrieving vehicle detail summary"
      });
    }

    res.json({
      status: "ok",
      data: data
    });
  });
};

exports.getMasukKeluarDetailByHour = (req, res) => {
  const simpang_id = req.query.simpang_id;
  const date = req.query.date;

  VehicleDetailByTime.getMasukKeluarDetailByTime(simpang_id, date, '1hour', (err, data) => {
    if (err) {
      console.error('[ERROR] getMasukKeluarDetailByHour:', err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Error retrieving vehicle detail summary"
      });
    }

    res.json({
      status: "ok",
      data: data
    });
  });
};
