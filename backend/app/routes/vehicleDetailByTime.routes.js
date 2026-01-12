module.exports = (app) => {
  const controller = require("../controllers/vehicleDetailByTime.controller.js");

  // Main endpoint with flexible interval parameter
  app.get("/api/vehicles/detail-by-time", controller.getMasukKeluarDetailByTime);

  // Shorthand endpoints
  app.get("/api/vehicles/detail-by-5min", controller.getMasukKeluarDetailBy5Min);
  app.get("/api/vehicles/detail-by-10min", controller.getMasukKeluarDetailBy10Min);
  app.get("/api/vehicles/detail-by-30min", controller.getMasukKeluarDetailBy30Min);
  app.get("/api/vehicles/detail-by-hour", controller.getMasukKeluarDetailByHour);
};
