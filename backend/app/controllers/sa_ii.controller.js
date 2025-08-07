const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaIIVehicleData = require("../models/sa_ii_vehicle_data.model.js");
const SaIIKTBData = require("../models/sa_ii_ktb_data.model.js");
const EMPConfiguration = require("../models/emp_configuration.model.js");

// =====================================================
// SA-II COMPLETE SURVEY OPERATIONS (Phase 3 - 4 APIs)
// =====================================================

// Create a complete SA-II survey in a single transaction
exports.createCompleteSurvey = async (req, res) => {
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
  
  let connection;
  try {
    connection = await sql.getConnection();
    
    await connection.beginTransaction();

    // 1. Create main survey record
    const surveyDataRecord = {
      simpang_id: header.simpang_id,
      survey_type: 'SA-II',
      tanggal: header.tanggal,
      perihal: header.perihal,
      status: 'draft'
    };

    const [surveyResult] = await connection.query("INSERT INTO sa_surveys SET ?", surveyDataRecord);
    const surveyId = surveyResult.insertId;

    // 2. Create vehicle data records
    if (surveyData && Array.isArray(surveyData)) {
      const directionMap = { 'utara': 'U', 'selatan': 'S', 'timur': 'T', 'barat': 'B' };
      
      for (const dataItem of surveyData) {
        if (dataItem.rows && Array.isArray(dataItem.rows)) {
          for (const row of dataItem.rows) {
            const mappedDirection = directionMap[dataItem.direction] || dataItem.direction;
            
            // Process MP (Mobil Penumpang)
            if (row.mp) {
              const mpData = {
                survey_id: surveyId,
                direction: mappedDirection,
                movement_type: row.type,
                vehicle_type: 'MP',
                count_terlindung: row.mp.terlindung || 0,
                count_terlawan: row.mp.terlawan || 0,
                smp_terlindung: row.mp.smpTerlindung || 0,
                smp_terlawan: row.mp.smpTerlawan || 0
              };

              await connection.query("INSERT INTO sa_ii_vehicle_data SET ?", mpData);
            }

            // Process KS (Kendaraan Sedang)
            if (row.ks) {
              const ksData = {
                survey_id: surveyId,
                direction: mappedDirection,
                movement_type: row.type,
                vehicle_type: 'KS',
                count_terlindung: row.ks.terlindung || 0,
                count_terlawan: row.ks.terlawan || 0,
                smp_terlindung: row.ks.smpTerlindung || 0,
                smp_terlawan: row.ks.smpTerlawan || 0
              };

              await connection.query("INSERT INTO sa_ii_vehicle_data SET ?", ksData);
            }

            // Process SM (Sepeda Motor)
            if (row.sm) {
              const smData = {
                survey_id: surveyId,
                direction: mappedDirection,
                movement_type: row.type,
                vehicle_type: 'SM',
                count_terlindung: row.sm.terlindung || 0,
                count_terlawan: row.sm.terlawan || 0,
                smp_terlindung: row.sm.smpTerlindung || 0,
                smp_terlawan: row.sm.smpTerlawan || 0
              };

              await connection.query("INSERT INTO sa_ii_vehicle_data SET ?", smData);
            }

            // Process KTB (Kendaraan Tak Bermotor)
            if (row.ktb) {
              const ktbData = {
                survey_id: surveyId,
                direction: mappedDirection,
                ktb_count: row.ktb.count || 0,
                turn_ratio: row.ktb.rasio || 0,
                rktb_value: row.rktb || 0
              };

              await connection.query("INSERT INTO sa_ii_ktb_data SET ?", ktbData);
            }
          }
        }
      }
    }

    // Commit transaction
    await connection.commit();
    
    connection.release();
    res.send({
      surveyId: surveyId,
      message: "SA-II Survey created successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({
      message: "Error creating SA-II survey: " + error.message
    });
  }
};

// Get complete SA-II survey with all related data
exports.getCompleteSurvey = async (req, res) => {
  const surveyId = req.params.surveyId;
  
  try {
    // Get main survey data
    const [surveys] = await SaSurveyHeader.findById(surveyId);
    if (surveys.length === 0) {
      res.status(404).send({
        message: `Survey with id ${surveyId} not found.`
      });
      return;
    }

    const survey = surveys[0];

    // Get vehicle data
    const vehicleData = await SaIIVehicleData.findBySurveyId(surveyId);
    
    // Get KTB data
    const ktbData = await SaIIKTBData.findBySurveyId(surveyId);

    // Transform data to match expected format
    const header = {
      simpang_id: survey.simpang_id,
      tanggal: survey.tanggal,
      perihal: survey.perihal
    };

    // Group vehicle data by direction and movement type
    const surveyData = [];
    const directions = ['utara', 'selatan', 'timur', 'barat'];
    
    for (const direction of directions) {
      const directionData = vehicleData.filter(item => item.direction === direction);
      if (directionData.length > 0) {
        const movementTypes = [...new Set(directionData.map(item => item.movement_type))];
        const rows = [];

        for (const movementType of movementTypes) {
          const movementData = directionData.filter(item => item.movement_type === movementType);
          
          if (movementData.length > 0) {
            const row = { type: movementType };

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
        }

        if (rows.length > 0) {
          surveyData.push({
            direction: direction,
            rows: rows
          });
        }
      }
    }

    // Get EMP configurations
    const empConfig = await EMPConfiguration.getFormattedConfig();

    // Combine all data into the expected format
    const completeSurvey = {
      header,
      ekuivalensi: empConfig,
      surveyData
    };

    res.send(completeSurvey);

  } catch (error) {
    res.status(500).send({
      message: "Error retrieving SA-II survey: " + error.message
    });
  }
};

// Update a complete SA-II survey
exports.updateCompleteSurvey = async (req, res) => {
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
  
  let connection;
  try {
    connection = await sql.getConnection();
    
    await connection.beginTransaction();

    // 1. Update main survey record
    const surveyDataRecord = {
      simpang_id: header.simpang_id,
      tanggal: header.tanggal,
      perihal: header.perihal,
      status: 'draft'
    };

    await connection.query("UPDATE sa_surveys SET ? WHERE id = ?", [surveyDataRecord, surveyId]);

    // 2. Delete existing vehicle data
    await connection.query("DELETE FROM sa_ii_vehicle_data WHERE survey_id = ?", [surveyId]);
    await connection.query("DELETE FROM sa_ii_ktb_data WHERE survey_id = ?", [surveyId]);

    // 3. Create new vehicle data records
    if (surveyData && Array.isArray(surveyData)) {
      const directionMap = { 'utara': 'U', 'selatan': 'S', 'timur': 'T', 'barat': 'B' };
      
      for (const dataItem of surveyData) {
        if (dataItem.rows && Array.isArray(dataItem.rows)) {
          for (const row of dataItem.rows) {
            const mappedDirection = directionMap[dataItem.direction] || dataItem.direction;
            
            // Process MP (Mobil Penumpang)
            if (row.mp) {
              const mpData = {
                survey_id: surveyId,
                direction: mappedDirection,
                movement_type: row.type,
                vehicle_type: 'MP',
                count_terlindung: row.mp.terlindung || 0,
                count_terlawan: row.mp.terlawan || 0,
                smp_terlindung: row.mp.smpTerlindung || 0,
                smp_terlawan: row.mp.smpTerlawan || 0
              };

              await connection.query("INSERT INTO sa_ii_vehicle_data SET ?", mpData);
            }

            // Process KS (Kendaraan Sedang)
            if (row.ks) {
              const ksData = {
                survey_id: surveyId,
                direction: mappedDirection,
                movement_type: row.type,
                vehicle_type: 'KS',
                count_terlindung: row.ks.terlindung || 0,
                count_terlawan: row.ks.terlawan || 0,
                smp_terlindung: row.ks.smpTerlindung || 0,
                smp_terlawan: row.ks.smpTerlawan || 0
              };

              await connection.query("INSERT INTO sa_ii_vehicle_data SET ?", ksData);
            }

            // Process SM (Sepeda Motor)
            if (row.sm) {
              const smData = {
                survey_id: surveyId,
                direction: mappedDirection,
                movement_type: row.type,
                vehicle_type: 'SM',
                count_terlindung: row.sm.terlindung || 0,
                count_terlawan: row.sm.terlawan || 0,
                smp_terlindung: row.sm.smpTerlindung || 0,
                smp_terlawan: row.sm.smpTerlawan || 0
              };

              await connection.query("INSERT INTO sa_ii_vehicle_data SET ?", smData);
            }

            // Process KTB (Kendaraan Tak Bermotor)
            if (row.ktb) {
              const ktbData = {
                survey_id: surveyId,
                direction: mappedDirection,
                ktb_count: row.ktb.count || 0,
                turn_ratio: row.ktb.rasio || 0,
                rktb_value: row.rktb || 0
              };

              await connection.query("INSERT INTO sa_ii_ktb_data SET ?", ktbData);
            }
          }
        }
      }
    }

    // Commit transaction
    await connection.commit();
    
    connection.release();
    res.send({
      message: "SA-II Survey updated successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({
      message: "Error updating SA-II survey: " + error.message
    });
  }
};

// =====================================================
// EMP CONFIGURATION OPERATIONS
// =====================================================

// Get EMP configurations
exports.getEMPConfigurations = async (req, res) => {
  try {
    const data = await EMPConfiguration.getFormattedConfig();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving EMP configurations."
    });
  }
}; 