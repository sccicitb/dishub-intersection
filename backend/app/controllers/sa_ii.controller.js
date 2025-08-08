const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaIIVehicleData = require("../models/sa_ii_vehicle_data.model.js");
const SaIIKTBData = require("../models/sa_ii_ktb_data.model.js");
const EMPConfiguration = require("../models/emp_configuration.model.js");

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

  const { surveyHeader, vehicleData, ktbData } = req.body;

  // Start database transaction
  const sql = require("../config/db.js");
  
  let connection;
  try {
    connection = await sql.getConnection();
    
    await connection.beginTransaction();

    // 1. Create main survey header record
    const headerData = {
      tanggal: surveyHeader.tanggal,
      perihal: surveyHeader.perihal,
      kabupaten_kota: surveyHeader.kabupatenKota || surveyHeader.kabupaten_kota || 'Default City',
      lokasi: surveyHeader.lokasi || 'Default Location',
      ruas_jalan_mayor: Array.isArray(surveyHeader.ruasJalanMayor) 
        ? JSON.stringify(surveyHeader.ruasJalanMayor) 
        : JSON.stringify(['Default Road']),
      ruas_jalan_minor: Array.isArray(surveyHeader.ruasJalanMinor) 
        ? JSON.stringify(surveyHeader.ruasJalanMinor) 
        : JSON.stringify(['Default Road']),
      ukuran_kota: surveyHeader.ukuranKota || surveyHeader.ukuran_kota || '0',
      periode: surveyHeader.periode || 'Pertama'
    };

    const [headerResult] = await connection.query("INSERT INTO sa_survey_headers SET ?", headerData);
    const headerId = headerResult.insertId;

    // 2. Create vehicle data records
    if (vehicleData && Array.isArray(vehicleData)) {
      for (const dataItem of vehicleData) {
        const vehicleRecord = {
          survey_id: headerId,
          direction: dataItem.direction,
          movement_type: dataItem.movement_type,
          vehicle_type: dataItem.vehicle_type,
          count_terlindung: dataItem.count_terlindung || 0,
          count_terlawan: dataItem.count_terlawan || 0,
          smp_terlindung: dataItem.smp_terlindung || 0,
          smp_terlawan: dataItem.smp_terlawan || 0
        };

        await connection.query("INSERT INTO sa_ii_vehicle_data SET ?", vehicleRecord);
      }
    }

    // 3. Create KTB data records
    if (ktbData && Array.isArray(ktbData)) {
      for (const ktbItem of ktbData) {
        const ktbRecord = {
          survey_id: headerId,
          direction: ktbItem.direction,
          ktb_count: ktbItem.ktb_count || 0,
          turn_ratio: ktbItem.turn_ratio || 0,
          rktb_value: ktbItem.rktb_value || 0
        };

        await connection.query("INSERT INTO sa_ii_ktb_data SET ?", ktbRecord);
      }
    }

    // Commit transaction
    await connection.commit();
    
    connection.release();
    res.send({
      headerId: headerId,
      message: "SA-II Survey created successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({
      message: error.message || "Some error occurred while creating the SA-II survey."
    });
  }
};

// Get complete SA-II survey with all related data
exports.getCompleteSurvey = async (req, res) => {
  const headerId = req.params.surveyId;
  const sql = require("../config/db.js");
  
  try {
    // Get main header data
    const [headerRows] = await sql.query("SELECT * FROM sa_survey_headers WHERE id = ?", [headerId]);
    if (headerRows.length === 0) {
      return res.status(404).send({
        message: `Survey header with id ${headerId} not found.`
      });
    }

    const header = headerRows[0];

    // Get vehicle data
    const [vehicleRows] = await sql.query("SELECT * FROM sa_ii_vehicle_data WHERE survey_id = ?", [headerId]);
    
    // Get KTB data
    const [ktbRows] = await sql.query("SELECT * FROM sa_ii_ktb_data WHERE survey_id = ?", [headerId]);

    // Transform header data to match expected format
    const surveyHeader = {
      id: header.id,
      tanggal: header.tanggal,
      kabupatenKota: header.kabupaten_kota,
      lokasi: header.lokasi,
      ruasJalanMayor: safeJsonParse(header.ruas_jalan_mayor),
      ruasJalanMinor: safeJsonParse(header.ruas_jalan_minor),
      ukuranKota: header.ukuran_kota,
      perihal: header.perihal,
      periode: header.periode,
      createdAt: header.created_at,
      updatedAt: header.updated_at
    };

    // Transform vehicle data to match expected format
    const vehicleData = vehicleRows.map(item => ({
      direction: item.direction,
      movement_type: item.movement_type,
      vehicle_type: item.vehicle_type,
      count_terlindung: item.count_terlindung,
      count_terlawan: item.count_terlawan,
      smp_terlindung: item.smp_terlindung,
      smp_terlawan: item.smp_terlawan
    }));

    // Transform KTB data to match expected format
    const ktbData = ktbRows.map(item => ({
      direction: item.direction,
      ktb_count: item.ktb_count,
      turn_ratio: item.turn_ratio,
      rktb_value: item.rktb_value
    }));

    res.send({
      success: true,
      data: {
        surveyHeader,
        vehicleData,
        ktbData
      }
    });

  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving the SA-II survey."
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

  const headerId = req.params.surveyId;
  const { surveyHeader, vehicleData, ktbData } = req.body;

  // Start database transaction
  const sql = require("../config/db.js");
  
  let connection;
  try {
    connection = await sql.getConnection();
    
    await connection.beginTransaction();

    // 1. Update main header record
    if (surveyHeader) {
      const headerData = {
        tanggal: surveyHeader.tanggal,
        perihal: surveyHeader.perihal,
        kabupaten_kota: surveyHeader.kabupatenKota || surveyHeader.kabupaten_kota,
        lokasi: surveyHeader.lokasi,
        ruas_jalan_mayor: Array.isArray(surveyHeader.ruasJalanMayor) 
          ? JSON.stringify(surveyHeader.ruasJalanMayor) 
          : surveyHeader.ruasJalanMayor,
        ruas_jalan_minor: Array.isArray(surveyHeader.ruasJalanMinor) 
          ? JSON.stringify(surveyHeader.ruasJalanMinor) 
          : surveyHeader.ruasJalanMinor,
        ukuran_kota: surveyHeader.ukuranKota || surveyHeader.ukuran_kota,
        periode: surveyHeader.periode
      };

      await connection.query("UPDATE sa_survey_headers SET ? WHERE id = ?", [headerData, headerId]);
    }

    // 2. Delete existing vehicle data and KTB data
    await connection.query("DELETE FROM sa_ii_vehicle_data WHERE survey_id = ?", [headerId]);
    await connection.query("DELETE FROM sa_ii_ktb_data WHERE survey_id = ?", [headerId]);

    // 3. Create new vehicle data records
    if (vehicleData && Array.isArray(vehicleData)) {
      for (const dataItem of vehicleData) {
        const vehicleRecord = {
          survey_id: headerId,
          direction: dataItem.direction,
          movement_type: dataItem.movement_type,
          vehicle_type: dataItem.vehicle_type,
          count_terlindung: dataItem.count_terlindung || 0,
          count_terlawan: dataItem.count_terlawan || 0,
          smp_terlindung: dataItem.smp_terlindung || 0,
          smp_terlawan: dataItem.smp_terlawan || 0
        };

        await connection.query("INSERT INTO sa_ii_vehicle_data SET ?", vehicleRecord);
      }
    }

    // 4. Create new KTB data records
    if (ktbData && Array.isArray(ktbData)) {
      for (const ktbItem of ktbData) {
        const ktbRecord = {
          survey_id: headerId,
          direction: ktbItem.direction,
          ktb_count: ktbItem.ktb_count || 0,
          turn_ratio: ktbItem.turn_ratio || 0,
          rktb_value: ktbItem.rktb_value || 0
        };

        await connection.query("INSERT INTO sa_ii_ktb_data SET ?", ktbRecord);
      }
    }

    // Commit transaction
    await connection.commit();
    
    connection.release();
    res.send({
      success: true,
      message: "SA-II Survey updated successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({
      message: error.message || "Some error occurred while updating the SA-II survey."
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