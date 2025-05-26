// app/routes/survey.routes.js
const surveyController = require('../controllers/survey.controller');

module.exports = (app) => {
  app.get('/api/surveys/hourly-summary', surveyController.getHourlySummary);
  app.get('/api/surveys/export-vehicle', surveyController.exportVehicleData);
};
