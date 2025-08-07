const saIVController = require("../controllers/sa_iv.controller.js");
var router = require("express").Router();

// Create complete SA-IV survey
router.post("/", saIVController.createCompleteSurvey);

// Get complete SA-IV survey
router.get("/:surveyId", saIVController.getCompleteSurvey);

// Update complete SA-IV survey
router.put("/:surveyId", saIVController.updateCompleteSurvey);

// Get calculation configuration
router.get("/config/:simpangId", saIVController.getCalculationConfig);

module.exports = router; 