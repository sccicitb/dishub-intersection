module.exports = app => {
  const trafficAudit = require("../controllers/trafficAudit.controller.js");
  const WeeklyAuditController = require("../controllers/WeeklyAudit.controller.js");
  const DailyAuditController = require('../controllers/dailyAuditController');
  const TrafficVolumeController = require("../controllers/trafficVolume.controller.js");

  var router = require("express").Router();
  router.get("/volume-audit", trafficAudit.getVolumeByDirectionStatus);
  router.get('/volume-weekday', WeeklyAuditController.getAuditByWeekday);
  router.get('/volume-daily', DailyAuditController.getAuditByMonth);
  
  // New route for volume stats by minute
  router.get('/volume-stats', TrafficVolumeController.getVolumeStats);

  app.use('/api/audit', router);
};
