// app/routes/survey.routes.js
const surveyController = require('../controllers/survey.controller');

module.exports = (app) => {
  app.get('/api/surveys/data-summary', surveyController.getVehicleSummaryData);
  app.get('/api/surveys/export-vehicle', surveyController.exportVehicleData);
};
