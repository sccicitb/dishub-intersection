const Vehicle = require("../models/Vehicle.model.js");

// Create and Save a new Vehicle
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a Vehicle
  const Vehicle = new Vehicle({
    title: req.body.title,
    description: req.body.description,
    published: req.body.published || false
  });

  // Save Vehicle in the database
  Vehicle.create(Vehicle, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Vehicle."
      });
    else res.send(data);
  });
};

// Retrieve all Vehicles from the database (with condition).
exports.findAll = (req, res) => {
  const title = req.query.title;

  Vehicle.getAll(title, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Vehicles."
      });
    else res.send(data);
  });
};

// Find a single Vehicle by Id
exports.findOne = (req, res) => {
  Vehicle.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Vehicle with id ${req.params.id}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Vehicle with id " + req.params.id
        });
      }
    } else res.send(data);
  });
};

// find all published Vehicles
exports.findAllPublished = (req, res) => {
  Vehicle.getAllPublished((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Vehicles."
      });
    else res.send(data);
  });
};

// Update a Vehicle identified by the id in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  console.log(req.body);

  Vehicle.updateById(
    req.params.id,
    new Vehicle(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Vehicle with id ${req.params.id}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Vehicle with id " + req.params.id
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a Vehicle with the specified id in the request
exports.delete = (req, res) => {
  Vehicle.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Vehicle with id ${req.params.id}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete Vehicle with id " + req.params.id
        });
      }
    } else res.send({ message: `Vehicle was deleted successfully!` });
  });
};

// Delete all Vehicles from the database.
exports.deleteAll = (req, res) => {
  Vehicle.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Vehicles."
      });
    else res.send({ message: `All Vehicles were deleted successfully!` });
  });
};
