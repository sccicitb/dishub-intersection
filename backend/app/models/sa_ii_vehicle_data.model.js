const sql = require("../config/db.js");

const SaIIVehicleData = function(vehicleData) {
  this.survey_id = vehicleData.survey_id;
  this.direction = vehicleData.direction;
  this.movement_type = vehicleData.movement_type;
  this.vehicle_type = vehicleData.vehicle_type;
  this.count_terlindung = vehicleData.count_terlindung;
  this.count_terlawan = vehicleData.count_terlawan;
  this.smp_terlindung = vehicleData.smp_terlindung;
  this.smp_terlawan = vehicleData.smp_terlawan;
};

SaIIVehicleData.create = (newVehicleData, result) => {
  sql.query("INSERT INTO sa_ii_vehicle_data SET ?", newVehicleData, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newVehicleData });
  });
};

SaIIVehicleData.findById = (id, result) => {
  sql.query(`SELECT * FROM sa_ii_vehicle_data WHERE id = ${id}`, (err, res) => {
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

SaIIVehicleData.findBySurveyId = async (surveyId) => {
  const [rows] = await sql.query(`SELECT * FROM sa_ii_vehicle_data WHERE survey_id = ?`, [surveyId]);
  return rows;
};

SaIIVehicleData.updateById = (id, vehicleData, result) => {
  sql.query(
    "UPDATE sa_ii_vehicle_data SET survey_id = ?, direction = ?, movement_type = ?, vehicle_type = ?, count_terlindung = ?, count_terlawan = ?, smp_terlindung = ?, smp_terlawan = ? WHERE id = ?",
    [vehicleData.survey_id, vehicleData.direction, vehicleData.movement_type, vehicleData.vehicle_type, vehicleData.count_terlindung, vehicleData.count_terlawan, vehicleData.smp_terlindung, vehicleData.smp_terlawan, id],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, ...vehicleData });
    }
  );
};

SaIIVehicleData.remove = (id, result) => {
  sql.query("DELETE FROM sa_ii_vehicle_data WHERE id = ?", id, (err, res) => {
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

SaIIVehicleData.removeBySurveyId = (surveyId, result) => {
  sql.query("DELETE FROM sa_ii_vehicle_data WHERE survey_id = ?", surveyId, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

// Get aggregated vehicle data from table arus for SA-II
SaIIVehicleData.getArusAggregatedData = async (simpangId) => {
  try {
    const [rows] = await sql.query(`
      SELECT 
        dari_arah,
        ke_arah,
        SUM(MP) as total_mp,
        SUM(SM) as total_sm,
        SUM(KTB) as total_ktb,
        SUM(AUP + TR + BS + TS + TB + BB + GANDENG) as total_ks
      FROM arus 
      WHERE ID_Simpang = ?
      GROUP BY dari_arah, ke_arah
    `, [simpangId]);
    
    return rows;
  } catch (error) {
    throw new Error(`Error aggregating arus data: ${error.message}`);
  }
};

// Get survey header validation
SaIIVehicleData.validateSurveyExists = async (surveyId) => {
  try {
    const [rows] = await sql.query(
      "SELECT id, status, simpang_id FROM sa_survey_headers WHERE id = ?", 
      [surveyId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw new Error(`Error validating survey: ${error.message}`);
  }
};

module.exports = SaIIVehicleData; 