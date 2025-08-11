const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaIIIPhaseData = require("../models/sa_iii_phase_data.model.js");
const SaIIIMeasurements = require("../models/sa_iii_measurements.model.js");

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
// SA-III COMPLETE SURVEY OPERATIONS (Phase 4 - 3 APIs)
// =====================================================

// Create a complete SA-III survey in a single transaction
exports.createCompleteSurvey = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const { surveyHeader, phaseData, measurements } = req.body;

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

    // 2. Create phase data records
    if (phaseData && Array.isArray(phaseData)) {
      const jarakTypeMap = {
        'BKi': 'lintasanBerangkat',
        'Lurus': 'panjangBerangkat', 
        'BKa': 'lintasanDatang',
        'Pejalan': 'lintasanPejalan'
      };
      
      for (const phase of phaseData) {
        if (phase.jarak && Array.isArray(phase.jarak)) {
          for (const jarak of phase.jarak) {
            const mappedJarakType = jarakTypeMap[jarak.type] || jarak.type;
            const phaseDataRecord = {
              survey_id: headerId,
              fase_number: phase.fase,
              kode_pendekat: phase.kode,
              jarak_type: mappedJarakType,
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

            await connection.query("INSERT INTO sa_iii_phase_data SET ?", phaseDataRecord);
          }
        }
      }
    }

    // 3. Create measurement records
    if (measurements && Array.isArray(measurements)) {
      for (const measurement of measurements) {
        const measurementRecord = {
          survey_id: headerId,
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

        await connection.query("INSERT INTO sa_iii_measurements SET ?", measurementRecord);
      }
    }

    // Commit transaction
    await connection.commit();
    
    connection.release();
    res.send({
      headerId: headerId,
      message: "SA-III Survey created successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({
      message: error.message || "Some error occurred while creating the SA-III survey."
    });
  }
};

// Get complete SA-III survey with all related data
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

    // Get phase data
    const [phaseRows] = await sql.query("SELECT * FROM sa_iii_phase_data WHERE survey_id = ?", [headerId]);
    
    // Get measurements
    const [measurementRows] = await sql.query("SELECT * FROM sa_iii_measurements WHERE survey_id = ?", [headerId]);

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

    // Group phase data by fase and kode
    const transformedPhaseData = [];
    const phases = {};
    
    phaseRows.forEach(item => {
      const key = `${item.fase_number}_${item.kode_pendekat}`;
      if (!phases[key]) {
        phases[key] = {
          fase: item.fase_number,
          kode: item.kode_pendekat,
          jarak: []
        };
      }
      
      phases[key].jarak.push({
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
      });
    });

    // Convert phases object to array
    Object.values(phases).forEach(phase => {
      transformedPhaseData.push(phase);
    });

    // Transform measurements data
    const transformedMeasurements = measurementRows.map(item => ({
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

    res.send({
      success: true,
      data: {
        surveyHeader,
        phaseData: transformedPhaseData,
        measurements: transformedMeasurements
      }
    });

  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving the SA-III survey."
    });
  }
};

// Update a complete SA-III survey
exports.updateCompleteSurvey = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const headerId = req.params.surveyId;
  const { surveyHeader, phaseData, measurements } = req.body;

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

    // 2. Delete existing phase and measurement data
    await connection.query("DELETE FROM sa_iii_phase_data WHERE survey_id = ?", [headerId]);
    await connection.query("DELETE FROM sa_iii_measurements WHERE survey_id = ?", [headerId]);

    // 3. Create new phase data records
    if (phaseData && Array.isArray(phaseData)) {
      const jarakTypeMap = {
        'BKi': 'lintasanBerangkat',
        'Lurus': 'panjangBerangkat', 
        'BKa': 'lintasanDatang',
        'Pejalan': 'lintasanPejalan'
      };
      
      for (const phase of phaseData) {
        if (phase.jarak && Array.isArray(phase.jarak)) {
          for (const jarak of phase.jarak) {
            const mappedJarakType = jarakTypeMap[jarak.type] || jarak.type;
            const phaseDataRecord = {
              survey_id: headerId,
              fase_number: phase.fase,
              kode_pendekat: phase.kode,
              jarak_type: mappedJarakType,
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

            await connection.query("INSERT INTO sa_iii_phase_data SET ?", phaseDataRecord);
          }
        }
      }
    }

    // 4. Create new measurement records
    if (measurements && Array.isArray(measurements)) {
      for (const measurement of measurements) {
        const measurementRecord = {
          survey_id: headerId,
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

        await connection.query("INSERT INTO sa_iii_measurements SET ?", measurementRecord);
      }
    }

    // Commit transaction
    await connection.commit();
    
    connection.release();
    res.send({
      success: true,
      message: "SA-III Survey updated successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({
      message: error.message || "Some error occurred while updating the SA-III survey."
    });
  }
}; 