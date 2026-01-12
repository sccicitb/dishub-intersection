const sql = require("../config/db.js");

const SaIVCapacityAnalysis = function(capacityAnalysis) {
  this.survey_id = capacityAnalysis.survey_id;
  this.kode_pendekat = capacityAnalysis.kode_pendekat;
  this.tipe_pendekat = capacityAnalysis.tipe_pendekat;
  this.rasio_kendaraan_belok = capacityAnalysis.rasio_kendaraan_belok;
  this.arus_belok_kanan = capacityAnalysis.arus_belok_kanan;
  this.lebar_efektif = capacityAnalysis.lebar_efektif;
  this.arus_jenuh_dasar = capacityAnalysis.arus_jenuh_dasar;
  this.faktor_penyesuaian = capacityAnalysis.faktor_penyesuaian;
  this.arus_jenuh_disesuaikan = capacityAnalysis.arus_jenuh_disesuaikan;
  this.arus_lalu_lintas = capacityAnalysis.arus_lalu_lintas;
  this.rasio_arus = capacityAnalysis.rasio_arus;
  this.rasio_fase = capacityAnalysis.rasio_fase;
  this.waktu_hijau_per_fase = capacityAnalysis.waktu_hijau_per_fase;
  this.kapasitas = capacityAnalysis.kapasitas;
  this.derajat_kejenuhan = capacityAnalysis.derajat_kejenuhan;
};

SaIVCapacityAnalysis.create = (newCapacityAnalysis, result) => {
  sql.query("INSERT INTO sa_iv_capacity_analysis SET ?", newCapacityAnalysis, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newCapacityAnalysis });
  });
};

SaIVCapacityAnalysis.findById = (id, result) => {
  sql.query(`SELECT * FROM sa_iv_capacity_analysis WHERE id = ${id}`, (err, res) => {
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

SaIVCapacityAnalysis.findBySurveyId = async (surveyId) => {
  const [rows] = await sql.query(`SELECT * FROM sa_iv_capacity_analysis WHERE survey_id = ? ORDER BY kode_pendekat`, [surveyId]);
  return rows;
};

SaIVCapacityAnalysis.findBySurveyAndPendekat = (surveyId, kodePendekat, result) => {
  sql.query(`SELECT * FROM sa_iv_capacity_analysis WHERE survey_id = ${surveyId} AND kode_pendekat = '${kodePendekat}'`, (err, res) => {
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

SaIVCapacityAnalysis.updateById = (id, capacityAnalysis, result) => {
  sql.query(
    "UPDATE sa_iv_capacity_analysis SET survey_id = ?, kode_pendekat = ?, tipe_pendekat = ?, rasio_kendaraan_belok = ?, arus_belok_kanan = ?, lebar_efektif = ?, arus_jenuh_dasar = ?, faktor_penyesuaian = ?, arus_jenuh_disesuaikan = ?, arus_lalu_lintas = ?, rasio_arus = ?, rasio_fase = ?, waktu_hijau_per_fase = ?, kapasitas = ?, derajat_kejenuhan = ? WHERE id = ?",
    [capacityAnalysis.survey_id, capacityAnalysis.kode_pendekat, capacityAnalysis.tipe_pendekat, capacityAnalysis.rasio_kendaraan_belok, capacityAnalysis.arus_belok_kanan, capacityAnalysis.lebar_efektif, capacityAnalysis.arus_jenuh_dasar, capacityAnalysis.faktor_penyesuaian, capacityAnalysis.arus_jenuh_disesuaikan, capacityAnalysis.arus_lalu_lintas, capacityAnalysis.rasio_arus, capacityAnalysis.rasio_fase, capacityAnalysis.waktu_hijau_per_fase, capacityAnalysis.kapasitas, capacityAnalysis.derajat_kejenuhan, id],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, ...capacityAnalysis });
    }
  );
};

SaIVCapacityAnalysis.remove = (id, result) => {
  sql.query("DELETE FROM sa_iv_capacity_analysis WHERE id = ?", id, (err, res) => {
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

SaIVCapacityAnalysis.removeBySurveyId = (surveyId, result) => {
  sql.query("DELETE FROM sa_iv_capacity_analysis WHERE survey_id = ?", surveyId, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

module.exports = SaIVCapacityAnalysis; 