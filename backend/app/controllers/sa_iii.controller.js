const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaIIIPhaseData = require("../models/sa_iii_phase_data.model.js");
const SaIIIMeasurements = require("../models/sa_iii_measurements.model.js");

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

  const { header, phaseData, measurements } = req.body;

  // Start database transaction
  const sql = require("../config/db.js");
  
  let connection;
  try {
    connection = await sql.getConnection();
    
    await connection.beginTransaction();

    // 1. Create main survey record
    const surveyDataRecord = {
      simpang_id: header.simpang_id,
      survey_type: 'SA-III',
      tanggal: header.tanggal,
      perihal: header.perihal,
      status: 'draft'
    };

    const [surveyResult] = await connection.query("INSERT INTO sa_surveys SET ?", surveyDataRecord);
    const surveyId = surveyResult.insertId;

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
              survey_id: surveyId,
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

        await connection.query("INSERT INTO sa_iii_measurements SET ?", measurementRecord);
      }
    }

    // Commit transaction
    await connection.commit();
    
    connection.release();
    res.send({
      surveyId: surveyId,
      message: "SA-III Survey created successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({
      message: "Error creating SA-III survey: " + error.message
    });
  }
};

// Get complete SA-III survey with all related data
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

    // Get phase data
    const phaseData = await SaIIIPhaseData.findBySurveyId(surveyId);
    
    // Get measurements
    const measurements = await SaIIIMeasurements.findBySurveyId(surveyId);

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

  } catch (error) {
    res.status(500).send({
      message: "Error retrieving SA-III survey: " + error.message
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

  const surveyId = req.params.surveyId;
  const { header, phaseData, measurements } = req.body;

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

    // 2. Delete existing phase and measurement data
    await connection.query("DELETE FROM sa_iii_phase_data WHERE survey_id = ?", [surveyId]);
    await connection.query("DELETE FROM sa_iii_measurements WHERE survey_id = ?", [surveyId]);

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
              survey_id: surveyId,
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

        await connection.query("INSERT INTO sa_iii_measurements SET ?", measurementRecord);
      }
    }

    // Commit transaction
    await connection.commit();
    
    connection.release();
    res.send({
      message: "SA-III Survey updated successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({
      message: "Error updating SA-III survey: " + error.message
    });
  }
}; 