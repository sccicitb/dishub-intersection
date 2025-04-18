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
  });
};

exports.getGroupTipeKendaraan = (req, res) => {
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
  });
};

exports.getMasukKeluarByArah = (req, res) => {
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
  });
};


