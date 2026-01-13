const sql = require("../config/db.js");

const EMPConfiguration = function(empConfig) {
  this.vehicle_type = empConfig.vehicle_type;
  this.condition_type = empConfig.condition_type;
  this.emp_value = empConfig.emp_value;
  this.is_active = empConfig.is_active;
};

EMPConfiguration.create = (newEMPConfig, result) => {
  sql.query("INSERT INTO emp_configurations SET ?", newEMPConfig, (err, res) => {
    if (err) {

      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newEMPConfig });
  });
};

EMPConfiguration.findById = (id, result) => {
  sql.query(`SELECT * FROM emp_configurations WHERE id = ${id}`, (err, res) => {
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

EMPConfiguration.getAll = (result) => {
  sql.query("SELECT * FROM emp_configurations WHERE is_active = true", (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res);
  });
};

EMPConfiguration.getByVehicleType = (vehicleType, result) => {
  sql.query(`SELECT * FROM emp_configurations WHERE vehicle_type = '${vehicleType}' AND is_active = true`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res);
  });
};

EMPConfiguration.getByConditionType = (conditionType, result) => {
  sql.query(`SELECT * FROM emp_configurations WHERE condition_type = '${conditionType}' AND is_active = true`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res);
  });
};

EMPConfiguration.updateById = (id, empConfig, result) => {
  sql.query(
    "UPDATE emp_configurations SET vehicle_type = ?, condition_type = ?, emp_value = ?, is_active = ? WHERE id = ?",
    [empConfig.vehicle_type, empConfig.condition_type, empConfig.emp_value, empConfig.is_active, id],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, ...empConfig });
    }
  );
};

EMPConfiguration.remove = (id, result) => {
  sql.query("DELETE FROM emp_configurations WHERE id = ?", id, (err, res) => {
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

// Get EMP configurations in the format expected by frontend
EMPConfiguration.getFormattedConfig = async () => {
  const [rows] = await sql.query("SELECT * FROM emp_configurations WHERE is_active = true");
  
  // Format the data as expected by frontend
  const formatted = {
    terlindung: {},
    terlawan: {}
  };
  
  rows.forEach(row => {
    if (!formatted[row.condition_type][row.vehicle_type]) {
      formatted[row.condition_type][row.vehicle_type] = row.emp_value;
    }
  });
  
  return formatted;
};

module.exports = EMPConfiguration; 
