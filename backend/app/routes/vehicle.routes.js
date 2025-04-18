module.exports = app => {
  const Vehicles = require("../controllers/vehicle.controller.js");

  var router = require("express").Router();

  // Retrieve all Vehicles
  router.get("/", Vehicles.findAll);
  router.get("/getChartMasukKeluar", Vehicles.getChartMasukKeluar);

  app.use('/api/vehicles', router);
};
