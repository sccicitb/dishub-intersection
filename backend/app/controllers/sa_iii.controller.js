const SaSurveyHeader = require("../models/sa_survey_header.model.js");

// Parse JSON aman
const safeJsonParse = (jsonString, defaultValue = ['Default Road']) => {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : 
           Array.isArray(jsonString) ? jsonString : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

// Buat survey SA-III
exports.createCompleteSurvey = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Content tidak boleh kosong!" });
  }

  const { surveyHeader, phaseData, measurements } = req.body;
  const sql = require("../config/db.js");
  let connection;

  try {
    connection = await sql.getConnection();
    await connection.beginTransaction();

    const headerId = surveyHeader.id;

    // Insert phase data
    if (phaseData && Array.isArray(phaseData)) {
      for (const phase of phaseData) {
        if (phase.jarak && Array.isArray(phase.jarak)) {
          for (const jarak of phase.jarak) {
            await connection.query("INSERT INTO sa_iii_phase_data SET ?", {
              survey_id: headerId,
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
            });
          }
        }
      }
    }

    // Insert measurements
    if (measurements && Array.isArray(measurements)) {
      for (const measurement of measurements) {
        await connection.query("INSERT INTO sa_iii_measurements SET ?", {
          survey_id: headerId,
          measurement_label: measurement.label || `Measurement ${measurement.id}`,
          start_longitude: measurement.start?.lng || null,
          start_latitude: measurement.start?.lat || null,
          end_longitude: measurement.end?.lng || null,
          end_latitude: measurement.end?.lat || null,
          distance_meters: measurement.distance || null
        });
      }
    }

    await connection.commit();
    connection.release();
    res.send({ headerId, message: "SA-III tersimpan" });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({ message: error.message || "Error SA-III" });
  }
};

// Ambil survey SA-III
exports.getCompleteSurvey = async (req, res) => {
  const headerId = req.params.surveyId;
  const sql = require("../config/db.js");

  try {
    const [headerRows] = await sql.query("SELECT * FROM sa_survey_headers WHERE id = ?", [headerId]);
    if (headerRows.length === 0) {
      return res.status(404).send({ message: `Survey ${headerId} tidak ditemukan` });
    }

    const header = headerRows[0];
    const [phaseRows] = await sql.query("SELECT * FROM sa_iii_phase_data WHERE survey_id = ?", [headerId]);
    const [measurementRows] = await sql.query("SELECT * FROM sa_iii_measurements WHERE survey_id = ?", [headerId]);

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

    // Group phase data
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
        pendekat: { u: item.pendekat_u, s: item.pendekat_s, t: item.pendekat_t, b: item.pendekat_b },
        kecepatan: { berangkat: item.kecepatan_berangkat, datang: item.kecepatan_datang, pejalanKaki: item.kecepatan_pejalan_kaki },
        waktuTempuh: item.waktu_tempuh,
        wws: item.w_ms,
        wusDisarankan: item.w_ms_disesuaikan,
        wk: item.w_k,
        wAll: item.w_ah,
        wHijau: item.w_hh
      });
    });

    const phaseData = Object.values(phases);

    const measurements = measurementRows.map(item => ({
      id: item.id,
      label: item.measurement_label,
      start: { lat: item.start_latitude, lng: item.start_longitude },
      end: { lat: item.end_latitude, lng: item.end_longitude },
      distance: item.distance_meters
    }));

    res.send({ success: true, data: { surveyHeader, phaseData, measurements } });

  } catch (error) {
    res.status(500).send({ message: error.message || "Error ambil SA-III" });
  }
};

// Update survey SA-III
exports.updateCompleteSurvey = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Content tidak boleh kosong!" });
  }

  const headerId = req.params.surveyId;
  const { surveyHeader, phaseData, measurements } = req.body;
  const sql = require("../config/db.js");
  let connection;

  try {
    connection = await sql.getConnection();
    await connection.beginTransaction();

    // Update header
    if (surveyHeader) {
      const headerData = {
        tanggal: surveyHeader.tanggal,
        perihal: surveyHeader.perihal,
        kabupaten_kota: surveyHeader.kabupatenKota || surveyHeader.kabupaten_kota,
        lokasi: surveyHeader.lokasi,
        ruas_jalan_mayor: Array.isArray(surveyHeader.ruasJalanMayor) ? JSON.stringify(surveyHeader.ruasJalanMayor) : surveyHeader.ruasJalanMayor,
        ruas_jalan_minor: Array.isArray(surveyHeader.ruasJalanMinor) ? JSON.stringify(surveyHeader.ruasJalanMinor) : surveyHeader.ruasJalanMinor,
        ukuran_kota: surveyHeader.ukuranKota || surveyHeader.ukuran_kota,
        periode: surveyHeader.periode
      };
      await connection.query("UPDATE sa_survey_headers SET ? WHERE id = ?", [headerData, headerId]);
    }

    // Delete dan insert ulang
    await connection.query("DELETE FROM sa_iii_phase_data WHERE survey_id = ?", [headerId]);
    await connection.query("DELETE FROM sa_iii_measurements WHERE survey_id = ?", [headerId]);

    if (phaseData && Array.isArray(phaseData)) {
      for (const phase of phaseData) {
        if (phase.jarak && Array.isArray(phase.jarak)) {
          for (const jarak of phase.jarak) {
            await connection.query("INSERT INTO sa_iii_phase_data SET ?", {
              survey_id: headerId,
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
            });
          }
        }
      }
    }

    if (measurements && Array.isArray(measurements)) {
      for (const measurement of measurements) {
        await connection.query("INSERT INTO sa_iii_measurements SET ?", {
          survey_id: headerId,
          measurement_label: measurement.label || `Measurement ${measurement.id}`,
          start_longitude: measurement.start?.lng || null,
          start_latitude: measurement.start?.lat || null,
          end_longitude: measurement.end?.lng || null,
          end_latitude: measurement.end?.lat || null,
          distance_meters: measurement.distance || null
        });
      }
    }

    await connection.commit();
    connection.release();
    res.send({ success: true, message: "SA-III updated" });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({ message: error.message || "Error update SA-III" });
  }
};
