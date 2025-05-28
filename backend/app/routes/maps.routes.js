const controller = require('../controllers/maps.controller');

module.exports = function(app) {
  // GET all buildings with camera info
  app.get('/api/maps/buildings', controller.fetchBuildingsRaw);
  app.get('/api/maps/cameras', controller.fetchAllCamerasRaw);
  app.get('/api/maps/buildings-full', controller.fetchBuildingsWithCameras);
};
