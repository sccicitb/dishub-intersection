module.exports = (app) => {
  const controller = require("../controllers/vehicleDetailSummary.controller.js");

  // Route to get detailed masuk/keluar by arah for a single simpang
  app.get("/api/vehicles/detail-summary", controller.getMasukKeluarDetailBySimpang);

  // Route to get detailed masuk/keluar by arah for multiple simpangs
  app.get("/api/vehicles/detail-summary-multiple", controller.getMasukKeluarDetailBySimpangs);
};
