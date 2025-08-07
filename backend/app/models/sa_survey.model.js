const sql = require("../config/db.js");

const SaSurvey = function(survey) {
  this.simpang_id = survey.simpang_id;
  this.survey_type = survey.survey_type;
  this.tanggal = survey.tanggal;
  this.perihal = survey.perihal;
  this.status = survey.status || 'draft';
};

SaSurvey.create = (newSurvey, result) => {
  sql.query("INSERT INTO sa_surveys SET ?", newSurvey, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newSurvey });
  });
};

SaSurvey.findById = (id, result) => {
  sql.query(`SELECT * FROM sa_surveys WHERE id = ${id}`, (err, res) => {
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

SaSurvey.getAll = (params, result) => {
  let query = "SELECT * FROM sa_surveys";

  if (params) {
    const conditions = [];
    if (params.simpang_id) {
        conditions.push(`simpang_id = ${params.simpang_id}`);
    }
    if (params.survey_type) {
        conditions.push(`survey_type = '${params.survey_type}'`);
    }
    if (params.status) {
        conditions.push(`status = '${params.status}'`);
    }
    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }
  }

  sql.query(query, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

SaSurvey.updateById = (id, survey, result) => {
  sql.query(
    "UPDATE sa_surveys SET simpang_id = ?, survey_type = ?, tanggal = ?, perihal = ?, status = ? WHERE id = ?",
    [survey.simpang_id, survey.survey_type, survey.tanggal, survey.perihal, survey.status, id],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, ...survey });
    }
  );
};

SaSurvey.remove = (id, result) => {
  sql.query("DELETE FROM sa_surveys WHERE id = ?", id, (err, res) => {
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

module.exports = SaSurvey; 