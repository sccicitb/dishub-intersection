const saVController = require("../controllers/sa_v.controller.js");
var router = require("express").Router();

// =====================================================
// SA-V COMPLETE SURVEY ROUTES (Phase 6 - 3 APIs)
// =====================================================

// Create a complete SA-V survey
router.post("/", saVController.createCompleteSurvey);

// Get complete SA-V survey with all related data
router.get("/:surveyId", saVController.getCompleteSurvey);

// Update a complete SA-V survey
router.put("/:surveyId", saVController.updateCompleteSurvey);

module.exports = router; 