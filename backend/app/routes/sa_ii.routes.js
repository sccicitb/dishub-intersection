const saIIController = require("../controllers/sa_ii.controller.js");
var router = require("express").Router();

// =====================================================
// SA-II COMPLETE SURVEY ROUTES (Phase 3 - 4 APIs)
// =====================================================

// Create a complete SA-II survey
router.post("/", saIIController.createCompleteSurvey);

// Get complete SA-II survey with all related data
router.get("/:surveyId", saIIController.getCompleteSurvey);

// Update a complete SA-II survey
router.put("/:surveyId", saIIController.updateCompleteSurvey);

// =====================================================
// EMP CONFIGURATION ROUTES
// =====================================================

// Get EMP configurations
router.get("/emp-configurations", saIIController.getEMPConfigurations);

module.exports = router; 