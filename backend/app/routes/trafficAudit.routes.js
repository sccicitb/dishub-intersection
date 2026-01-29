module.exports = app => {
  const trafficAudit = require("../controllers/trafficAudit.controller.js");
  const WeeklyAuditController = require("../controllers/WeeklyAudit.controller.js");
  const DailyAuditController = require('../controllers/dailyAuditController');

  var router = require("express").Router();
  router.get("/volume-audit", trafficAudit.getVolumeByDirectionStatus);
  router.get('/volume-weekday', WeeklyAuditController.getAuditByWeekday);
  router.get('/volume-daily', DailyAuditController.getAuditByMonth);
  app.use('/api/audit', router);
};
