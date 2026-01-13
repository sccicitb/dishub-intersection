module.exports = (app) => {
  const controller = require("../controllers/vehicleDetailSummary.controller.js");

  // Route to get detailed masuk/keluar by arah for a single simpang
  app.get("/api/vehicles/detail-summary", controller.getMasukKeluarDetailBySimpang);

  // Route to get detailed masuk/keluar by arah for multiple simpangs
  app.get("/api/vehicles/detail-summary-multiple", controller.getMasukKeluarDetailBySimpangs);

  // Route to get detailed masuk/keluar by arah with 30-minute intervals
  app.get("/api/vehicles/detail-summary-by-30min", controller.getMasukKeluarDetailBy30Min);

  // Route to get detailed masuk/keluar by arah with hourly intervals
  app.get("/api/vehicles/detail-summary-by-hour", controller.getMasukKeluarDetailByHour);
};
