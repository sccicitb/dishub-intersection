const saSurveys = require("../controllers/sa_survey.controller.js");
var router = require("express").Router();

// Create a new Survey
router.post("/", saSurveys.create);

// Retrieve all Surveys (with optional filters)
router.get("/", saSurveys.findAll);

// Retrieve a single Survey by ID (using query parameter)
router.get("/survey", saSurveys.findOne);

// Update a Survey by ID (using query parameter)
router.put("/survey", saSurveys.update);

// Delete a Survey by ID (using query parameter)
router.delete("/survey", saSurveys.delete);

module.exports = router; 