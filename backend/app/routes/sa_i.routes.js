const saIController = require("../controllers/sa_i.controller.js");
var router = require("express").Router();

// =====================================================
// SA-I COMPLETE SURVEY ROUTES (Phase 2 - 3 APIs)
// =====================================================

// Create a complete SA-I survey
router.post("/", saIController.createCompleteSurvey);

// Get complete SA-I survey with all related data
router.get("/:surveyId", saIController.getCompleteSurvey);

// Update a complete SA-I survey
router.put("/:surveyId", saIController.updateCompleteSurvey);

module.exports = router; 