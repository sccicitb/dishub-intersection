const sql = require("../config/db.js");

const SaIVPhaseAnalysis = function(phaseAnalysis) {
  this.survey_id = phaseAnalysis.survey_id;
  this.kode_pendekat = phaseAnalysis.kode_pendekat;
  this.tipe_pendekat = phaseAnalysis.tipe_pendekat;
  this.arah = phaseAnalysis.arah;
  this.pemisahan_lurus_rka = phaseAnalysis.pemisahan_lurus_rka;
  this.phases = phaseAnalysis.phases;
  this.whi_total = phaseAnalysis.whi_total;
  this.cycle_time = phaseAnalysis.cycle_time;
};

SaIVPhaseAnalysis.create = (newPhaseAnalysis, result) => {
  sql.query("INSERT INTO sa_iv_phase_analysis SET ?", newPhaseAnalysis, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newPhaseAnalysis });
  });
};

SaIVPhaseAnalysis.findById = (id, result) => {
  sql.query(`SELECT * FROM sa_iv_phase_analysis WHERE id = ${id}`, (err, res) => {
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

SaIVPhaseAnalysis.findBySurveyId = async (surveyId) => {
  const [rows] = await sql.query(`SELECT * FROM sa_iv_phase_analysis WHERE survey_id = ? ORDER BY kode_pendekat`, [surveyId]);
  return rows;
};

SaIVPhaseAnalysis.findBySurveyAndPendekat = (surveyId, kodePendekat, result) => {
  sql.query(`SELECT * FROM sa_iv_phase_analysis WHERE survey_id = ${surveyId} AND kode_pendekat = '${kodePendekat}'`, (err, res) => {
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

SaIVPhaseAnalysis.updateById = (id, phaseAnalysis, result) => {
  sql.query(
    "UPDATE sa_iv_phase_analysis SET survey_id = ?, kode_pendekat = ?, tipe_pendekat = ?, arah = ?, pemisahan_lurus_rka = ?, phases = ?, whi_total = ?, cycle_time = ? WHERE id = ?",
    [phaseAnalysis.survey_id, phaseAnalysis.kode_pendekat, phaseAnalysis.tipe_pendekat, phaseAnalysis.arah, phaseAnalysis.pemisahan_lurus_rka, phaseAnalysis.phases, phaseAnalysis.whi_total, phaseAnalysis.cycle_time, id],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, ...phaseAnalysis });
    }
  );
};

SaIVPhaseAnalysis.remove = (id, result) => {
  sql.query("DELETE FROM sa_iv_phase_analysis WHERE id = ?", id, (err, res) => {
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

SaIVPhaseAnalysis.removeBySurveyId = (surveyId, result) => {
  sql.query("DELETE FROM sa_iv_phase_analysis WHERE survey_id = ?", surveyId, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

module.exports = SaIVPhaseAnalysis; 
