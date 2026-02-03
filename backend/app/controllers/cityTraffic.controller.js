const CityTraffic = require("../models/cityTraffic.model");

// Get city traffic (masuk/keluar kota) summary by interval
exports.getCityTrafficSummary = async (req, res) => {
  try {
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

    const result = await CityTraffic.getCityTrafficSummary(
      simpang_id,
      date,
      interval
    );

    res.json({
      status: "ok",
      data: result
    });
  } catch (error) {
    console.error("Error getting city traffic summary:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error retrieving city traffic summary"
    });
  }
};
