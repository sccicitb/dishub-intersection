const sql = require("../config/db.js");

const SaIFaseApil = function(faseApil) {
  this.survey_id = faseApil.survey_id;
  this.pendekatan = faseApil.pendekatan;
  this.tipe_pendekat_terlindung = faseApil.tipe_pendekat_terlindung;
  this.tipe_pendekat_terlawan = faseApil.tipe_pendekat_terlawan;
  this.arah_bki = faseApil.arah_bki;
  this.arah_bkijt = faseApil.arah_bkijt;
  this.arah_lurus = faseApil.arah_lurus;
  this.arah_bka = faseApil.arah_bka;
  this.pemisahan_lurus_bka = faseApil.pemisahan_lurus_bka;
  this.fase_1 = faseApil.fase_1;
  this.fase_2 = faseApil.fase_2;
  this.fase_3 = faseApil.fase_3;
  this.fase_4 = faseApil.fase_4;
};

SaIFaseApil.create = (newFaseApil, result) => {
  sql.query("INSERT INTO sa_i_fase_apil SET ?", newFaseApil, (err, res) => {
    if (err) {

      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newFaseApil });
  });
};

SaIFaseApil.findById = (id, result) => {
  sql.query(`SELECT * FROM sa_i_fase_apil WHERE id = ${id}`, (err, res) => {
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

SaIFaseApil.findBySurveyId = (surveyId, result) => {
  sql.query(`SELECT * FROM sa_i_fase_apil WHERE survey_id = ${surveyId}`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res);
  });
};

SaIFaseApil.updateById = (id, faseApil, result) => {
  sql.query(
    "UPDATE sa_i_fase_apil SET survey_id = ?, pendekatan = ?, tipe_pendekat_terlindung = ?, tipe_pendekat_terlawan = ?, arah_bki = ?, arah_bkijt = ?, arah_lurus = ?, arah_bka = ?, pemisahan_lurus_bka = ?, fase_1 = ?, fase_2 = ?, fase_3 = ?, fase_4 = ? WHERE id = ?",
    [faseApil.survey_id, faseApil.pendekatan, faseApil.tipe_pendekat_terlindung, faseApil.tipe_pendekat_terlawan, faseApil.arah_bki, faseApil.arah_bkijt, faseApil.arah_lurus, faseApil.arah_bka, faseApil.pemisahan_lurus_bka, faseApil.fase_1, faseApil.fase_2, faseApil.fase_3, faseApil.fase_4, id],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, ...faseApil });
    }
  );
};

SaIFaseApil.remove = (id, result) => {
  sql.query("DELETE FROM sa_i_fase_apil WHERE id = ?", id, (err, res) => {
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

SaIFaseApil.removeBySurveyId = (surveyId, result) => {
  sql.query("DELETE FROM sa_i_fase_apil WHERE survey_id = ?", surveyId, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

module.exports = SaIFaseApil; 
