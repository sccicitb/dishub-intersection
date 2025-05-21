// routes/maps.routes.js

const controller = require('../controllers/maps.controller');

module.exports = function(app) {
  // GET /api/maps/buildings
  app.get('/api/maps/buildings', controller.fetchBuildings);
};
