const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const sql = require("../config/db.js");

// Helper function to safely parse JSON
const safeJsonParse = (jsonString, defaultValue = ['Default Road']) => {
  try {
    if (typeof jsonString === 'string') {
      return JSON.parse(jsonString);
    } else if (Array.isArray(jsonString)) {
      return jsonString;
    } else {
      return defaultValue;
    }
  } catch (error) {
    console.warn('JSON parse error:', error.message, 'for value:', jsonString);
    return defaultValue;
  }
};

// Create a new survey header
exports.createHeader = async (req, res) => {
  try {
    // Validate request
    if (!req.body) {
      return res.status(400).send({
        message: "Content can not be empty!"
      });
    }

    // Validate required fields
    if (!req.body.tanggal) {
      return res.status(400).send({
        message: "tanggal is required!"
      });
    }

    // Create a header with new structure
    const header = new SaSurveyHeader({
      simpang_id: req.body.simpangId || req.body.simpang_id || 0,
      tanggal: req.body.tanggal,
      perihal: req.body.perihal,
      kabupaten_kota: req.body.kabupatenKota || req.body.kabupaten_kota,
      lokasi: req.body.lokasi,
      ruas_jalan_mayor: req.body.ruasJalanMayor || req.body.ruas_jalan_mayor,
      ruas_jalan_minor: req.body.ruasJalanMinor || req.body.ruas_jalan_minor,
      ukuran_kota: req.body.ukuranKota || req.body.ukuran_kota,
      periode: req.body.periode,
      status: req.body.status || 'draft'
    });

    // Save header in the database
    const data = await SaSurveyHeader.create(header);
    
    // Format response to match API documentation
    const response = {
      id: data.id,
      simpangId: data.simpang_id,
      tanggal: data.tanggal,
      kabupatenKota: data.kabupaten_kota,
      lokasi: data.lokasi,
      ruasJalanMayor: safeJsonParse(data.ruas_jalan_mayor),
      ruasJalanMinor: safeJsonParse(data.ruas_jalan_minor),
      ukuranKota: data.ukuran_kota,
      perihal: data.perihal,
      periode: data.periode,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    res.send({
      success: true,
      message: "Survey header created successfully",
      data: response
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
      kabupaten_kota: req.query.kabupatenKota || req.query.kabupaten_kota,
      lokasi: req.query.lokasi,
      periode: req.query.periode,
      tanggal: req.query.tanggal
    };

    const data = await SaSurveyHeader.getAll(params);
    
    // Format response to match API documentation
    const formattedData = data.map(header => ({
      id: header.id,
      simpangId: header.simpang_id,
      tanggal: header.tanggal,
      kabupatenKota: header.kabupaten_kota,
      lokasi: header.lokasi,
      ruasJalanMayor: safeJsonParse(header.ruas_jalan_mayor),
      ruasJalanMinor: safeJsonParse(header.ruas_jalan_minor),
      ukuranKota: header.ukuran_kota,
      perihal: header.perihal,
      periode: header.periode,
      status: header.status,
      createdAt: header.created_at,
      updatedAt: header.updated_at
    }));

    res.send({
      success: true,
      data: formattedData
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
    
    // Format response to match API documentation
    const response = {
      id: data.id,
      simpangId: data.simpang_id,
      tanggal: data.tanggal,
      kabupatenKota: data.kabupaten_kota,
      lokasi: data.lokasi,
      ruasJalanMayor: safeJsonParse(data.ruas_jalan_mayor),
      ruasJalanMinor: safeJsonParse(data.ruas_jalan_minor),
      ukuranKota: data.ukuran_kota,
      perihal: data.perihal,
      periode: data.periode,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    res.send({
      success: true,
      data: response
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

    const updateData = {
      simpang_id: req.body.simpangId || req.body.simpang_id || 0,
      tanggal: req.body.tanggal,
      perihal: req.body.perihal,
      kabupaten_kota: req.body.kabupatenKota || req.body.kabupaten_kota,
      lokasi: req.body.lokasi,
      ruas_jalan_mayor: req.body.ruasJalanMayor || req.body.ruas_jalan_mayor,
      ruas_jalan_minor: req.body.ruasJalanMinor || req.body.ruas_jalan_minor,
      ukuran_kota: req.body.ukuranKota || req.body.ukuran_kota,
      periode: req.body.periode,
      status: req.body.status || 'draft'
    };

    const data = await SaSurveyHeader.updateById(req.params.id, updateData);
    
    // Format response to match API documentation
    const response = {
      id: data.id,
      simpangId: data.simpang_id,
      tanggal: data.tanggal,
      kabupatenKota: data.kabupaten_kota,
      lokasi: data.lokasi,
      ruasJalanMayor: safeJsonParse(data.ruas_jalan_mayor),
      ruasJalanMinor: safeJsonParse(data.ruas_jalan_minor),
      ukuranKota: data.ukuran_kota,
      perihal: data.perihal,
      periode: data.periode,
      status: data.status
    };

    res.send({
      success: true,
      message: "Survey header updated successfully",
      data: response
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

// Update survey status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).send({
        message: "Status is required!"
      });
    }

    // Validate status values
    const validStatuses = ['draft', 'in_progress', 'completed', 'submitted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send({
        message: "Invalid status. Must be one of: draft, in_progress, completed, submitted"
      });
    }

    const updateData = { status };
    const data = await SaSurveyHeader.updateById(id, updateData);
    
    res.send({
      success: true,
      message: "Survey status updated successfully",
      data: {
        id: data.id,
        status: data.status
      }
    });
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        message: `Survey header with id ${req.params.id} not found.`
      });
    } else {
      res.status(500).send({
        message: "Error updating survey status with id " + req.params.id
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
    // Check if header exists first
    const header = await SaSurveyHeader.findById(req.params.id);
    if (!header) {
      return res.status(404).send({
        message: `Survey header with id ${req.params.id} not found.`
      });
    }

    // Get all related forms by checking each SA table
    const forms = [];
    
    // Check SA-I forms
    const [saIForms] = await sql.query("SELECT COUNT(*) as count FROM sa_i_pendekat WHERE survey_id = ?", [req.params.id]);
    if (saIForms[0].count > 0) {
      forms.push({ form_type: "SA-I", count: saIForms[0].count });
    }
    
    // Check SA-II forms
    const [saIIForms] = await sql.query("SELECT COUNT(*) as count FROM sa_ii_vehicle_data WHERE survey_id = ?", [req.params.id]);
    if (saIIForms[0].count > 0) {
      forms.push({ form_type: "SA-II", count: saIIForms[0].count });
    }
    
    // Check SA-III forms
    const [saIIIForms] = await sql.query("SELECT COUNT(*) as count FROM sa_iii_phase_data WHERE survey_id = ?", [req.params.id]);
    if (saIIIForms[0].count > 0) {
      forms.push({ form_type: "SA-III", count: saIIIForms[0].count });
    }
    
    // Check SA-IV forms
    const [saIVForms] = await sql.query("SELECT COUNT(*) as count FROM sa_iv_capacity_analysis WHERE survey_id = ?", [req.params.id]);
    if (saIVForms[0].count > 0) {
      forms.push({ form_type: "SA-IV", count: saIVForms[0].count });
    }
    
    // Check SA-V forms
    const [saVForms] = await sql.query("SELECT COUNT(*) as count FROM sa_v_delay_analysis WHERE survey_id = ?", [req.params.id]);
    if (saVForms[0].count > 0) {
      forms.push({ form_type: "SA-V", count: saVForms[0].count });
    }

    res.send({
      success: true,
      data: forms
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving forms."
    });
  }
}; 