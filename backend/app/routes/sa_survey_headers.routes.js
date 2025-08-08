const express = require('express');
const router = express.Router();
const saSurveyHeaderController = require('../controllers/sa_survey_header.controller.js');

// Create a new survey header
router.post('/header', saSurveyHeaderController.createHeader);

// Retrieve all survey headers
router.get('/header', saSurveyHeaderController.getAllHeaders);

// Find a single survey header with id
router.get('/header/:id', saSurveyHeaderController.getHeaderById);

// Update a survey header
router.put('/header/:id', saSurveyHeaderController.updateHeader);

// Delete a survey header
router.delete('/header/:id', saSurveyHeaderController.deleteHeader);

// Get all forms for a specific header
router.get('/header/:id/forms', saSurveyHeaderController.getFormsByHeaderId);

module.exports = router; 