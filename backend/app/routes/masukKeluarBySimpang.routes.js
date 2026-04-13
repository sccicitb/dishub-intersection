module.exports = (app) => {
  const controller = require("../controllers/masukKeluarBySimpang.controller.js");

  app.get("/api/vehicles/masuk-keluar", controller.getMasukKeluarBySimpang);
};
