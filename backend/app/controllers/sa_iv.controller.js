const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaIVCapacityAnalysis = require("../models/sa_iv_capacity_analysis.model.js");
const SaIVPhaseAnalysis = require("../models/sa_iv_phase_analysis.model.js");
const SaIVCalculationConfig = require("../models/sa_iv_calculation_config.model.js");

// Create complete SA-IV survey
exports.createCompleteSurvey = async (req, res) => {
  const { surveyHeader, capacityAnalysis, phaseAnalysis } = req.body;

  if (!surveyHeader || !capacityAnalysis || !phaseAnalysis) {
    return res.status(400).json({
      success: false,
      error: "Missing required data: surveyHeader, capacityAnalysis, or phaseAnalysis"
    });
  }

  // Start transaction
  const sql = require("../config/db.js");
  
  let connection;
  try {
    connection = await sql.getConnection();
    
    await connection.beginTransaction();

    // Create survey header
    const surveyData = {
      simpang_id: surveyHeader.simpang_id,
      survey_type: 'SA-IV',
      tanggal: surveyHeader.tanggal,
      perihal: surveyHeader.perihal,
      status: surveyHeader.status || 'draft'
    };

    const [surveyResult] = await connection.query("INSERT INTO sa_surveys SET ?", surveyData);
    const surveyId = surveyResult.insertId;

    // Insert capacity analysis data
    for (const analysis of capacityAnalysis) {
      const capacityData = {
        survey_id: surveyId,
        kode_pendekat: analysis.kode_pendekat,
        rasio_kendaraan_belok: JSON.stringify(analysis.rasio_kendaraan_belok),
        arus_belok_kanan: JSON.stringify(analysis.arus_belok_kanan),
        arus_jenuh_dasar: analysis.arus_jenuh_dasar,
        faktor_penyesuaian: JSON.stringify(analysis.faktor_penyesuaian),
        kapasitas: analysis.kapasitas,
        derajat_kejenuhan: analysis.derajat_kejenuhan
      };

      await connection.query("INSERT INTO sa_iv_capacity_analysis SET ?", capacityData);
    }

    // Insert phase analysis data
    for (const analysis of phaseAnalysis) {
      const phaseData = {
        survey_id: surveyId,
        kode_pendekat: analysis.kode_pendekat,
        phases: JSON.stringify(analysis.phases),
        cycle_time: analysis.cycle_time
      };

      await connection.query("INSERT INTO sa_iv_phase_analysis SET ?", phaseData);
    }

    // Commit transaction
    await connection.commit();
    
    connection.release();
    res.json({
      success: true,
      surveyId: surveyId,
      message: "SA-IV Survey created successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).json({
      success: false,
      error: "Error creating SA-IV survey: " + error.message
    });
  }
};

// Get complete SA-IV survey
exports.getCompleteSurvey = async (req, res) => {
  const surveyId = req.params.surveyId;

  try {
    // Get main survey data
    const [surveys] = await SaSurveyHeader.findById(surveyId);
    if (surveys.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Survey with id ${surveyId} not found.`
      });
    }

    const survey = surveys[0];

    // Get capacity analysis data
    const capacityAnalysis = await SaIVCapacityAnalysis.findBySurveyId(surveyId);
    
    // Get phase analysis data
    const phaseAnalysis = await SaIVPhaseAnalysis.findBySurveyId(surveyId);

    // Transform data to match expected format
    const surveyHeader = {
      simpang_id: survey.simpang_id,
      tanggal: survey.tanggal,
      perihal: survey.perihal,
      status: survey.status
    };

    // Transform capacity analysis data
    const transformedCapacityAnalysis = capacityAnalysis.map(item => ({
      kode_pendekat: item.kode_pendekat,
      rasio_kendaraan_belok: JSON.parse(item.rasio_kendaraan_belok),
      arus_belok_kanan: JSON.parse(item.arus_belok_kanan),
      arus_jenuh_dasar: item.arus_jenuh_dasar,
      faktor_penyesuaian: JSON.parse(item.faktor_penyesuaian),
      kapasitas: item.kapasitas,
      derajat_kejenuhan: item.derajat_kejenuhan
    }));

    // Transform phase analysis data
    const transformedPhaseAnalysis = phaseAnalysis.map(item => ({
      kode_pendekat: item.kode_pendekat,
      phases: JSON.parse(item.phases),
      cycle_time: item.cycle_time
    }));

    // Combine all data
    const completeSurvey = {
      surveyHeader,
      capacityAnalysis: transformedCapacityAnalysis,
      phaseAnalysis: transformedPhaseAnalysis
    };

    res.json({
      success: true,
      data: completeSurvey
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error retrieving SA-IV survey: " + error.message
    });
  }
};

// Update complete SA-IV survey
exports.updateCompleteSurvey = async (req, res) => {
  const surveyId = req.params.surveyId;
  const { surveyHeader, capacityAnalysis, phaseAnalysis } = req.body;

  if (!surveyHeader || !capacityAnalysis || !phaseAnalysis) {
    return res.status(400).json({
      success: false,
      error: "Missing required data: surveyHeader, capacityAnalysis, or phaseAnalysis"
    });
  }

  // Start transaction
  const sql = require("../config/db.js");
  
  let connection;
  try {
    connection = await sql.getConnection();
    
    await connection.beginTransaction();

    // Update survey header
    const surveyData = {
      simpang_id: surveyHeader.simpang_id,
      tanggal: surveyHeader.tanggal,
      perihal: surveyHeader.perihal,
      status: surveyHeader.status || 'draft'
    };

    await connection.query("UPDATE sa_surveys SET ? WHERE id = ?", [surveyData, surveyId]);

    // Delete existing data
    await connection.query("DELETE FROM sa_iv_capacity_analysis WHERE survey_id = ?", [surveyId]);
    await connection.query("DELETE FROM sa_iv_phase_analysis WHERE survey_id = ?", [surveyId]);

    // Insert new capacity analysis data
    for (const analysis of capacityAnalysis) {
      const capacityData = {
        survey_id: surveyId,
        kode_pendekat: analysis.kode_pendekat,
        rasio_kendaraan_belok: JSON.stringify(analysis.rasio_kendaraan_belok),
        arus_belok_kanan: JSON.stringify(analysis.arus_belok_kanan),
        arus_jenuh_dasar: analysis.arus_jenuh_dasar,
        faktor_penyesuaian: JSON.stringify(analysis.faktor_penyesuaian),
        kapasitas: analysis.kapasitas,
        derajat_kejenuhan: analysis.derajat_kejenuhan
      };

      await connection.query("INSERT INTO sa_iv_capacity_analysis SET ?", capacityData);
    }

    // Insert new phase analysis data
    for (const analysis of phaseAnalysis) {
      const phaseData = {
        survey_id: surveyId,
        kode_pendekat: analysis.kode_pendekat,
        phases: JSON.stringify(analysis.phases),
        cycle_time: analysis.cycle_time
      };

      await connection.query("INSERT INTO sa_iv_phase_analysis SET ?", phaseData);
    }

    // Commit transaction
    await connection.commit();
    
    connection.release();
    res.json({
      success: true,
      message: "SA-IV Survey updated successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).json({
      success: false,
      error: "Error updating SA-IV survey: " + error.message
    });
  }
};

// Get calculation configuration
exports.getCalculationConfig = async (req, res) => {
  try {
    const config = await SaIVCalculationConfig.getFormattedConfig();
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error retrieving calculation config: " + error.message
    });
  }
}; 