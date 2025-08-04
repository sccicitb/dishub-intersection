const SaSurvey = require("../models/sa_survey.model.js");

// Create and Save a new Survey
exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const survey = new SaSurvey({
    simpang_id: req.body.simpang_id,
    survey_type: req.body.survey_type,
    tanggal: req.body.tanggal,
    perihal: req.body.perihal,
    status: req.body.status,
  });

  SaSurvey.create(survey, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Survey."
      });
    else res.status(201).send(data);
  });
};

// Retrieve all Surveys from the database.
exports.findAll = (req, res) => {
  const params = {
    simpang_id: req.query.simpang_id,
    survey_type: req.query.survey_type,
    status: req.query.status,
  }
  SaSurvey.getAll(params, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving surveys."
      });
    else res.send(data);
  });
};

// Find a single Survey with a surveyId (using query parameter)
exports.findOne = (req, res) => {
  const id = req.query.id;
  
  if (!id) {
    res.status(400).send({
      message: "Survey ID is required as query parameter 'id'"
    });
    return;
  }

  SaSurvey.findById(id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Survey with id ${id}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Survey with id " + id
        });
      }
    } else res.send(data);
  });
};

// Update a Survey identified by the surveyId in the request (using query parameter)
exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const id = req.query.id;
  
  if (!id) {
    res.status(400).send({
      message: "Survey ID is required as query parameter 'id'"
    });
    return;
  }

  SaSurvey.updateById(
    id,
    new SaSurvey(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Survey with id ${id}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Survey with id " + id
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a Survey with the specified surveyId in the request (using query parameter)
exports.delete = (req, res) => {
  const id = req.query.id;
  
  if (!id) {
    res.status(400).send({
      message: "Survey ID is required as query parameter 'id'"
    });
    return;
  }

  SaSurvey.remove(id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Survey with id ${id}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete Survey with id " + id
        });
      }
    } else res.send({ message: `Survey was deleted successfully!` });
  });
}; 