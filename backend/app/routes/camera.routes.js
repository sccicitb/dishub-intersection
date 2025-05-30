// routes/camera.routes.js
module.exports = function (app) {
  const statusCameraController = require('../controllers/cameraStatus.controller');
  const cameraController = require('../controllers/camera.controller');
  const express = require('express');
  const router = express.Router();

  router.post('/cameras/status-log', statusCameraController.createCameraStatusLog);
  router.get('/cameras/:id/status-log', statusCameraController.getCameraStatusLogs);
  router.get('/cameras/status-latest', statusCameraController.getLatestCameraStatus);
  router.get('/cameras/down-today', statusCameraController.getCamerasDownToday);

  router.get('/cameras', cameraController.getAllCameras);       // List semua kamera
  router.get('/cameras/:id', cameraController.getCameraById);       // Get single camera
  router.delete('/cameras/:id', cameraController.deleteCameraById);  // Delete camera
  router.post('/cameras', cameraController.createCamera);            // Create camera
  router.put('/cameras/:id', cameraController.updateCamera);         // Update camera

  app.use('/api', router); // prefix endpoint
};
