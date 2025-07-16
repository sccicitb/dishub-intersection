// routes/camera.routes.js
module.exports = function (app) {
  const statusCameraController = require('../controllers/cameraStatus.controller');
  const cameraController = require('../controllers/camera.controller');
  const express = require('express');
  const router = express.Router();
  
  // Import authentication and role middleware
  const { authenticateToken } = require('../middleware/auth.middleware');
  const { requireViewerOrHigher, requireOperatorOrAdmin, requireAdmin } = require('../middleware/role.middleware');

  // Camera Status Management - Viewer+ for GET, Operator+ for POST
  router.post('/cameras/status-log', authenticateToken, requireOperatorOrAdmin, statusCameraController.createCameraStatusLog);
  router.get('/cameras/:id/status-log', authenticateToken, requireViewerOrHigher, statusCameraController.getCameraStatusLogs);
  router.get('/cameras/status-latest', authenticateToken, requireViewerOrHigher, statusCameraController.getLatestCameraStatus);
  router.get('/cameras/down-today', authenticateToken, requireViewerOrHigher, statusCameraController.getCamerasDownToday);

  // Camera CRUD Operations
  router.get('/cameras', authenticateToken, requireViewerOrHigher, cameraController.getAllCameras);       // List semua kamera
  router.get('/cameras/:id', authenticateToken, requireViewerOrHigher, cameraController.getCameraById);       // Get single camera
  router.delete('/cameras/:id', authenticateToken, requireAdmin, cameraController.deleteCameraById);  // Delete camera (admin only)
  router.post('/cameras', authenticateToken, requireOperatorOrAdmin, cameraController.createCamera);            // Create camera (operator+)
  router.put('/cameras/:id', authenticateToken, requireOperatorOrAdmin, cameraController.updateCamera);         // Update camera (operator+)

  app.use('/api', router); // prefix endpoint
};
