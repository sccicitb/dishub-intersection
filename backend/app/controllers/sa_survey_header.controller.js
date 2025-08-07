const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const sql = require("../config/db.js");

// Create a new survey header
exports.createHeader = async (req, res) => {
  try {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content can not be empty!"
      });
    }

    // Create a header (without survey_type initially)
    const header = new SaSurveyHeader({
      simpang_id: req.body.simpang_id,
      tanggal: req.body.tanggal,
      perihal: req.body.perihal,
      status: req.body.status || 'draft'
    });

    // Save header in the database
    const data = await SaSurveyHeader.create(header);
    res.send({
      success: true,
      message: "Survey header created successfully",
      data: data
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the survey header."
    });
  }
};

// Retrieve all survey headers
exports.getAllHeaders = async (req, res) => {
  try {
    const params = {
      simpang_id: req.query.simpang_id,
      status: req.query.status
    };

    const data = await SaSurveyHeader.getAll(params);
    res.send({
      success: true,
      data: data
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving survey headers."
    });
  }
};

// Find a single survey header with id
exports.getHeaderById = async (req, res) => {
  try {
    const data = await SaSurveyHeader.findById(req.params.id);
    res.send({
      success: true,
      data: data
    });
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        message: `Survey header with id ${req.params.id} not found.`
      });
    } else {
      res.status(500).send({
        message: "Error retrieving survey header with id " + req.params.id
      });
    }
  }
};

// Update a survey header
exports.updateHeader = async (req, res) => {
  try {
    // Validate Request
    if (!req.body) {
      return res.status(400).send({
        message: "Content can not be empty!"
      });
    }

    const data = await SaSurveyHeader.updateById(req.params.id, {
      simpang_id: req.body.simpang_id,
      tanggal: req.body.tanggal,
      perihal: req.body.perihal,
      status: req.body.status
    });

    res.send({
      success: true,
      message: "Survey header updated successfully",
      data: data
    });
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        message: `Survey header with id ${req.params.id} not found.`
      });
    } else {
      res.status(500).send({
        message: "Error updating survey header with id " + req.params.id
      });
    }
  }
};

// Delete a survey header
exports.deleteHeader = async (req, res) => {
  try {
    await SaSurveyHeader.remove(req.params.id);
    res.send({
      success: true,
      message: "Survey header was deleted successfully!"
    });
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        message: `Survey header with id ${req.params.id} not found.`
      });
    } else {
      res.status(500).send({
        message: "Could not delete survey header with id " + req.params.id
      });
    }
  }
};

// Get all forms for a specific header
exports.getFormsByHeaderId = async (req, res) => {
  try {
    const data = await SaSurveyHeader.getFormsByHeaderId(req.params.id);
    res.send({
      success: true,
      data: data
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving forms."
    });
  }
};

// Add form data to existing header
exports.addFormToHeader = async (req, res) => {
  try {
    if (!req.body.form_type) {
      return res.status(400).send({
        message: "form_type is required!"
      });
    }

    // Check if header exists
    const headerData = await SaSurveyHeader.findById(req.params.id);

    // Create a new survey record with the form type
    const surveyData = {
      simpang_id: headerData.simpang_id,
      survey_type: req.body.form_type,
      tanggal: headerData.tanggal,
      perihal: headerData.perihal,
      status: req.body.status || 'draft'
    };

    const [result] = await sql.query("INSERT INTO sa_surveys SET ?", surveyData);
    res.send({
      success: true,
      message: `Form ${req.body.form_type} added to header successfully`,
      data: { id: result.insertId, ...surveyData }
    });
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        message: `Survey header with id ${req.params.id} not found.`
      });
    } else {
      res.status(500).send({
        message: err.message || "Some error occurred while adding form to header."
      });
    }
  }
}; 