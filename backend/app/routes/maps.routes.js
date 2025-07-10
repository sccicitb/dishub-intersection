const controller = require('../controllers/maps.controller');

module.exports = function(app) {
  // Import authentication and role middleware
  const { authenticateToken } = require('../middleware/auth.middleware');
  const { requireViewerOrHigher } = require('../middleware/role.middleware');

  // Maps & Building Data - Viewer+ access for all endpoints
  app.get('/api/maps/buildings', authenticateToken, requireViewerOrHigher, controller.fetchBuildingsRaw);
  app.get('/api/maps/cameras', authenticateToken, requireViewerOrHigher, controller.fetchAllCamerasRaw);
  app.get('/api/maps/buildings-full', authenticateToken, requireViewerOrHigher, controller.fetchBuildingsWithCameras);
};
