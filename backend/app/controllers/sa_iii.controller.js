const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaIIIPhaseData = require("../models/sa_iii_phase_data.model.js");
const SaIIIMeasurements = require("../models/sa_iii_measurements.model.js");

// =====================================================
// SA-III COMPLETE SURVEY OPERATIONS (Phase 4 - 3 APIs)
// =====================================================

// Create a complete SA-III survey in a single transaction
exports.createCompleteSurvey = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const { header, phaseData, measurements } = req.body;

  // Start database transaction
  const sql = require("../config/db.js");
  
  sql.getConnection((err, connection) => {
    if (err) {
      res.status(500).send({
        message: "Database connection error"
      });
      return;
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        connection.release();
        res.status(500).send({
          message: "Transaction start error"
        });
        return;
      }

      try {
        // 1. Create main survey record
        const surveyDataRecord = {
          simpang_id: header.simpang_id,
          survey_type: 'SA-III',
          tanggal: header.tanggal,
          perihal: header.perihal,
          status: 'draft'
        };

        const surveyResult = await new Promise((resolve, reject) => {
          connection.query("INSERT INTO sa_surveys SET ?", surveyDataRecord, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        const surveyId = surveyResult.insertId;

        // 2. Create phase data records
        if (phaseData && Array.isArray(phaseData)) {
          for (const phase of phaseData) {
            if (phase.jarak && Array.isArray(phase.jarak)) {
              for (const jarak of phase.jarak) {
                const phaseDataRecord = {
                  survey_id: surveyId,
                  fase_number: phase.fase,
                  kode_pendekat: phase.kode,
                  jarak_type: jarak.type,
                  pendekat_u: jarak.pendekat?.u || null,
                  pendekat_s: jarak.pendekat?.s || null,
                  pendekat_t: jarak.pendekat?.t || null,
                  pendekat_b: jarak.pendekat?.b || null,
                  kecepatan_berangkat: jarak.kecepatan?.berangkat || null,
                  kecepatan_datang: jarak.kecepatan?.datang || null,
                  kecepatan_pejalan_kaki: jarak.kecepatan?.pejalanKaki || null,
                  waktu_tempuh: jarak.waktuTempuh || null,
                  w_ms: jarak.wws || null,
                  w_ms_disesuaikan: jarak.wusDisarankan || null,
                  w_k: jarak.wk || null,
                  w_ah: jarak.wAll || null,
                  w_hh: jarak.wHijau || null
                };

                await new Promise((resolve, reject) => {
                  connection.query("INSERT INTO sa_iii_phase_data SET ?", phaseDataRecord, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                  });
                });
              }
            }
          }
        }

        // 3. Create measurement records
        if (measurements && Array.isArray(measurements)) {
          for (const measurement of measurements) {
            const measurementRecord = {
              survey_id: surveyId,
              measurement_label: measurement.label || `Measurement ${measurement.id}`,
              start_longitude: measurement.start.lng,
              start_latitude: measurement.start.lat,
              end_longitude: measurement.end.lng,
              end_latitude: measurement.end.lat,
              distance_meters: measurement.distance || SaIIIMeasurements.calculateDistance(
                measurement.start.lat, measurement.start.lng,
                measurement.end.lat, measurement.end.lng
              )
            };

            await new Promise((resolve, reject) => {
              connection.query("INSERT INTO sa_iii_measurements SET ?", measurementRecord, (err, result) => {
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
              res.status(500).send({
                message: "Transaction commit error"
              });
            });
            return;
          }

          connection.release();
          res.send({
            surveyId: surveyId,
            message: "SA-III Survey created successfully"
          });
        });

      } catch (error) {
        connection.rollback(() => {
          connection.release();
          res.status(500).send({
            message: "Error creating SA-III survey: " + error.message
          });
        });
      }
    });
  });
};

// Get complete SA-III survey with all related data
exports.getCompleteSurvey = (req, res) => {
  const surveyId = req.params.surveyId;
  
  // First get the main survey data
  SaSurvey.findById(surveyId, (err, survey) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Survey with id ${surveyId} not found.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving survey with id " + surveyId
        });
      }
      return;
    }

    // Get phase data
    SaIIIPhaseData.findBySurveyId(surveyId, (err, phaseData) => {
      if (err) {
        res.status(500).send({
          message: "Error retrieving phase data for survey " + surveyId
        });
        return;
      }

      // Get measurements
      SaIIIMeasurements.findBySurveyId(surveyId, (err, measurements) => {
        if (err) {
          res.status(500).send({
            message: "Error retrieving measurements for survey " + surveyId
          });
          return;
        }

        // Transform data to match expected format
        const header = {
          simpang_id: survey.simpang_id,
          tanggal: survey.tanggal,
          perihal: survey.perihal
        };

        // Group phase data by fase and kode
        const transformedPhaseData = [];
        const phases = {};
        
        phaseData.forEach(item => {
          const key = `${item.fase_number}_${item.kode_pendekat}`;
          if (!phases[key]) {
            phases[key] = {
              fase: item.fase_number,
              kode: item.kode_pendekat,
              jarak: []
            };
          }

          const jarakItem = {
            type: item.jarak_type,
            pendekat: {
              u: item.pendekat_u,
              s: item.pendekat_s,
              t: item.pendekat_t,
              b: item.pendekat_b
            },
            kecepatan: {
              berangkat: item.kecepatan_berangkat,
              datang: item.kecepatan_datang,
              pejalanKaki: item.kecepatan_pejalan_kaki
            },
            waktuTempuh: item.waktu_tempuh,
            wws: item.w_ms,
            wusDisarankan: item.w_ms_disesuaikan,
            wk: item.w_k,
            wAll: item.w_ah,
            wHijau: item.w_hh
          };

          phases[key].jarak.push(jarakItem);
        });

        // Convert to array format
        Object.values(phases).forEach(phase => {
          transformedPhaseData.push(phase);
        });

        // Transform measurements
        const transformedMeasurements = measurements.map(item => ({
          id: item.id,
          label: item.measurement_label,
          start: {
            lat: item.start_latitude,
            lng: item.start_longitude
          },
          end: {
            lat: item.end_latitude,
            lng: item.end_longitude
          },
          distance: item.distance_meters
        }));

        // Combine all data into the expected format
        const completeSurvey = {
          header,
          phaseData: transformedPhaseData,
          measurements: transformedMeasurements
        };

        res.send(completeSurvey);
      });
    });
  });
};

// Update a complete SA-III survey
exports.updateCompleteSurvey = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const surveyId = req.params.surveyId;
  const { header, phaseData, measurements } = req.body;

  // Start database transaction
  const sql = require("../config/db.js");
  
  sql.getConnection((err, connection) => {
    if (err) {
      res.status(500).send({
        message: "Database connection error"
      });
      return;
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        connection.release();
        res.status(500).send({
          message: "Transaction start error"
        });
        return;
      }

      try {
        // 1. Update main survey record
        if (header) {
          const surveyDataRecord = {
            simpang_id: header.simpang_id,
            tanggal: header.tanggal,
            perihal: header.perihal
          };

          await new Promise((resolve, reject) => {
            connection.query("UPDATE sa_surveys SET ? WHERE id = ?", [surveyDataRecord, surveyId], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
        }

        // 2. Delete existing phase and measurement data
        await new Promise((resolve, reject) => {
          connection.query("DELETE FROM sa_iii_phase_data WHERE survey_id = ?", [surveyId], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        await new Promise((resolve, reject) => {
          connection.query("DELETE FROM sa_iii_measurements WHERE survey_id = ?", [surveyId], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        // 3. Create new phase data records (same logic as create)
        if (phaseData && Array.isArray(phaseData)) {
          for (const phase of phaseData) {
            if (phase.jarak && Array.isArray(phase.jarak)) {
              for (const jarak of phase.jarak) {
                const phaseDataRecord = {
                  survey_id: surveyId,
                  fase_number: phase.fase,
                  kode_pendekat: phase.kode,
                  jarak_type: jarak.type,
                  pendekat_u: jarak.pendekat?.u || null,
                  pendekat_s: jarak.pendekat?.s || null,
                  pendekat_t: jarak.pendekat?.t || null,
                  pendekat_b: jarak.pendekat?.b || null,
                  kecepatan_berangkat: jarak.kecepatan?.berangkat || null,
                  kecepatan_datang: jarak.kecepatan?.datang || null,
                  kecepatan_pejalan_kaki: jarak.kecepatan?.pejalanKaki || null,
                  waktu_tempuh: jarak.waktuTempuh || null,
                  w_ms: jarak.wws || null,
                  w_ms_disesuaikan: jarak.wusDisarankan || null,
                  w_k: jarak.wk || null,
                  w_ah: jarak.wAll || null,
                  w_hh: jarak.wHijau || null
                };

                await new Promise((resolve, reject) => {
                  connection.query("INSERT INTO sa_iii_phase_data SET ?", phaseDataRecord, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                  });
                });
              }
            }
          }
        }

        // 4. Create new measurement records
        if (measurements && Array.isArray(measurements)) {
          for (const measurement of measurements) {
            const measurementRecord = {
              survey_id: surveyId,
              measurement_label: measurement.label || `Measurement ${measurement.id}`,
              start_longitude: measurement.start.lng,
              start_latitude: measurement.start.lat,
              end_longitude: measurement.end.lng,
              end_latitude: measurement.end.lat,
              distance_meters: measurement.distance || SaIIIMeasurements.calculateDistance(
                measurement.start.lat, measurement.start.lng,
                measurement.end.lat, measurement.end.lng
              )
            };

            await new Promise((resolve, reject) => {
              connection.query("INSERT INTO sa_iii_measurements SET ?", measurementRecord, (err, result) => {
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
              res.status(500).send({
                message: "Transaction commit error"
              });
            });
            return;
          }

          connection.release();
          res.send({
            message: "SA-III Survey updated successfully"
          });
        });

      } catch (error) {
        connection.rollback(() => {
          connection.release();
          res.status(500).send({
            message: "Error updating SA-III survey: " + error.message
          });
        });
      }
    });
  });
}; 