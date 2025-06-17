const Vehicle = require("../models/vehicle.model.js");

const { getArusStatus, countArus } = require("../helpers/arus");

const simpangMap = {
  2: 'prambanan',    // handles east AND south directions
  3: 'glagah',       // handles west direction  
  5: 'tempel',       // handles north direction
  7: 'piyungan',     // handles east direction
  // Note: ID_Simpang = 1 (Simpang Utara) is inactive - no cameras, no data
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
  
  Vehicle.getChartMasukKeluar((err, data) => {
    if (err) {
      return res.status(500).send({
        status: "error",
        message: err.message || "Some error occurred while retrieving data.",
      });
    }

    const enriched = data.map((item) => {
      const simpang = simpangMap[item.ID_Simpang] || 'unknown';
      const status = getArusStatus(simpang, item.dari_arah, item.ke_arah);
      return {
        ...item,
      };
    });

    const { totalIN, totalOUT } = countArus(enriched, simpangMap);

    res.send({
      status: "ok",
      data: enriched,
    });
  }, filter);
};

exports.getGroupTipeKendaraan = (req, res) => {
  const filter = req.query.filter || 'day'; // Get filter from query params
  
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
  }, filter);
};

exports.getMasukKeluarByArah = (req, res) => {
  const filter = req.query.filter || 'day'; // Get filter from query params
  
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
  }, filter);
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
  }, filter);
};


