// app/routes/survey.routes.js
const surveyController = require('../controllers/survey.controller');

module.exports = (app) => {
  // Import authentication and role middleware
  const { authenticateToken } = require('../middleware/auth.middleware');
  const { requireViewerOrHigher, requireOperatorOrAdmin } = require('../middleware/role.middleware');

  // Survey Data & Analytics - Viewer+ for read, Operator+ for export
  app.get('/api/surveys/data-summary', authenticateToken, requireViewerOrHigher, surveyController.getVehicleSummaryData);
  app.get('/api/surveys/export-vehicle', authenticateToken, requireOperatorOrAdmin, surveyController.exportVehicleData);
  app.get("/api/survey-proporsi", authenticateToken, requireViewerOrHigher, surveyController.getSurveyProporsi);
  
  // KM Tabel API endpoint
  app.get('/api/surveys/km-tabel', authenticateToken, requireViewerOrHigher, surveyController.getKMTabelData);

  // Traffic Matrix API endpoint
  app.get('/api/surveys/traffic-matrix', authenticateToken, requireViewerOrHigher, surveyController.getTrafficMatrix);

  // Available directions API endpoint
  app.get('/api/surveys/available-directions', authenticateToken, requireViewerOrHigher, surveyController.getAvailableDirections);
};
