const trafficVolume = require("../controllers/trafficVolume.controller.js");
const router = require("express").Router();

// Retrieve traffic volume stats
// Example: GET /api/traffic-volume?startDate=2026-01-29 00:00:00&endDate=2026-01-29 23:59:59
router.get("/", trafficVolume.getVolumeStats);

module.exports = router;
  