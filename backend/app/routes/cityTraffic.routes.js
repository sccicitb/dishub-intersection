module.exports = (app) => {
  const controller = require("../controllers/cityTraffic.controller.js");

  // Route to get city traffic summary (masuk/keluar kota Jogja) by interval
  // Example: /api/vehicles/city-traffic?simpang_id=2&date=2026-01-29&interval=1hour
  // For all simpangs: /api/vehicles/city-traffic?simpang_id=semua&date=2026-01-29&interval=1hour
  app.get("/api/vehicles/city-traffic", controller.getCityTrafficSummary);
};
