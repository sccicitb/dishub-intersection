module.exports = app => {
  const Vehicles = require("../controllers/vehicle.controller.js");

  var router = require("express").Router();
  
  // Import authentication and role middleware
  const { authenticateToken } = require('../middleware/auth.middleware');
  const { requireViewerOrHigher } = require('../middleware/role.middleware');

  // Vehicle Analytics & Reports - Viewer+ access for all endpoints
  router.get("/", authenticateToken, requireViewerOrHigher, Vehicles.findAll);

  // No Auth - API
  // router.get("/getChartMasukKeluar", authenticateToken, requireViewerOrHigher, Vehicles.getChartMasukKeluar);
  router.get("/getChartMasukKeluar", Vehicles.getChartMasukKeluar);
  // router.get("/getGroupTipeKendaraan", authenticateToken, requireViewerOrHigher, Vehicles.getGroupTipeKendaraan);
  router.get("/getGroupTipeKendaraan", Vehicles.getGroupTipeKendaraan);
  // router.get("/getMasukKeluarByArah", authenticateToken, requireViewerOrHigher, Vehicles.getMasukKeluarByArah);
  router.get("/getMasukKeluarByArah", Vehicles.getMasukKeluarByArah);
  // router.get("/getRataPerJam", authenticateToken, requireViewerOrHigher, Vehicles.getRataPerJam);
  router.get("/getRataPerJam", Vehicles.getRataPerJam);
  // router.get("/getRataPer15Menit", authenticateToken, requireViewerOrHigher, Vehicles.getRataPer15Menit);
  router.get("/getRataPer15Menit", Vehicles.getRataPer15Menit);

  // =====================================================
  // TRAFFIC MATRIX ROUTES (NEW)
  // =====================================================

  // Get complete traffic matrix (asal-tujuan + arah pergerakan)
  router.get("/traffic-matrix", Vehicles.getTrafficMatrix);

  app.use('/api/vehicles', router);
};
