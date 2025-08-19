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
      simpang_id: surveyHeader.simpangId || surveyHeader.simpang_id || 0,
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
      simpangId: header.simpang_id,
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
        simpang_id: surveyHeader.simpangId || surveyHeader.simpang_id || 0,
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

// Get aggregated vehicle data for SA-II Arus Kendaraan
exports.getArusKendaraan = async (req, res) => {
  const surveyId = req.params.surveyId;
  
  try {
    // 1. Validate survey exists using model
    const survey = await SaIIVehicleData.validateSurveyExists(surveyId);
    
    if (!survey) {
      return res.status(404).send({
        success: false,
        message: `Survey with id ${surveyId} not found.`
      });
    }

    // 2. Get aggregated vehicle data from table arus using model
    // Get simpangId from survey header
    const surveyHeader = await SaSurveyHeader.findById(surveyId);
    if (!surveyHeader) {
      return res.status(404).send({
        success: false,
        message: `Survey header with id ${surveyId} not found.`
      });
    }
    
    const simpangId = surveyHeader.simpang_id;
    if (!simpangId || simpangId === 0) {
      return res.status(400).send({
        success: false,
        message: `Survey ${surveyId} does not have a valid simpang_id. Please update the survey header.`
      });
    }
    
    const arusData = await SaIIVehicleData.getArusAggregatedData(simpangId);

    if (arusData.length === 0) {
      return res.status(404).send({
        success: false,
        message: `No vehicle data found for survey ${surveyId}.`
      });
    }

    // 3. Process data using proven business logic from test script
    const aggregatedData = processArusDataImproved(arusData);

    // 4. Return response in required format matching Requirements.md
    res.send({
      success: true,
      data: aggregatedData
    });

  } catch (error) {
    console.error('Error in getArusKendaraan:', error);
    res.status(500).send({
      success: false,
      message: error.message || "Some error occurred while retrieving vehicle data."
    });
  }
};

// =====================================================
// BUSINESS LOGIC FUNCTIONS
// =====================================================

// Map English direction to Indonesian code
function mapDirection(englishDirection) {
  const directionMap = {
    'east': 't',    // timur
    'south': 's',   // selatan
    'west': 'b',    // barat
    'north': 'u'    // utara
  };
  return directionMap[englishDirection] || englishDirection;
}

// Categorize movement based on geographic orientation
function categorizeMovement(dariArah, keArah) {
  const movementRules = {
    // From North (utara)
    'north-south': 'Lurus',    // Straight
    'north-east': 'BKa',       // Right turn
    'north-west': 'BKi',       // Left turn
    
    // From East (timur)
    'east-west': 'Lurus',      // Straight
    'east-south': 'BKa',       // Right turn
    'east-north': 'BKi',       // Left turn
    
    // From South (selatan)
    'south-north': 'Lurus',    // Straight
    'south-west': 'BKa',       // Right turn
    'south-east': 'BKi',       // Left turn
    
    // From West (barat)
    'west-east': 'Lurus',      // Straight
    'west-north': 'BKa',       // Right turn
    'west-south': 'BKi'        // Left turn
  };
  
  const key = `${dariArah}-${keArah}`;
  return movementRules[key] || 'Lurus'; // Default to straight
}

// Get movement index for array positioning
function getMovementIndex(movement) {
  const movementMap = {
    'BKi': 0,      // Left turn
    'Lurus': 1,    // Straight
    'BKa': 2       // Right turn
  };
  return movementMap[movement] || 1; // Default to straight
}

// Process arus data and aggregate by direction and movement (IMPROVED VERSION)
function processArusDataImproved(arusData) {
  // Initialize the response structure matching Requirements.md format
  const categorized = {
    u: { mp: [0, 0, 0], sm: [0, 0, 0], ktb: [0, 0, 0], ks: [0, 0, 0] },
    t: { mp: [0, 0, 0], sm: [0, 0, 0], ktb: [0, 0, 0], ks: [0, 0, 0] },
    b: { mp: [0, 0, 0], sm: [0, 0, 0], ktb: [0, 0, 0], ks: [0, 0, 0] },
    s: { mp: [0, 0, 0], sm: [0, 0, 0], ktb: [0, 0, 0], ks: [0, 0, 0] }
  };
  
  // Map English directions to Indonesian codes
  const directionMap = {
    'north': 'u', 'east': 't', 'south': 's', 'west': 'b'
  };
  
  // Process each aggregation record
  arusData.forEach(row => {
    const fromDir = directionMap[row.dari_arah];
    const movement = categorizeMovementImproved(row.dari_arah, row.ke_arah);
    const movementIndex = getMovementIndexImproved(movement);
    
    if (fromDir && movementIndex !== -1) {
      // Add vehicle counts to appropriate movement index
      categorized[fromDir].mp[movementIndex] += parseInt(row.total_mp) || 0;
      categorized[fromDir].sm[movementIndex] += parseInt(row.total_sm) || 0;
      categorized[fromDir].ktb[movementIndex] += parseInt(row.total_ktb) || 0;
      categorized[fromDir].ks[movementIndex] += parseInt(row.total_ks) || 0;
    }
  });
  
  // Add RKTB calculation (simplified for now - total KTB per direction)
  Object.keys(categorized).forEach(direction => {
    const totalKTB = categorized[direction].ktb.reduce((sum, val) => sum + val, 0);
    categorized[direction].rktb = [totalKTB]; // Array format as per Requirements.md
  });
  
  return categorized;
}

// Improved movement categorization based on TRAFFIC ENGINEERING rules
function categorizeMovementImproved(fromArah, toArah) {
  // Handle same direction (U-turn scenario)
  if (fromArah === toArah) {
    return 'Lurus'; // Same direction = straight (no U-turn in traffic context)
  }
  
  // Handle opposite directions (straight through intersection)
  if ((fromArah === 'north' && toArah === 'south') ||
      (fromArah === 'south' && toArah === 'north') ||
      (fromArah === 'east' && toArah === 'west') ||
      (fromArah === 'west' && toArah === 'east')) {
    return 'Lurus'; // Opposite directions = straight through intersection
  }
  
  // Handle right turns (clockwise movement)
  if ((fromArah === 'north' && toArah === 'east') ||
      (fromArah === 'east' && toArah === 'south') ||
      (fromArah === 'south' && toArah === 'west') ||
      (fromArah === 'west' && toArah === 'north')) {
    return 'BKa'; // Right turn
  }
  
  // Handle left turns (counter-clockwise movement)
  if ((fromArah === 'north' && toArah === 'west') ||
      (fromArah === 'east' && toArah === 'north') ||
      (fromArah === 'south' && toArah === 'east') ||
      (fromArah === 'west' && toArah === 'south')) {
    return 'BKi'; // Left turn
  }
  
  // Default fallback
  return 'Lurus';
}

// Improved movement index mapping
function getMovementIndexImproved(movement) {
  switch (movement) {
    case 'BKi': return 0;    // Left turn
    case 'Lurus': return 1;  // Straight
    case 'BKa': return 2;    // Right turn
    default: return -1;      // Invalid movement
  }
}

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