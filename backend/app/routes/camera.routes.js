// routes/camera.routes.js
module.exports = function (app) {
  const controller = require('../controllers/cameraStatus.controller');
  const express = require('express');
  const router = express.Router();

  router.post('/cameras/status-log', controller.createCameraStatusLog);
  router.get('/cameras/:id/status-log', controller.getCameraStatusLogs);
  router.get('/cameras/status-latest', controller.getLatestCameraStatus);
  router.get('/cameras/down-today', controller.getCamerasDownToday);

  app.use('/api', router); // prefix endpoint
};
