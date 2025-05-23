const controller = require('../controllers/maps.controller');

module.exports = function(app) {
  // GET all buildings with camera info
  app.get('/api/maps/buildings', controller.fetchBuildings);

  // CAMERA ENDPOINTS
  app.get('/api/cameras/:id', controller.getCameraById);       // Get single camera
  app.delete('/api/cameras/:id', controller.deleteCameraById);  // Delete camera
  app.post('/api/cameras', controller.createCamera);            // Create camera
  app.put('/api/cameras/:id', controller.updateCamera);         // Update camera
};
