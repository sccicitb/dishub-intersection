const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaIVCapacityAnalysis = require("../models/sa_iv_capacity_analysis.model.js");
const SaIVPhaseAnalysis = require("../models/sa_iv_phase_analysis.model.js");
const SaIVCalculationConfig = require("../models/sa_iv_calculation_config.model.js");

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
    // const headerData = {
    //   tanggal: surveyHeader.tanggal,
    //   perihal: surveyHeader.perihal,
    //   kabupaten_kota: surveyHeader.kabupatenKota || surveyHeader.kabupaten_kota || 'Default City',
    //   lokasi: surveyHeader.lokasi || 'Default Location',
    //   ruas_jalan_mayor: Array.isArray(surveyHeader.ruasJalanMayor)
    //     ? JSON.stringify(surveyHeader.ruasJalanMayor)
    //     : JSON.stringify(['Default Road']),
    //   ruas_jalan_minor: Array.isArray(surveyHeader.ruasJalanMinor)
    //     ? JSON.stringify(surveyHeader.ruasJalanMinor)
    //     : JSON.stringify(['Default Road']),
    //   ukuran_kota: surveyHeader.ukuranKota || surveyHeader.ukuran_kota || '0',
    //   periode: surveyHeader.periode || 'Pertama'
    // };

    // const [headerResult] = await connection.query("INSERT INTO sa_survey_headers SET ?", headerData);
    const headerId = surveyHeader.id;

    // Insert capacity analysis data
    // for (const analysis of capacityAnalysis) {
    //   const capacityData = {
    //     survey_id: headerId,
    //     kode_pendekat: analysis.kode_pendekat,
    //     rasio_kendaraan_belok: JSON.stringify(analysis.rasio_kendaraan_belok),
    //     arus_belok_kanan: JSON.stringify(analysis.arus_belok_kanan),
    //     arus_jenuh_dasar: analysis.arus_jenuh_dasar,
    //     faktor_penyesuaian: JSON.stringify(analysis.faktor_penyesuaian),
    //     kapasitas: analysis.kapasitas,
    //     derajat_kejenuhan: analysis.derajat_kejenuhan
    //   };

    //   await connection.query("INSERT INTO sa_iv_capacity_analysis SET ?", capacityData);
    // }
    // Insert capacity analysis data
    await connection.query(
      "INSERT INTO sa_iv_capacity_foot (survey_id, whh, sbp, S, ras) VALUES (?, ?, ?, ?, ?)",
      [
        headerId,
        capacityAnalysis.foot.whh,
        capacityAnalysis.foot.sbp,
        capacityAnalysis.foot.S,
        capacityAnalysis.foot.ras
      ]
    );

    for (const analysis of capacityAnalysis.tabel) {
      const capacityData = {
        survey_id: headerId,
        kode_pendekat: analysis.kodePendekat,
        hijau_fase: analysis.hijauFase,
        tipe_pendekat: analysis.tipependekat,
        rasio_kendaraan_belok: JSON.stringify(analysis.rasioKendaraanBelok),
        arus_belok_kanan: JSON.stringify(analysis.arusBelokKanan),
        lebar_efektif: analysis.lebarEfektif,
        arus_jenuh_dasar: analysis.arusJenuhDasar,
        faktor_penyesuaian: JSON.stringify(analysis.faktorPenyesuaian),
        arus_jenuh_yang_disesuaikan: JSON.stringify(analysis.arusJenuhYangDisesuaikan),
        arus_lalu_lintas: analysis.arusLaluLintas,
        rasio_arus: analysis.rasioArus,
        rasio_fase: analysis.rasioFase,
        waktu_hijau_per_fase: analysis.waktuHijauPerFase,
        kapasitas: analysis.kapasitas,
        derajat_kejenuhan: analysis.derajatKejenuhan
      };

      await connection.query("INSERT INTO sa_iv_capacity_analysis SET ?", capacityData);
    }



    // Insert phase analysis data
    for (const analysis of phaseAnalysis) {
      const phaseData = {
        survey_id: headerId,
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
      headerId: headerId,
      message: "SA-IV Survey created successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).json({
      success: false,
      error: error.message || "Some error occurred while creating the SA-IV survey."
    });
  }
};

// Get complete SA-IV survey
exports.getCompleteSurvey = async (req, res) => {
  const headerId = req.params.surveyId;
  const sql = require("../config/db.js");

  try {
    // Get main header data
    const [headerRows] = await sql.query("SELECT * FROM sa_survey_headers WHERE id = ?", [headerId]);
    if (headerRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Survey header with id ${headerId} not found.`
      });
    }

    const header = headerRows[0];

    // Get capacity analysis data
    const [footRows] = await sql.query("SELECT * FROM sa_iv_capacity_foot WHERE survey_id = ?", [headerId]);
    
    const [capacityRows] = await sql.query("SELECT * FROM sa_iv_capacity_analysis WHERE survey_id = ?", [headerId]);
    // Get phase analysis data
    const [phaseRows] = await sql.query("SELECT * FROM sa_iv_phase_analysis WHERE survey_id = ?", [headerId]);

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

    // Transform capacity analysis data
    // const transformedCapacityAnalysis = capacityRows.map(item => ({
    //   kode_pendekat: item.kode_pendekat,
    //   rasio_kendaraan_belok: safeJsonParse(item.rasio_kendaraan_belok),
    //   arus_belok_kanan: safeJsonParse(item.arus_belok_kanan),
    //   arus_jenuh_dasar: item.arus_jenuh_dasar,
    //   faktor_penyesuaian: safeJsonParse(item.faktor_penyesuaian),
    //   kapasitas: item.kapasitas,
    //   derajat_kejenuhan: item.derajat_kejenuhan
    // }));

    const transformedCapacityAnalysis = {
      foot: safeJsonParse(footRows) || {}, // data foot
      table: capacityRows.map(item => ({
        kode_pendekat: item.kode_pendekat,
        hijau_fase: item.hijau_fase,
        tipe_pendekat: item.tipe_pendekat,
        rasio_kendaraan_belok: item.rasio_kendaraan_belok,
        arus_belok_kanan: item.arus_belok_kanan,
        lebar_efektif: item.lebar_efektif,
        arus_jenuh_dasar: item.arus_jenuh_dasar,
        faktor_penyesuaian: item.faktor_penyesuaian,
        arus_jenuh_yang_disesuaikan: item.arus_jenuh_yang_disesuaikan,
        arus_lalu_lintas: item.arus_lalu_lintas,
        rasio_arus: item.rasio_arus,
        rasio_fase: item.rasio_fase,
        waktu_hijau_per_fase: item.waktu_hijau_per_fase,
        kapasitas: item.kapasitas,
        derajat_kejenuhan: item.derajat_kejenuhan
      }))
    };


    // Transform phase analysis data
    const transformedPhaseAnalysis = phaseRows.map(item => ({
      kode_pendekat: item.kode_pendekat,
      phases: safeJsonParse(item.phases),
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
      error: error.message || "Some error occurred while retrieving the SA-IV survey."
    });
  }
};

// Update complete SA-IV survey
exports.updateCompleteSurvey = async (req, res) => {
  const headerId = req.params.surveyId;
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

    // Delete existing data
    await connection.query("DELETE FROM sa_iv_capacity_analysis WHERE survey_id = ?", [headerId]);
    await connection.query("DELETE FROM sa_iv_phase_analysis WHERE survey_id = ?", [headerId]);

    // Insert new capacity analysis data
    for (const analysis of capacityAnalysis) {
      const capacityData = {
        survey_id: headerId,
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
        survey_id: headerId,
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
      error: error.message || "Some error occurred while updating the SA-IV survey."
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