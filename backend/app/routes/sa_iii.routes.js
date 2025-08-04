const saIIIController = require("../controllers/sa_iii.controller.js");
var router = require("express").Router();

// =====================================================
// SA-III COMPLETE SURVEY ROUTES (Phase 4 - 3 APIs)
// =====================================================

// Create a complete SA-III survey
router.post("/", saIIIController.createCompleteSurvey);

// Get complete SA-III survey with all related data
router.get("/:surveyId", saIIIController.getCompleteSurvey);

// Update a complete SA-III survey
router.put("/:surveyId", saIIIController.updateCompleteSurvey);

module.exports = router; 