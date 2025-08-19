const saIIController = require("../controllers/sa_ii.controller.js");
var router = require("express").Router();

// =====================================================
// SA-II COMPLETE SURVEY ROUTES (Phase 3 - 4 APIs)
// =====================================================

// Create a complete SA-II survey
router.post("/", saIIController.createCompleteSurvey);

// =====================================================
// EMP CONFIGURATION ROUTES
// =====================================================

// Get EMP configurations
router.get("/emp-configurations", saIIController.getEMPConfigurations);

// =====================================================
// SURVEY ROUTES
// =====================================================

// Get complete SA-II survey with all related data
router.get("/:surveyId", saIIController.getCompleteSurvey);

// =====================================================
// SA-II ARUS KENDARAAN ROUTES (Requirements.md lines 158-197)
// =====================================================

// Get aggregated vehicle data for SA-II Arus Kendaraan
router.get("/:surveyId/arus-kendaraan", saIIController.getArusKendaraan);

// Update a complete SA-II survey
router.put("/:surveyId", saIIController.updateCompleteSurvey);

module.exports = router; 