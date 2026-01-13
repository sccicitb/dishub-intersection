const sql = require("../config/db.js");

const SaIPendekat = function(pendekat) {
  this.survey_id = pendekat.survey_id;
  this.kode_pendekat = pendekat.kode_pendekat;
  this.tipe_lingkungan_jalan = pendekat.tipe_lingkungan_jalan;
  this.kelas_hambatan_samping = pendekat.kelas_hambatan_samping;
  this.median = pendekat.median;
  this.kelandaian_pendekat = pendekat.kelandaian_pendekat;
  this.bkjt = pendekat.bkjt;
  this.jarak_ke_kendaraan_parkir = pendekat.jarak_ke_kendaraan_parkir;
  this.lebar_awal_lajur = pendekat.lebar_awal_lajur;
  this.lebar_garis_henti = pendekat.lebar_garis_henti;
  this.lebar_lajur_bki = pendekat.lebar_lajur_bki;
  this.lebar_lajur_keluar = pendekat.lebar_lajur_keluar;
};

SaIPendekat.create = (newPendekat, result) => {
  sql.query("INSERT INTO sa_i_pendekat SET ?", newPendekat, (err, res) => {
    if (err) {

      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newPendekat });
  });
};

SaIPendekat.findById = (id, result) => {
  sql.query(`SELECT * FROM sa_i_pendekat WHERE id = ${id}`, (err, res) => {
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

SaIPendekat.findBySurveyId = (surveyId, result) => {
  sql.query(`SELECT * FROM sa_i_pendekat WHERE survey_id = ${surveyId}`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res);
  });
};

SaIPendekat.updateById = (id, pendekat, result) => {
  sql.query(
    "UPDATE sa_i_pendekat SET survey_id = ?, kode_pendekat = ?, tipe_lingkungan_jalan = ?, kelas_hambatan_samping = ?, median = ?, kelandaian_pendekat = ?, bkjt = ?, jarak_ke_kendaraan_parkir = ?, lebar_awal_lajur = ?, lebar_garis_henti = ?, lebar_lajur_bki = ?, lebar_lajur_keluar = ? WHERE id = ?",
    [pendekat.survey_id, pendekat.kode_pendekat, pendekat.tipe_lingkungan_jalan, pendekat.kelas_hambatan_samping, pendekat.median, pendekat.kelandaian_pendekat, pendekat.bkjt, pendekat.jarak_ke_kendaraan_parkir, pendekat.lebar_awal_lajur, pendekat.lebar_garis_henti, pendekat.lebar_lajur_bki, pendekat.lebar_lajur_keluar, id],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, ...pendekat });
    }
  );
};

SaIPendekat.remove = (id, result) => {
  sql.query("DELETE FROM sa_i_pendekat WHERE id = ?", id, (err, res) => {
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

SaIPendekat.removeBySurveyId = (surveyId, result) => {
  sql.query("DELETE FROM sa_i_pendekat WHERE survey_id = ?", surveyId, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

module.exports = SaIPendekat; 
