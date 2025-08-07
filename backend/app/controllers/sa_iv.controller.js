const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaIVCapacityAnalysis = require("../models/sa_iv_capacity_analysis.model.js");
const SaIVPhaseAnalysis = require("../models/sa_iv_phase_analysis.model.js");
const SaIVCalculationConfig = require("../models/sa_iv_calculation_config.model.js");

// Create complete SA-IV survey
exports.createCompleteSurvey = (req, res) => {
  const { surveyHeader, capacityAnalysis, phaseAnalysis } = req.body;

  if (!surveyHeader || !capacityAnalysis || !phaseAnalysis) {
    return res.status(400).json({
      success: false,
      error: "Missing required data: surveyHeader, capacityAnalysis, or phaseAnalysis"
    });
  }

  // Start transaction
  req.app.locals.sql.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Database connection error"
      });
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        connection.release();
        return res.status(500).json({
          success: false,
          error: "Transaction error"
        });
      }

      try {
        // Create survey header
        const surveyData = {
          simpang_id: surveyHeader.simpang_id,
          survey_type: 'SA-IV',
          tanggal: surveyHeader.tanggal,
          perihal: surveyHeader.perihal,
          status: surveyHeader.status || 'draft'
        };

        const surveyResult = await new Promise((resolve, reject) => {
          connection.query("INSERT INTO sa_surveys SET ?", surveyData, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

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

          await new Promise((resolve, reject) => {
            connection.query("INSERT INTO sa_iv_capacity_analysis SET ?", capacityData, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
        }

        // Insert phase analysis data
        for (const analysis of phaseAnalysis) {
          const phaseData = {
            survey_id: surveyId,
            kode_pendekat: analysis.kode_pendekat,
            phases: JSON.stringify(analysis.phases),
            cycle_time: analysis.cycle_time
          };

          await new Promise((resolve, reject) => {
            connection.query("INSERT INTO sa_iv_phase_analysis SET ?", phaseData, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
        }

        // Commit transaction
        connection.commit((err) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
            });
            return res.status(500).json({
              success: false,
              error: "Transaction commit failed"
            });
          }

          connection.release();
          res.status(201).json({
            success: true,
            data: {
              id: surveyId,
              message: "SA-IV survey created successfully"
            }
          });
        });

      } catch (error) {
        connection.rollback(() => {
          connection.release();
        });
        return res.status(500).json({
          success: false,
          error: "Error creating SA-IV survey: " + error.message
        });
      }
    });
  });
};

// Get complete SA-IV survey
exports.getCompleteSurvey = (req, res) => {
  const surveyId = req.params.surveyId;

  if (!surveyId) {
    return res.status(400).json({
      success: false,
      error: "Survey ID is required"
    });
  }

  // Get survey header
  SaSurvey.findById(surveyId, (err, survey) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Error retrieving survey"
      });
    }

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: "Survey not found"
      });
    }

    // Get capacity analysis data
    SaIVCapacityAnalysis.findBySurveyId(surveyId, (err, capacityAnalysis) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: "Error retrieving capacity analysis"
        });
      }

      // Get phase analysis data
      SaIVPhaseAnalysis.findBySurveyId(surveyId, (err, phaseAnalysis) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: "Error retrieving phase analysis"
          });
        }

        // Transform data for frontend
        const transformedCapacityAnalysis = capacityAnalysis.map(item => ({
          ...item,
          rasio_kendaraan_belok: JSON.parse(item.rasio_kendaraan_belok || '{}'),
          arus_belok_kanan: JSON.parse(item.arus_belok_kanan || '{}'),
          faktor_penyesuaian: JSON.parse(item.faktor_penyesuaian || '{}')
        }));

        const transformedPhaseAnalysis = phaseAnalysis.map(item => ({
          ...item,
          phases: JSON.parse(item.phases || '{}')
        }));

        res.json({
          success: true,
          data: {
            surveyHeader: survey,
            capacityAnalysis: transformedCapacityAnalysis,
            phaseAnalysis: transformedPhaseAnalysis
          }
        });
      });
    });
  });
};

// Update complete SA-IV survey
exports.updateCompleteSurvey = (req, res) => {
  const surveyId = req.params.surveyId;
  const { surveyHeader, capacityAnalysis, phaseAnalysis } = req.body;

  if (!surveyId) {
    return res.status(400).json({
      success: false,
      error: "Survey ID is required"
    });
  }

  // Start transaction
  req.app.locals.sql.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Database connection error"
      });
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        connection.release();
        return res.status(500).json({
          success: false,
          error: "Transaction error"
        });
      }

      try {
        // Update survey header if provided
        if (surveyHeader) {
          const updateData = {};
          if (surveyHeader.perihal) updateData.perihal = surveyHeader.perihal;
          if (surveyHeader.status) updateData.status = surveyHeader.status;

          await new Promise((resolve, reject) => {
            connection.query("UPDATE sa_surveys SET ? WHERE id = ?", [updateData, surveyId], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
        }

        // Update capacity analysis if provided
        if (capacityAnalysis) {
          // Delete existing capacity analysis
          await new Promise((resolve, reject) => {
            connection.query("DELETE FROM sa_iv_capacity_analysis WHERE survey_id = ?", [surveyId], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });

          // Insert new capacity analysis
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

            await new Promise((resolve, reject) => {
              connection.query("INSERT INTO sa_iv_capacity_analysis SET ?", capacityData, (err, result) => {
                if (err) reject(err);
                else resolve(result);
              });
            });
          }
        }

        // Update phase analysis if provided
        if (phaseAnalysis) {
          // Delete existing phase analysis
          await new Promise((resolve, reject) => {
            connection.query("DELETE FROM sa_iv_phase_analysis WHERE survey_id = ?", [surveyId], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });

          // Insert new phase analysis
          for (const analysis of phaseAnalysis) {
            const phaseData = {
              survey_id: surveyId,
              kode_pendekat: analysis.kode_pendekat,
              phases: JSON.stringify(analysis.phases),
              cycle_time: analysis.cycle_time
            };

            await new Promise((resolve, reject) => {
              connection.query("INSERT INTO sa_iv_phase_analysis SET ?", phaseData, (err, result) => {
                if (err) reject(err);
                else resolve(result);
              });
            });
          }
        }

        // Commit transaction
        connection.commit((err) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
            });
            return res.status(500).json({
              success: false,
              error: "Transaction commit failed"
            });
          }

          connection.release();
          res.json({
            success: true,
            data: {
              id: surveyId,
              message: "SA-IV survey updated successfully"
            }
          });
        });

      } catch (error) {
        connection.rollback(() => {
          connection.release();
        });
        return res.status(500).json({
          success: false,
          error: "Error updating SA-IV survey: " + error.message
        });
      }
    });
  });
};

// Get calculation configuration
exports.getCalculationConfig = (req, res) => {
  const simpangId = req.params.simpangId;

  if (!simpangId) {
    return res.status(400).json({
      success: false,
      error: "Simpang ID is required"
    });
  }

  SaIVCalculationConfig.findBySimpangId(simpangId, (err, config) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Error retrieving calculation configuration"
      });
    }

    if (!config) {
      // Return default configuration
      return res.json({
        success: true,
        data: {
          base_saturation_flow: 3000,
          adjustment_factors: {
            fhs: 1.0,
            fuk: 1.0,
            fg: 1.0,
            fp: 1.0,
            fbki: 1.0,
            fbka: 1.0
          },
          calculation_rules: {
            default_cycle_time: 120,
            minimum_green_time: 10
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        base_saturation_flow: config.base_saturation_flow || 3000,
        adjustment_factors: JSON.parse(config.adjustment_factors || '{}'),
        calculation_rules: JSON.parse(config.calculation_rules || '{}')
      }
    });
  });
}; 