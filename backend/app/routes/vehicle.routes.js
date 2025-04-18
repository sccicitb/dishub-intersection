module.exports = app => {
  const Vehicles = require("../controllers/vehicle.controller.js");

  var router = require("express").Router();

  // Retrieve all Vehicles
  router.get("/", Vehicles.findAll);
  router.get("/getChartMasukKeluar", Vehicles.getChartMasukKeluar);
  router.get("/getGroupTipeKendaraan", Vehicles.getGroupTipeKendaraan);
  router.get("/getMasukKeluarByArah", Vehicles.getMasukKeluarByArah);
  router.get("/getRataPerJam", Vehicles.getRataPerJam);
  router.get("/getRataPer15Menit", Vehicles.getRataPer15Menit);

  app.use('/api/vehicles', router);
};
