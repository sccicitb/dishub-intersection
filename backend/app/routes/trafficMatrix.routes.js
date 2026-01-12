module.exports = app => {
  const TrafficMatrix = require("../controllers/trafficMatrix.controller.js");

  var router = require("express").Router();

  // =====================================================
  // TRAFFIC MATRIX WITH FLEXIBLE TIME INTERVAL FILTERS
  // =====================================================

  // Main endpoint - accepts interval parameter (5min, 10min, 30min, 1hour - default: 1hour)
  // GET /api/traffic-matrix/by-filter?simpang_id=2&date=2025-03-28&interval=5min
  router.get("/by-filter", TrafficMatrix.getTrafficMatrixByFilter);

  // Shorthand endpoints for specific intervals
  // GET /api/traffic-matrix/by-hours?simpang_id=2&date=2025-03-28
  router.get("/by-hours", TrafficMatrix.getTrafficMatrixByHours);

  // GET /api/traffic-matrix/by-5min?simpang_id=2&date=2025-03-28
  router.get("/by-5min", TrafficMatrix.getTrafficMatrixBy5Min);

  // GET /api/traffic-matrix/by-10min?simpang_id=2&date=2025-03-28
  router.get("/by-10min", TrafficMatrix.getTrafficMatrixBy10Min);

  // GET /api/traffic-matrix/by-30min?simpang_id=2&date=2025-03-28
  router.get("/by-30min", TrafficMatrix.getTrafficMatrixBy30Min);

  app.use('/api/traffic-matrix', router);
};
