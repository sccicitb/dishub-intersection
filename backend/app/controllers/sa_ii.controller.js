const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaIIVehicleData = require("../models/sa_ii_vehicle_data.model.js");
const SaIIKTBData = require("../models/sa_ii_ktb_data.model.js");
const EMPConfiguration = require("../models/emp_configuration.model.js");

// =====================================================
// SA-II COMPLETE SURVEY OPERATIONS (Phase 3 - 4 APIs)
// =====================================================

// Create a complete SA-II survey in a single transaction
exports.createCompleteSurvey = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const { header, ekuivalensi, surveyData } = req.body;

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
          survey_type: 'SA-II',
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

        // 2. Create vehicle data records
        if (surveyData && Array.isArray(surveyData)) {
          for (const dataItem of surveyData) {
            if (dataItem.rows && Array.isArray(dataItem.rows)) {
              for (const row of dataItem.rows) {
                // Process MP (Mobil Penumpang)
                if (row.mp) {
                  const mpData = {
                    survey_id: surveyId,
                    direction: dataItem.direction,
                    movement_type: row.type,
                    vehicle_type: 'MP',
                    count_terlindung: row.mp.terlindung || 0,
                    count_terlawan: row.mp.terlawan || 0,
                    smp_terlindung: row.mp.smpTerlindung || 0,
                    smp_terlawan: row.mp.smpTerlawan || 0
                  };

                  await new Promise((resolve, reject) => {
                    connection.query("INSERT INTO sa_ii_vehicle_data SET ?", mpData, (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    });
                  });
                }

                // Process KS (Kendaraan Sedang)
                if (row.ks) {
                  const ksData = {
                    survey_id: surveyId,
                    direction: dataItem.direction,
                    movement_type: row.type,
                    vehicle_type: 'KS',
                    count_terlindung: row.ks.terlindung || 0,
                    count_terlawan: row.ks.terlawan || 0,
                    smp_terlindung: row.ks.smpTerlindung || 0,
                    smp_terlawan: row.ks.smpTerlawan || 0
                  };

                  await new Promise((resolve, reject) => {
                    connection.query("INSERT INTO sa_ii_vehicle_data SET ?", ksData, (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    });
                  });
                }

                // Process SM (Sepeda Motor)
                if (row.sm) {
                  const smData = {
                    survey_id: surveyId,
                    direction: dataItem.direction,
                    movement_type: row.type,
                    vehicle_type: 'SM',
                    count_terlindung: row.sm.terlindung || 0,
                    count_terlawan: row.sm.terlawan || 0,
                    smp_terlindung: row.sm.smpTerlindung || 0,
                    smp_terlawan: row.sm.smpTerlawan || 0
                  };

                  await new Promise((resolve, reject) => {
                    connection.query("INSERT INTO sa_ii_vehicle_data SET ?", smData, (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    });
                  });
                }

                // Process KTB (Kendaraan Tak Bermotor)
                if (row.ktb) {
                  const ktbData = {
                    survey_id: surveyId,
                    direction: dataItem.direction,
                    ktb_count: row.ktb.count || 0,
                    turn_ratio: row.ktb.rasio || 0,
                    rktb_value: row.rktb || 0
                  };

                  await new Promise((resolve, reject) => {
                    connection.query("INSERT INTO sa_ii_ktb_data SET ?", ktbData, (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    });
                  });
                }
              }
            }
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
            message: "SA-II Survey created successfully"
          });
        });

      } catch (error) {
        connection.rollback(() => {
          connection.release();
          res.status(500).send({
            message: "Error creating SA-II survey: " + error.message
          });
        });
      }
    });
  });
};

// Get complete SA-II survey with all related data
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

    // Get vehicle data
    SaIIVehicleData.findBySurveyId(surveyId, (err, vehicleData) => {
      if (err) {
        res.status(500).send({
          message: "Error retrieving vehicle data for survey " + surveyId
        });
        return;
      }

      // Get KTB data
      SaIIKTBData.findBySurveyId(surveyId, (err, ktbData) => {
        if (err) {
          res.status(500).send({
            message: "Error retrieving KTB data for survey " + surveyId
          });
          return;
        }

        // Transform data to match expected format
        const header = {
          simpang_id: survey.simpang_id,
          tanggal: survey.tanggal,
          perihal: survey.perihal
        };

        // Group vehicle data by direction
        const surveyData = [];
        const directions = ['U', 'S', 'T', 'B'];
        
        directions.forEach(direction => {
          const directionData = vehicleData.filter(item => item.direction === direction);
          if (directionData.length > 0) {
            const rows = [];
            const movementTypes = ['BKi', 'Lurus', 'BKa'];
            
            movementTypes.forEach(movementType => {
              const movementData = directionData.filter(item => item.movement_type === movementType);
              if (movementData.length > 0) {
                const row = {
                  type: movementType,
                  mp: {},
                  ks: {},
                  sm: {},
                  ktb: {},
                  total: {},
                  rktb: 0
                };

                // Process vehicle types
                movementData.forEach(item => {
                  if (item.vehicle_type === 'MP') {
                    row.mp = {
                      terlindung: item.count_terlindung,
                      terlawan: item.count_terlawan,
                      smpTerlindung: item.smp_terlindung,
                      smpTerlawan: item.smp_terlawan
                    };
                  } else if (item.vehicle_type === 'KS') {
                    row.ks = {
                      terlindung: item.count_terlindung,
                      terlawan: item.count_terlawan,
                      smpTerlindung: item.smp_terlindung,
                      smpTerlawan: item.smp_terlawan
                    };
                  } else if (item.vehicle_type === 'SM') {
                    row.sm = {
                      terlindung: item.count_terlindung,
                      terlawan: item.count_terlawan,
                      smpTerlindung: item.smp_terlindung,
                      smpTerlawan: item.smp_terlawan
                    };
                  }
                });

                // Add KTB data
                const ktbItem = ktbData.find(item => item.direction === direction);
                if (ktbItem) {
                  row.ktb = {
                    count: ktbItem.ktb_count,
                    rasio: ktbItem.turn_ratio
                  };
                  row.rktb = ktbItem.rktb_value;
                }

                rows.push(row);
              }
            });

            if (rows.length > 0) {
              surveyData.push({
                direction: direction,
                rows: rows
              });
            }
          }
        });

        // Get EMP configurations
        EMPConfiguration.getFormattedConfig((err, empConfig) => {
          if (err) {
            res.status(500).send({
              message: "Error retrieving EMP configurations"
            });
            return;
          }

          // Combine all data into the expected format
          const completeSurvey = {
            header,
            ekuivalensi: empConfig,
            surveyData
          };

          res.send(completeSurvey);
        });
      });
    });
  });
};

// Update a complete SA-II survey
exports.updateCompleteSurvey = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const surveyId = req.params.surveyId;
  const { header, ekuivalensi, surveyData } = req.body;

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

        // 2. Delete existing vehicle and KTB data
        await new Promise((resolve, reject) => {
          connection.query("DELETE FROM sa_ii_vehicle_data WHERE survey_id = ?", [surveyId], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        await new Promise((resolve, reject) => {
          connection.query("DELETE FROM sa_ii_ktb_data WHERE survey_id = ?", [surveyId], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        // 3. Create new vehicle data records (same logic as create)
        if (surveyData && Array.isArray(surveyData)) {
          for (const dataItem of surveyData) {
            if (dataItem.rows && Array.isArray(dataItem.rows)) {
              for (const row of dataItem.rows) {
                // Process MP (Mobil Penumpang)
                if (row.mp) {
                  const mpData = {
                    survey_id: surveyId,
                    direction: dataItem.direction,
                    movement_type: row.type,
                    vehicle_type: 'MP',
                    count_terlindung: row.mp.terlindung || 0,
                    count_terlawan: row.mp.terlawan || 0,
                    smp_terlindung: row.mp.smpTerlindung || 0,
                    smp_terlawan: row.mp.smpTerlawan || 0
                  };

                  await new Promise((resolve, reject) => {
                    connection.query("INSERT INTO sa_ii_vehicle_data SET ?", mpData, (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    });
                  });
                }

                // Process KS (Kendaraan Sedang)
                if (row.ks) {
                  const ksData = {
                    survey_id: surveyId,
                    direction: dataItem.direction,
                    movement_type: row.type,
                    vehicle_type: 'KS',
                    count_terlindung: row.ks.terlindung || 0,
                    count_terlawan: row.ks.terlawan || 0,
                    smp_terlindung: row.ks.smpTerlindung || 0,
                    smp_terlawan: row.ks.smpTerlawan || 0
                  };

                  await new Promise((resolve, reject) => {
                    connection.query("INSERT INTO sa_ii_vehicle_data SET ?", ksData, (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    });
                  });
                }

                // Process SM (Sepeda Motor)
                if (row.sm) {
                  const smData = {
                    survey_id: surveyId,
                    direction: dataItem.direction,
                    movement_type: row.type,
                    vehicle_type: 'SM',
                    count_terlindung: row.sm.terlindung || 0,
                    count_terlawan: row.sm.terlawan || 0,
                    smp_terlindung: row.sm.smpTerlindung || 0,
                    smp_terlawan: row.sm.smpTerlawan || 0
                  };

                  await new Promise((resolve, reject) => {
                    connection.query("INSERT INTO sa_ii_vehicle_data SET ?", smData, (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    });
                  });
                }

                // Process KTB (Kendaraan Tak Bermotor)
                if (row.ktb) {
                  const ktbData = {
                    survey_id: surveyId,
                    direction: dataItem.direction,
                    ktb_count: row.ktb.count || 0,
                    turn_ratio: row.ktb.rasio || 0,
                    rktb_value: row.rktb || 0
                  };

                  await new Promise((resolve, reject) => {
                    connection.query("INSERT INTO sa_ii_ktb_data SET ?", ktbData, (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    });
                  });
                }
              }
            }
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
            message: "SA-II Survey updated successfully"
          });
        });

      } catch (error) {
        connection.rollback(() => {
          connection.release();
          res.status(500).send({
            message: "Error updating SA-II survey: " + error.message
          });
        });
      }
    });
  });
};

// =====================================================
// EMP CONFIGURATION OPERATIONS
// =====================================================

// Get EMP configurations
exports.getEMPConfigurations = (req, res) => {
  EMPConfiguration.getFormattedConfig((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving EMP configurations."
      });
      return;
    }

    res.send(data);
  });
}; 