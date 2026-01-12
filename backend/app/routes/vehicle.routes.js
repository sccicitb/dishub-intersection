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

  // Get traffic matrix with vehicle categories breakdown
  router.get("/traffic-matrix-by-category", Vehicles.getTrafficMatrixByCategory);

  // =====================================================
  // RAW DATA ROUTES (NEW)
  // =====================================================

  // Get raw arus data with pagination
  router.get("/raw-data", Vehicles.getRawArusData);

  // =====================================================
  // TRAFFIC MATRIX BY TIME PERIODS (NEW)
  // =====================================================

  // Get traffic matrix by time periods (Dini Hari, Pagi, Siang, Sore, Malam)
  router.get("/traffic-matrix-by-periods", Vehicles.getTrafficMatrixByTimePeriods);

  // Get traffic matrix by hours (00:00-01:00, 01:00-02:00, ..., 23:00-23:59)
  router.get("/traffic-matrix-by-hours", Vehicles.getTrafficMatrixByHours);

  app.use('/api/vehicles', router);
};
