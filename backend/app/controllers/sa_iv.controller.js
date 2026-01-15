const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaIVCapacityAnalysis = require("../models/sa_iv_capacity_analysis.model.js");
const SaIVPhaseAnalysis = require("../models/sa_iv_phase_analysis.model.js");
const SaIVCalculationConfig = require("../models/sa_iv_calculation_config.model.js");

const safeJsonParse = (jsonString, defaultValue = ['Default Road']) => {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : 
           Array.isArray(jsonString) ? jsonString : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

exports.createCompleteSurvey = async (req, res) => {
  const { surveyHeader, capacityAnalysis, phaseAnalysis } = req.body;

  if (!surveyHeader || !capacityAnalysis || !phaseAnalysis) {
    return res.status(400).json({
      success: false,
      error: "Data lengkap diperlukan"
    });
  }

  const sql = require("../config/db.js");
  let connection;

  try {
    connection = await sql.getConnection();
    await connection.beginTransaction();

    const headerId = surveyHeader.id;

    await connection.query(
      "INSERT INTO sa_iv_capacity_foot (survey_id, whh, sbp, S, ras) VALUES (?, ?, ?, ?, ?)",
      [headerId, capacityAnalysis.foot.whh, capacityAnalysis.foot.sbp, capacityAnalysis.foot.S, capacityAnalysis.foot.ras]
    );

    for (const analysis of capacityAnalysis.tabel) {
      await connection.query("INSERT INTO sa_iv_capacity_analysis SET ?", {
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
      });
    }

    for (const analysis of phaseAnalysis) {
      await connection.query("INSERT INTO sa_iv_phase_analysis SET ?", {
        survey_id: headerId,
        kode_pendekat: analysis.kode_pendekat,
        phases: JSON.stringify(analysis.phases),
        cycle_time: analysis.cycle_time
      });
    }

    await connection.commit();
    connection.release();
    res.json({ success: true, headerId, message: "SA-IV tersimpan" });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).json({ success: false, error: error.message || "Error SA-IV" });
  }
};

exports.getCompleteSurvey = async (req, res) => {
  const headerId = req.params.surveyId;
  const sql = require("../config/db.js");

  try {
    const [headerRows] = await sql.query("SELECT * FROM sa_survey_headers WHERE id = ?", [headerId]);
    if (headerRows.length === 0) {
      return res.status(404).json({ success: false, error: `Survey ${headerId} tidak ditemukan` });
    }

    const header = headerRows[0];
    const [footRows] = await sql.query("SELECT * FROM sa_iv_capacity_foot WHERE survey_id = ?", [headerId]);
    const [capacityRows] = await sql.query("SELECT * FROM sa_iv_capacity_analysis WHERE survey_id = ?", [headerId]);
    const [phaseRows] = await sql.query("SELECT * FROM sa_iv_phase_analysis WHERE survey_id = ?", [headerId]);

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

    const capacityAnalysis = {
      foot: footRows[0] || {},
      tabel: capacityRows.map(item => ({
        kodePendekat: item.kode_pendekat,
        hijauFase: item.hijau_fase,
        tipependekat: item.tipe_pendekat,
        rasioKendaraanBelok: safeJsonParse(item.rasio_kendaraan_belok),
        arusBelokKanan: safeJsonParse(item.arus_belok_kanan),
        lebarEfektif: item.lebar_efektif,
        arusJenuhDasar: item.arus_jenuh_dasar,
        faktorPenyesuaian: safeJsonParse(item.faktor_penyesuaian),
        arusJenuhYangDisesuaikan: safeJsonParse(item.arus_jenuh_yang_disesuaikan),
        arusLaluLintas: item.arus_lalu_lintas,
        rasioArus: item.rasio_arus,
        rasioFase: item.rasio_fase,
        waktuHijauPerFase: item.waktu_hijau_per_fase,
        kapasitas: item.kapasitas,
        derajatKejenuhan: item.derajat_kejenuhan
      }))
    };

    const phaseAnalysis = phaseRows.map(item => ({
      kode_pendekat: item.kode_pendekat,
      phases: safeJsonParse(item.phases),
      cycle_time: item.cycle_time
    }));

    res.json({ success: true, data: { surveyHeader, capacityAnalysis, phaseAnalysis } });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Error ambil SA-IV" });
  }
};

exports.updateCompleteSurvey = async (req, res) => {
  const headerId = req.params.surveyId;
  const { surveyHeader, capacityAnalysis, phaseAnalysis } = req.body;

  if (!surveyHeader || !capacityAnalysis) {
    return res.status(400).json({ success: false, error: "Data lengkap diperlukan" });
  }

  const sql = require("../config/db.js");
  let connection;

  try {
    connection = await sql.getConnection();
    await connection.beginTransaction();

    await connection.query("DELETE FROM sa_iv_capacity_foot WHERE survey_id = ?", [headerId]);
    await connection.query("DELETE FROM sa_iv_capacity_analysis WHERE survey_id = ?", [headerId]);
    await connection.query("DELETE FROM sa_iv_phase_analysis WHERE survey_id = ?", [headerId]);

    await connection.query(
      "INSERT INTO sa_iv_capacity_foot (survey_id, whh, sbp, S, ras) VALUES (?, ?, ?, ?, ?)",
      [headerId, capacityAnalysis.foot.whh, capacityAnalysis.foot.sbp, capacityAnalysis.foot.S, capacityAnalysis.foot.ras]
    );

    for (const analysis of capacityAnalysis.tabel) {
      await connection.query("INSERT INTO sa_iv_capacity_analysis SET ?", {
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
      });
    }

    if (phaseAnalysis && phaseAnalysis.length > 0) {
      for (const analysis of phaseAnalysis) {
        await connection.query("INSERT INTO sa_iv_phase_analysis SET ?", {
          survey_id: headerId,
          kode_pendekat: analysis.kode_pendekat,
          phases: JSON.stringify(analysis.phases),
          cycle_time: analysis.cycle_time
        });
      }
    }

    await connection.commit();
    connection.release();
    res.json({ success: true, message: "SA-IV updated" });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).json({ success: false, error: error.message || "Error update SA-IV" });
  }
};

exports.getCalculationConfig = async (req, res) => {
  try {
    const config = await SaIVCalculationConfig.getFormattedConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error config: " + error.message });
  }
};
