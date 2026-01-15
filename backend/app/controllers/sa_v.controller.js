const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaVDelayAnalysis = require("../models/sa_v_delay_analysis.model.js");
const SaVPerformanceSummary = require("../models/sa_v_performance_summary.model.js");

const safeJsonParse = (jsonString, defaultValue = ['Default Road']) => {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : 
           Array.isArray(jsonString) ? jsonString : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

exports.createCompleteSurvey = async (req, res) => {
  if (!req.body.SAV) {
    return res.status(400).send({ message: "Payload SAV tidak ditemukan!" });
  }

  const sql = require("../config/db.js");
  let connection;

  try {
    connection = await sql.getConnection();
    await connection.beginTransaction();

    const SAV = req.body.SAV;
    const [headerResult] = await connection.query(
      "INSERT INTO sa_survey_headers (tanggal, created_at) VALUES (NOW(), NOW())"
    );
    const headerId = headerResult.insertId;

    if (SAV.data && Array.isArray(SAV.data)) {
      for (const delay of SAV.data) {
        await connection.query("INSERT INTO sa_v_delay_analysis SET ?", {
          survey_id: headerId,
          kode_pendekat: delay.kode,
          arus_lalu_lintas: delay.q,
          kapasitas: delay.c,
          derajat_kejenuhan: delay.dj,
          rasio_hijau: delay.rh,
          rasio_kendaraan_terhenti: delay.rqh,
          nq1: delay.nq1,
          nq2: delay.nq2,
          nq: delay.nq,
          nq_max: delay.nqMax,
          panjang_antrian: delay.pa,
          jumlah_kendaraan_terhenti: delay.nqh,
          tundaan_lalu_lintas: delay.tl,
          tundaan_geometri: delay.tg,
          tundaan_rata_rata: delay.t,
          tundaan_total: delay.tundaanTotal
        });
      }
    }

    await connection.query("INSERT INTO sa_v_performance_summary SET ?", {
      survey_id: headerId,
      tundaan_simpang_rata: SAV.trata,
      rasio_kendaraan_terhenti_rata: SAV.totalrata,
      total_kendaraan_terhenti: SAV.rkhrata,
      total_q: SAV.qtotal,
      row_1: SAV.row_1,
      row_2: SAV.row_2,
      row_3: SAV.row_3,
      row_4: SAV.row_4,
      qbkijt: SAV.qbkijt,
      total_tundaan: SAV.total_tundaan,
      tkt: SAV.tkt,
      pol: SAV.pol,
      rkt: SAV.rkt,
      bkijt: SAV.bkijt,
      level_of_service: SAV.los,
      polution: SAV.polution,
      loss: SAV.loss
    });

    await connection.commit();
    connection.release();
    res.send({ success: true, headerId, message: "SA-V tersimpan" });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({ message: error.message || "Error SA-V" });
  }
};

exports.updateCompleteSurvey = async (req, res) => {
  if (!req.body.SAV) {
    return res.status(400).send({ message: "Payload SAV tidak ditemukan!" });
  }

  const headerId = req.params.surveyId;
  const SAV = req.body.SAV;
  const sql = require("../config/db.js");
  let connection;

  try {
    connection = await sql.getConnection();
    await connection.beginTransaction();

    await connection.query("UPDATE sa_survey_headers SET updated_at = NOW() WHERE id = ?", [headerId]);
    await connection.query("DELETE FROM sa_v_delay_analysis WHERE survey_id = ?", [headerId]);
    await connection.query("DELETE FROM sa_v_performance_summary WHERE survey_id = ?", [headerId]);

    if (Array.isArray(SAV.data)) {
      for (const delay of SAV.data) {
        await connection.query("INSERT INTO sa_v_delay_analysis SET ?", {
          survey_id: headerId,
          kode_pendekat: delay.kode,
          arus_lalu_lintas: delay.q,
          kapasitas: delay.c,
          derajat_kejenuhan: delay.dj,
          rasio_hijau: delay.rh,
          rasio_kendaraan_terhenti: delay.rqh,
          nq1: delay.nq1,
          nq2: delay.nq2,
          nq: delay.nq,
          nq_max: delay.nqMax,
          panjang_antrian: delay.pa,
          jumlah_kendaraan_terhenti: delay.nqh,
          tundaan_lalu_lintas: delay.tl,
          tundaan_geometri: delay.tg,
          tundaan_rata_rata: delay.t,
          tundaan_total: delay.tundaanTotal
        });
      }
    }

    await connection.query("INSERT INTO sa_v_performance_summary SET ?", {
      survey_id: headerId,
      tundaan_simpang_rata: SAV.trata,
      rasio_kendaraan_terhenti_rata: SAV.totalrata,
      total_kendaraan_terhenti: SAV.rkhrata,
      total_q: SAV.qtotal,
      row_1: SAV.row_1,
      row_2: SAV.row_2,
      row_3: SAV.row_3,
      row_4: SAV.row_4,
      qbkijt: SAV.qbkijt,
      total_tundaan: SAV.total_tundaan,
      tkt: SAV.tkt,
      pol: SAV.pol,
      rkt: SAV.rkt,
      bkijt: SAV.bkijt,
      level_of_service: SAV.los,
      polution: SAV.polution,
      loss: SAV.loss
    });

    await connection.commit();
    connection.release();
    res.send({ success: true, message: "SA-V updated" });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({ message: error.message || "Error update SA-V" });
  }
};

exports.getCompleteSurvey = async (req, res) => {
  const headerId = req.params.surveyId;
  const sql = require("../config/db.js");

  try {
    const [summaryRows] = await sql.query(
      "SELECT * FROM sa_v_performance_summary WHERE survey_id = ? LIMIT 1",
      [headerId]
    );
    if (summaryRows.length === 0) {
      return res.status(404).send({ message: `Survey ${headerId} tidak ditemukan` });
    }

    const summary = summaryRows[0];
    const [delayRows] = await sql.query(
      "SELECT * FROM sa_v_delay_analysis WHERE survey_id = ?",
      [headerId]
    );

    const SAV = {
      trata: summary.tundaan_simpang_rata,
      totalrata: summary.rasio_kendaraan_terhenti_rata,
      rkhrata: summary.total_kendaraan_terhenti,
      qtotal: summary.total_q,
      row_1: summary.row_1,
      row_2: summary.row_2,
      row_3: summary.row_3,
      row_4: summary.row_4,
      qbkijt: summary.qbkijt,
      total_tundaan: summary.total_tundaan,
      tkt: summary.tkt,
      pol: summary.pol,
      rkt: summary.rkt,
      bkijt: summary.bkijt,
      los: summary.level_of_service,
      polution: summary.polution,
      loss: summary.loss,
      data: delayRows.map(item => ({
        kode: item.kode_pendekat,
        q: item.arus_lalu_lintas,
        c: item.kapasitas,
        dj: item.derajat_kejenuhan,
        rh: item.rasio_hijau,
        rqh: item.rasio_kendaraan_terhenti,
        nq1: item.nq1,
        nq2: item.nq2,
        nq: item.nq,
        nqMax: item.nq_max,
        pa: item.panjang_antrian,
        nqh: item.jumlah_kendaraan_terhenti,
        tl: item.tundaan_lalu_lintas,
        tg: item.tundaan_geometri,
        t: item.tundaan_rata_rata,
        tundaanTotal: item.tundaan_total
      }))
    };

    res.send({ success: true, SAV });

  } catch (error) {
    res.status(500).send({ message: error.message || "Error ambil SA-V" });
  }
};
