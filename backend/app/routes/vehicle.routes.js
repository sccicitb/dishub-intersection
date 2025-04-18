module.exports = app => {
  const Vehicles = require("../controllers/vehicle.controller.js");

  var router = require("express").Router();

  // Create a new Vehicle
  router.post("/", Vehicles.create);

  // Retrieve all Vehicles
  router.get("/", Vehicles.findAll);

  // Retrieve all published Vehicles
  router.get("/published", Vehicles.findAllPublished);

  // Retrieve a single Vehicle with id
  router.get("/:id", Vehicles.findOne);

  // Update a Vehicle with id
  router.put("/:id", Vehicles.update);

  // Delete a Vehicle with id
  router.delete("/:id", Vehicles.delete);

  // Delete all Vehicles
  router.delete("/", Vehicles.deleteAll);

  app.use('/api/Vehicles', router);
};
