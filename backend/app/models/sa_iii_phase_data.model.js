const sql = require("../config/db.js");

const SaIIIPhaseData = function(phaseData) {
  this.survey_id = phaseData.survey_id;
  this.fase_number = phaseData.fase_number;
  this.kode_pendekat = phaseData.kode_pendekat;
  this.jarak_type = phaseData.jarak_type;
  this.pendekat_u = phaseData.pendekat_u;
  this.pendekat_s = phaseData.pendekat_s;
  this.pendekat_t = phaseData.pendekat_t;
  this.pendekat_b = phaseData.pendekat_b;
  this.kecepatan_berangkat = phaseData.kecepatan_berangkat;
  this.kecepatan_datang = phaseData.kecepatan_datang;
  this.kecepatan_pejalan_kaki = phaseData.kecepatan_pejalan_kaki;
  this.waktu_tempuh = phaseData.waktu_tempuh;
  this.w_ms = phaseData.w_ms;
  this.w_ms_disesuaikan = phaseData.w_ms_disesuaikan;
  this.w_k = phaseData.w_k;
  this.w_ah = phaseData.w_ah;
  this.w_hh = phaseData.w_hh;
};

SaIIIPhaseData.create = (newPhaseData, result) => {
  sql.query("INSERT INTO sa_iii_phase_data SET ?", newPhaseData, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newPhaseData });
  });
};

SaIIIPhaseData.findById = (id, result) => {
  sql.query(`SELECT * FROM sa_iii_phase_data WHERE id = ${id}`, (err, res) => {
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

SaIIIPhaseData.findBySurveyId = async (surveyId) => {
  const [rows] = await sql.query(`SELECT * FROM sa_iii_phase_data WHERE survey_id = ? ORDER BY fase_number, kode_pendekat, jarak_type`, [surveyId]);
  return rows;
};

SaIIIPhaseData.findBySurveyAndFase = (surveyId, faseNumber, result) => {
  sql.query(`SELECT * FROM sa_iii_phase_data WHERE survey_id = ${surveyId} AND fase_number = ${faseNumber} ORDER BY kode_pendekat, jarak_type`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res);
  });
};

SaIIIPhaseData.updateById = (id, phaseData, result) => {
  sql.query(
    "UPDATE sa_iii_phase_data SET survey_id = ?, fase_number = ?, kode_pendekat = ?, jarak_type = ?, pendekat_u = ?, pendekat_s = ?, pendekat_t = ?, pendekat_b = ?, kecepatan_berangkat = ?, kecepatan_datang = ?, kecepatan_pejalan_kaki = ?, waktu_tempuh = ?, w_ms = ?, w_ms_disesuaikan = ?, w_k = ?, w_ah = ?, w_hh = ? WHERE id = ?",
    [phaseData.survey_id, phaseData.fase_number, phaseData.kode_pendekat, phaseData.jarak_type, phaseData.pendekat_u, phaseData.pendekat_s, phaseData.pendekat_t, phaseData.pendekat_b, phaseData.kecepatan_berangkat, phaseData.kecepatan_datang, phaseData.kecepatan_pejalan_kaki, phaseData.waktu_tempuh, phaseData.w_ms, phaseData.w_ms_disesuaikan, phaseData.w_k, phaseData.w_ah, phaseData.w_hh, id],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, ...phaseData });
    }
  );
};

SaIIIPhaseData.remove = (id, result) => {
  sql.query("DELETE FROM sa_iii_phase_data WHERE id = ?", id, (err, res) => {
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

SaIIIPhaseData.removeBySurveyId = (surveyId, result) => {
  sql.query("DELETE FROM sa_iii_phase_data WHERE survey_id = ?", surveyId, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

module.exports = SaIIIPhaseData; 
