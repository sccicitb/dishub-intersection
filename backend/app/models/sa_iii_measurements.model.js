const sql = require("../config/db.js");

const SaIIIMeasurements = function(measurement) {
  this.survey_id = measurement.survey_id;
  this.measurement_label = measurement.measurement_label;
  this.start_longitude = measurement.start_longitude;
  this.start_latitude = measurement.start_latitude;
  this.end_longitude = measurement.end_longitude;
  this.end_latitude = measurement.end_latitude;
  this.distance_meters = measurement.distance_meters;
};

SaIIIMeasurements.create = (newMeasurement, result) => {
  sql.query("INSERT INTO sa_iii_measurements SET ?", newMeasurement, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newMeasurement });
  });
};

SaIIIMeasurements.findById = (id, result) => {
  sql.query(`SELECT * FROM sa_iii_measurements WHERE id = ${id}`, (err, res) => {
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

SaIIIMeasurements.findBySurveyId = async (surveyId) => {
  const [rows] = await sql.query(`SELECT * FROM sa_iii_measurements WHERE survey_id = ? ORDER BY created_at`, [surveyId]);
  return rows;
};

SaIIIMeasurements.updateById = (id, measurement, result) => {
  sql.query(
    "UPDATE sa_iii_measurements SET survey_id = ?, measurement_label = ?, start_longitude = ?, start_latitude = ?, end_longitude = ?, end_latitude = ?, distance_meters = ? WHERE id = ?",
    [measurement.survey_id, measurement.measurement_label, measurement.start_longitude, measurement.start_latitude, measurement.end_longitude, measurement.end_latitude, measurement.distance_meters, id],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, ...measurement });
    }
  );
};

SaIIIMeasurements.remove = (id, result) => {
  sql.query("DELETE FROM sa_iii_measurements WHERE id = ?", id, (err, res) => {
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

SaIIIMeasurements.removeBySurveyId = (surveyId, result) => {
  sql.query("DELETE FROM sa_iii_measurements WHERE survey_id = ?", surveyId, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

// Calculate distance between two points using Haversine formula
SaIIIMeasurements.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

module.exports = SaIIIMeasurements; 