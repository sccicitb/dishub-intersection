const Vehicle = require("../models/Vehicle.model.js");

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

