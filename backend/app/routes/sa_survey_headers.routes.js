const express = require('express');
const router = express.Router();
const saSurveyHeaderController = require('../controllers/sa_survey_header.controller.js');

// Create a new survey header
router.post('/headers', saSurveyHeaderController.createHeader);

// Retrieve all survey headers
router.get('/headers', saSurveyHeaderController.getAllHeaders);

// Find a single survey header with id
router.get('/headers/:id', saSurveyHeaderController.getHeaderById);

// Update a survey header
router.put('/headers/:id', saSurveyHeaderController.updateHeader);

// Delete a survey header
router.delete('/headers/:id', saSurveyHeaderController.deleteHeader);

// Get all forms for a specific header
router.get('/headers/:id/forms', saSurveyHeaderController.getFormsByHeaderId);

// Add form data to existing header
router.post('/headers/:id/forms', saSurveyHeaderController.addFormToHeader);

module.exports = router; 