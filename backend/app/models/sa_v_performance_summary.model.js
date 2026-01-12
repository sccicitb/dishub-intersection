const sql = require("../config/db.js");

const SaVPerformanceSummary = function(performanceSummary) {
  this.survey_id = performanceSummary.survey_id;
  this.total_kendaraan_terhenti = performanceSummary.total_kendaraan_terhenti;
  this.rasio_kendaraan_terhenti_rata = performanceSummary.rasio_kendaraan_terhenti_rata;
  this.total_tundaan = performanceSummary.total_tundaan;
  this.tundaan_simpang_rata = performanceSummary.tundaan_simpang_rata;
  this.level_of_service = performanceSummary.level_of_service;
  this.performance_evaluation = performanceSummary.performance_evaluation;
};

SaVPerformanceSummary.create = (newPerformanceSummary, result) => {
  sql.query("INSERT INTO sa_v_performance_summary SET ?", newPerformanceSummary, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newPerformanceSummary });
  });
};

SaVPerformanceSummary.findById = (id, result) => {
  sql.query(`SELECT * FROM sa_v_performance_summary WHERE id = ${id}`, (err, res) => {
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

SaVPerformanceSummary.findBySurveyId = async (surveyId) => {
  const [rows] = await sql.query(`SELECT * FROM sa_v_performance_summary WHERE survey_id = ?`, [surveyId]);
  return rows.length > 0 ? rows[0] : null;
};

SaVPerformanceSummary.updateById = (id, performanceSummary, result) => {
  sql.query(
    "UPDATE sa_v_performance_summary SET survey_id = ?, total_kendaraan_terhenti = ?, rasio_kendaraan_terhenti_rata = ?, total_tundaan = ?, tundaan_simpang_rata = ?, level_of_service = ?, performance_evaluation = ? WHERE id = ?",
    [performanceSummary.survey_id, performanceSummary.total_kendaraan_terhenti, performanceSummary.rasio_kendaraan_terhenti_rata, performanceSummary.total_tundaan, performanceSummary.tundaan_simpang_rata, performanceSummary.level_of_service, performanceSummary.performance_evaluation, id],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, ...performanceSummary });
    }
  );
};

SaVPerformanceSummary.remove = (id, result) => {
  sql.query("DELETE FROM sa_v_performance_summary WHERE id = ?", id, (err, res) => {
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

SaVPerformanceSummary.removeBySurveyId = (surveyId, result) => {
  sql.query("DELETE FROM sa_v_performance_summary WHERE survey_id = ?", surveyId, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

// Calculate level of service based on average delay
SaVPerformanceSummary.calculateLevelOfService = (averageDelay) => {
  if (averageDelay <= 10) return 'A';
  if (averageDelay <= 20) return 'B';
  if (averageDelay <= 35) return 'C';
  if (averageDelay <= 55) return 'D';
  if (averageDelay <= 80) return 'E';
  return 'F';
};

// Generate performance evaluation text
SaVPerformanceSummary.generatePerformanceEvaluation = (levelOfService, averageDelay) => {
  const evaluations = {
    'A': 'Excellent - Very low delay, excellent traffic flow',
    'B': 'Good - Low delay, good traffic flow',
    'C': 'Fair - Moderate delay, acceptable traffic flow',
    'D': 'Poor - High delay, poor traffic flow',
    'E': 'Very Poor - Very high delay, very poor traffic flow',
    'F': 'Failing - Extremely high delay, failing traffic flow'
  };
  
  return evaluations[levelOfService] || 'Unknown performance level';
};

module.exports = SaVPerformanceSummary; 