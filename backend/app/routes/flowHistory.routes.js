module.exports = (app) => {
  const flowHistory = require("../controllers/flowHistory.controller.js");

  // Get flow history
  app.get("/flow-history", flowHistory.getFlowHistory);
};

