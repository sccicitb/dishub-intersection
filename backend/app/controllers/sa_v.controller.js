const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaVDelayAnalysis = require("../models/sa_v_delay_analysis.model.js");
const SaVPerformanceSummary = require("../models/sa_v_performance_summary.model.js");

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
// SA-V COMPLETE SURVEY OPERATIONS (Phase 6 - 3 APIs)
// =====================================================

// Create a complete SA-V survey in a single transaction
exports.createCompleteSurvey = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const { surveyHeader, delayData, performanceSummary } = req.body;

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

    // 2. Create delay analysis records
    if (delayData && Array.isArray(delayData)) {
      for (const delay of delayData) {
        const delayRecord = {
          survey_id: headerId,
          kode_pendekat: delay.kode,
          arus_lalu_lintas: delay.q,
          kapasitas: delay.c,
          derajat_kejenuhan: delay.dj,
          rasio_hijau: delay.rh,
          nq1: delay.nq1,
          nq2: delay.nq2,
          nq: delay.nq,
          nq_max: delay.nqMax,
          panjang_antrian: delay.pa,
          rasio_kendaraan_terhenti: delay.rqh,
          jumlah_kendaraan_terhenti: delay.nqh,
          tundaan_lalu_lintas: delay.tl,
          tundaan_geometri: delay.tg,
          tundaan_rata_rata: delay.t,
          tundaan_total: delay.tundaanTotal
        };

        await connection.query("INSERT INTO sa_v_delay_analysis SET ?", delayRecord);
      }
    }

    // 3. Create performance summary record
    if (performanceSummary) {
      const summaryRecord = {
        survey_id: headerId,
        total_kendaraan_terhenti: performanceSummary.totalKendaraanTerhenti,
        rasio_kendaraan_terhenti_rata: performanceSummary.rasioKendaraanTerhentiRata,
        total_tundaan: performanceSummary.totalTundaan,
        tundaan_simpang_rata: performanceSummary.tundaanSimpangRata,
        level_of_service: performanceSummary.levelOfService,
        performance_evaluation: performanceSummary.performanceEvaluation
      };

      await connection.query("INSERT INTO sa_v_performance_summary SET ?", summaryRecord);
    }

    // Commit transaction
    await connection.commit();
    
    connection.release();
    res.send({
      headerId: headerId,
      message: "SA-V Survey created successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({
      message: error.message || "Some error occurred while creating the SA-V survey."
    });
  }
};

// Get complete SA-V survey with all related data
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

    // Get delay analysis data
    const [delayRows] = await sql.query("SELECT * FROM sa_v_delay_analysis WHERE survey_id = ?", [headerId]);
    
    // Get performance summary data
    const [summaryRows] = await sql.query("SELECT * FROM sa_v_performance_summary WHERE survey_id = ?", [headerId]);

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

    // Transform delay data
    const transformedDelayData = delayRows.map(item => ({
      kode: item.kode_pendekat,
      q: item.arus_lalu_lintas,
      c: item.kapasitas,
      dj: item.derajat_kejenuhan,
      rh: item.rasio_hijau,
      nq1: item.nq1,
      nq2: item.nq2,
      nq: item.nq,
      nqMax: item.nq_max,
      pa: item.panjang_antrian,
      rqh: item.rasio_kendaraan_terhenti,
      nqh: item.jumlah_kendaraan_terhenti,
      tl: item.tundaan_lalu_lintas,
      tg: item.tundaan_geometri,
      t: item.tundaan_rata_rata,
      tundaanTotal: item.tundaan_total
    }));

    // Transform performance summary data
    const transformedPerformanceSummary = summaryRows.length > 0 ? {
      totalKendaraanTerhenti: summaryRows[0].total_kendaraan_terhenti,
      rasioKendaraanTerhentiRata: summaryRows[0].rasio_kendaraan_terhenti_rata,
      totalTundaan: summaryRows[0].total_tundaan,
      tundaanSimpangRata: summaryRows[0].tundaan_simpang_rata,
      levelOfService: summaryRows[0].level_of_service,
      performanceEvaluation: summaryRows[0].performance_evaluation
    } : null;

    res.send({
      success: true,
      data: {
        surveyHeader,
        delayData: transformedDelayData,
        performanceSummary: transformedPerformanceSummary
      }
    });

  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving the SA-V survey."
    });
  }
};

// Update a complete SA-V survey
exports.updateCompleteSurvey = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const headerId = req.params.surveyId;
  const { surveyHeader, delayData, performanceSummary } = req.body;

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

    // 2. Delete existing data
    await connection.query("DELETE FROM sa_v_delay_analysis WHERE survey_id = ?", [headerId]);
    await connection.query("DELETE FROM sa_v_performance_summary WHERE survey_id = ?", [headerId]);

    // 3. Create new delay analysis records
    if (delayData && Array.isArray(delayData)) {
      for (const delay of delayData) {
        const delayRecord = {
          survey_id: headerId,
          kode_pendekat: delay.kode,
          arus_lalu_lintas: delay.q,
          kapasitas: delay.c,
          derajat_kejenuhan: delay.dj,
          rasio_hijau: delay.rh,
          nq1: delay.nq1,
          nq2: delay.nq2,
          nq: delay.nq,
          nq_max: delay.nqMax,
          panjang_antrian: delay.pa,
          rasio_kendaraan_terhenti: delay.rqh,
          jumlah_kendaraan_terhenti: delay.nqh,
          tundaan_lalu_lintas: delay.tl,
          tundaan_geometri: delay.tg,
          tundaan_rata_rata: delay.t,
          tundaan_total: delay.tundaanTotal
        };

        await connection.query("INSERT INTO sa_v_delay_analysis SET ?", delayRecord);
      }
    }

    // 4. Create new performance summary record
    if (performanceSummary) {
      const summaryRecord = {
        survey_id: headerId,
        total_kendaraan_terhenti: performanceSummary.totalKendaraanTerhenti,
        rasio_kendaraan_terhenti_rata: performanceSummary.rasioKendaraanTerhentiRata,
        total_tundaan: performanceSummary.totalTundaan,
        tundaan_simpang_rata: performanceSummary.tundaanSimpangRata,
        level_of_service: performanceSummary.levelOfService,
        performance_evaluation: performanceSummary.performanceEvaluation
      };

      await connection.query("INSERT INTO sa_v_performance_summary SET ?", summaryRecord);
    }

    // Commit transaction
    await connection.commit();
    
    connection.release();
    res.send({
      success: true,
      message: "SA-V Survey updated successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({
      message: error.message || "Some error occurred while updating the SA-V survey."
    });
  }
}; 