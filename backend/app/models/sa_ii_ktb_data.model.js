const sql = require("../config/db.js");

const SaIIKTBData = function(ktbData) {
  this.survey_id = ktbData.survey_id;
  this.direction = ktbData.direction;
  this.ktb_count = ktbData.ktb_count;
  this.turn_ratio = ktbData.turn_ratio;
  this.rktb_value = ktbData.rktb_value;
};

SaIIKTBData.create = (newKTBData, result) => {
  sql.query("INSERT INTO sa_ii_ktb_data SET ?", newKTBData, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newKTBData });
  });
};

SaIIKTBData.findById = (id, result) => {
  sql.query(`SELECT * FROM sa_ii_ktb_data WHERE id = ${id}`, (err, res) => {
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

SaIIKTBData.findBySurveyId = (surveyId, result) => {
  sql.query(`SELECT * FROM sa_ii_ktb_data WHERE survey_id = ${surveyId}`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res);
  });
};

SaIIKTBData.updateById = (id, ktbData, result) => {
  sql.query(
    "UPDATE sa_ii_ktb_data SET survey_id = ?, direction = ?, ktb_count = ?, turn_ratio = ?, rktb_value = ? WHERE id = ?",
    [ktbData.survey_id, ktbData.direction, ktbData.ktb_count, ktbData.turn_ratio, ktbData.rktb_value, id],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, ...ktbData });
    }
  );
};

SaIIKTBData.remove = (id, result) => {
  sql.query("DELETE FROM sa_ii_ktb_data WHERE id = ?", id, (err, res) => {
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

SaIIKTBData.removeBySurveyId = (surveyId, result) => {
  sql.query("DELETE FROM sa_ii_ktb_data WHERE survey_id = ?", surveyId, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

module.exports = SaIIKTBData; 