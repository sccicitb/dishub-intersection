const sql = require("../config/db.js");

const SaVDelayAnalysis = function(delayAnalysis) {
  this.survey_id = delayAnalysis.survey_id;
  this.kode_pendekat = delayAnalysis.kode_pendekat;
  this.arus_lalu_lintas = delayAnalysis.arus_lalu_lintas;
  this.kapasitas = delayAnalysis.kapasitas;
  this.derajat_kejenuhan = delayAnalysis.derajat_kejenuhan;
  this.rasio_hijau = delayAnalysis.rasio_hijau;
  this.nq1 = delayAnalysis.nq1;
  this.nq2 = delayAnalysis.nq2;
  this.nq = delayAnalysis.nq;
  this.nq_max = delayAnalysis.nq_max;
  this.panjang_antrian = delayAnalysis.panjang_antrian;
  this.rasio_kendaraan_terhenti = delayAnalysis.rasio_kendaraan_terhenti;
  this.jumlah_kendaraan_terhenti = delayAnalysis.jumlah_kendaraan_terhenti;
  this.tundaan_lalu_lintas = delayAnalysis.tundaan_lalu_lintas;
  this.tundaan_geometri = delayAnalysis.tundaan_geometri;
  this.tundaan_rata_rata = delayAnalysis.tundaan_rata_rata;
  this.tundaan_total = delayAnalysis.tundaan_total;
};

SaVDelayAnalysis.create = (newDelayAnalysis, result) => {
  sql.query("INSERT INTO sa_v_delay_analysis SET ?", newDelayAnalysis, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newDelayAnalysis });
  });
};

SaVDelayAnalysis.findById = (id, result) => {
  sql.query(`SELECT * FROM sa_v_delay_analysis WHERE id = ${id}`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

SaVDelayAnalysis.findBySurveyId = async (surveyId) => {
  const [rows] = await sql.query(`SELECT * FROM sa_v_delay_analysis WHERE survey_id = ? ORDER BY kode_pendekat`, [surveyId]);
  return rows;
};

SaVDelayAnalysis.findBySurveyAndPendekat = (surveyId, kodePendekat, result) => {
  sql.query(`SELECT * FROM sa_v_delay_analysis WHERE survey_id = ${surveyId} AND kode_pendekat = '${kodePendekat}'`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

SaVDelayAnalysis.updateById = (id, delayAnalysis, result) => {
  sql.query(
    "UPDATE sa_v_delay_analysis SET survey_id = ?, kode_pendekat = ?, arus_lalu_lintas = ?, kapasitas = ?, derajat_kejenuhan = ?, rasio_hijau = ?, nq1 = ?, nq2 = ?, nq = ?, nq_max = ?, panjang_antrian = ?, rasio_kendaraan_terhenti = ?, jumlah_kendaraan_terhenti = ?, tundaan_lalu_lintas = ?, tundaan_geometri = ?, tundaan_rata_rata = ?, tundaan_total = ? WHERE id = ?",
    [delayAnalysis.survey_id, delayAnalysis.kode_pendekat, delayAnalysis.arus_lalu_lintas, delayAnalysis.kapasitas, delayAnalysis.derajat_kejenuhan, delayAnalysis.rasio_hijau, delayAnalysis.nq1, delayAnalysis.nq2, delayAnalysis.nq, delayAnalysis.nq_max, delayAnalysis.panjang_antrian, delayAnalysis.rasio_kendaraan_terhenti, delayAnalysis.jumlah_kendaraan_terhenti, delayAnalysis.tundaan_lalu_lintas, delayAnalysis.tundaan_geometri, delayAnalysis.tundaan_rata_rata, delayAnalysis.tundaan_total, id],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, ...delayAnalysis });
    }
  );
};

SaVDelayAnalysis.remove = (id, result) => {
  sql.query("DELETE FROM sa_v_delay_analysis WHERE id = ?", id, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }
    result(null, res);
  });
};

SaVDelayAnalysis.removeBySurveyId = (surveyId, result) => {
  sql.query("DELETE FROM sa_v_delay_analysis WHERE survey_id = ?", surveyId, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

module.exports = SaVDelayAnalysis; 