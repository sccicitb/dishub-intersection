const sql = require("../config/db.js");

const SaIVCalculationConfig = function(calculationConfig) {
  this.simpang_id = calculationConfig.simpang_id;
  this.base_saturation_flow = calculationConfig.base_saturation_flow;
  this.adjustment_factors = calculationConfig.adjustment_factors;
  this.calculation_rules = calculationConfig.calculation_rules;
};

SaIVCalculationConfig.create = (newCalculationConfig, result) => {
  sql.query("INSERT INTO sa_iv_calculation_config SET ?", newCalculationConfig, (err, res) => {
    if (err) {

      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newCalculationConfig });
  });
};

SaIVCalculationConfig.findById = (id, result) => {
  sql.query(`SELECT * FROM sa_iv_calculation_config WHERE id = ${id}`, (err, res) => {
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

SaIVCalculationConfig.findBySimpangId = (simpangId, result) => {
  sql.query(`SELECT * FROM sa_iv_calculation_config WHERE simpang_id = ${simpangId}`, (err, res) => {
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

SaIVCalculationConfig.getAll = (result) => {
  sql.query("SELECT * FROM sa_iv_calculation_config", (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res);
  });
};

SaIVCalculationConfig.updateById = (id, calculationConfig, result) => {
  sql.query(
    "UPDATE sa_iv_calculation_config SET simpang_id = ?, base_saturation_flow = ?, adjustment_factors = ?, calculation_rules = ? WHERE id = ?",
    [calculationConfig.simpang_id, calculationConfig.base_saturation_flow, calculationConfig.adjustment_factors, calculationConfig.calculation_rules, id],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, ...calculationConfig });
    }
  );
};

SaIVCalculationConfig.updateBySimpangId = (simpangId, calculationConfig, result) => {
  sql.query(
    "UPDATE sa_iv_calculation_config SET base_saturation_flow = ?, adjustment_factors = ?, calculation_rules = ? WHERE simpang_id = ?",
    [calculationConfig.base_saturation_flow, calculationConfig.adjustment_factors, calculationConfig.calculation_rules, simpangId],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { simpang_id: simpangId, ...calculationConfig });
    }
  );
};

SaIVCalculationConfig.remove = (id, result) => {
  sql.query("DELETE FROM sa_iv_calculation_config WHERE id = ?", id, (err, res) => {
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

SaIVCalculationConfig.removeBySimpangId = (simpangId, result) => {
  sql.query("DELETE FROM sa_iv_calculation_config WHERE simpang_id = ?", simpangId, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

// Get default configuration for a simpang
SaIVCalculationConfig.getDefaultConfig = (simpangId, result) => {
  sql.query(`SELECT * FROM sa_iv_calculation_config WHERE simpang_id = ${simpangId}`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    
    if (res.length > 0) {
      result(null, res[0]);
    } else {
      // Return default configuration if none exists
      const defaultConfig = {
        simpang_id: simpangId,
        base_saturation_flow: 6900,
        adjustment_factors: JSON.stringify({
          fus: 1.05,  // Faktor hambatan samping
          fuk: 0.95,  // Faktor ukuran kota
          fug: 1.00,  // Faktor gradien
          fup: 1.00,  // Faktor parkir
          fbki: 1.00, // Faktor belok kiri
          fbka: 0.99  // Faktor belok kanan
        }),
        calculation_rules: JSON.stringify({
          capacity_formula: "C = (J * WHI) / S",
          saturation_formula: "J = LE * FUS * FUK * FUG * FUP * FBKI * FBKA",
          flow_ratio_formula: "Rq/j = q / J",
          phase_ratio_formula: "RF = Rq/j / Rig",
          degree_of_saturation_formula: "DJ = q / C"
        })
      };
      result(null, defaultConfig);
    }
  });
};

// Get formatted configuration for frontend
SaIVCalculationConfig.getFormattedConfig = async () => {
  const [rows] = await sql.query("SELECT * FROM sa_iv_calculation_config");
  
  // Format the data as expected by frontend
  const formatted = {
    base_saturation_flow: 6900,
    adjustment_factors: {
      fus: 1.05,  // Faktor hambatan samping
      fuk: 0.95,  // Faktor ukuran kota
      fug: 1.00,  // Faktor gradien
      fup: 1.00,  // Faktor parkir
      fbki: 1.00, // Faktor belok kiri
      fbka: 0.99  // Faktor belok kanan
    },
    calculation_rules: {
      capacity_formula: "C = (J * WHI) / S",
      saturation_formula: "J = LE * FUS * FUK * FUG * FUP * FBKI * FBKA",
      flow_ratio_formula: "Rq/j = q / J",
      phase_ratio_formula: "RF = Rq/j / Rig",
      degree_of_saturation_formula: "DJ = q / C"
    }
  };
  
  if (rows.length > 0) {
    const config = rows[0];
    formatted.base_saturation_flow = config.base_saturation_flow || 6900;
    formatted.adjustment_factors = JSON.parse(config.adjustment_factors || '{}');
    formatted.calculation_rules = JSON.parse(config.calculation_rules || '{}');
  }
  
  return formatted;
};

module.exports = SaIVCalculationConfig; 