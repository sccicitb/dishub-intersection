const sql = require("../config/db.js");

const SaSurveyHeader = function(header) {
  this.simpang_id = header.simpang_id;
  this.tanggal = header.tanggal;
  this.perihal = header.perihal;
  this.status = header.status || 'draft';
};

SaSurveyHeader.create = async (newHeader) => {
  try {
    // For headers, don't set survey_type
    const headerData = {
      simpang_id: newHeader.simpang_id,
      tanggal: newHeader.tanggal,
      perihal: newHeader.perihal,
      status: newHeader.status || 'draft'
      // survey_type is intentionally omitted for headers
    };
    
    const [result] = await sql.query("INSERT INTO sa_surveys SET ?", headerData);
    return { id: result.insertId, ...headerData };
  } catch (err) {
    throw err;
  }
};

SaSurveyHeader.findById = async (id) => {
  try {
    const [rows] = await sql.query(`SELECT * FROM sa_surveys WHERE id = ?`, [id]);
    if (rows.length) {
      return rows[0];
    }
    throw { kind: "not_found" };
  } catch (err) {
    throw err;
  }
};

SaSurveyHeader.getAll = async (params) => {
  try {
    let query = "SELECT * FROM sa_surveys WHERE survey_type IS NULL";
    const conditions = [];
    const values = [];

    if (params) {
      if (params.simpang_id) {
        conditions.push(`simpang_id = ?`);
        values.push(params.simpang_id);
      }
      if (params.status) {
        conditions.push(`status = ?`);
        values.push(params.status);
      }
      if (conditions.length > 0) {
        query += " AND " + conditions.join(" AND ");
      }
    }

    const [rows] = await sql.query(query, values);
    return rows;
  } catch (err) {
    throw err;
  }
};

SaSurveyHeader.updateById = async (id, header) => {
  try {
    const [result] = await sql.query(
      "UPDATE sa_surveys SET simpang_id = ?, tanggal = ?, perihal = ?, status = ? WHERE id = ?",
      [header.simpang_id, header.tanggal, header.perihal, header.status, id]
    );
    
    if (result.affectedRows == 0) {
      throw { kind: "not_found" };
    }
    return { id: id, ...header };
  } catch (err) {
    throw err;
  }
};

SaSurveyHeader.remove = async (id) => {
  try {
    const [result] = await sql.query("DELETE FROM sa_surveys WHERE id = ?", [id]);
    if (result.affectedRows == 0) {
      throw { kind: "not_found" };
    }
    return result;
  } catch (err) {
    throw err;
  }
};

// Get all forms for a specific header
SaSurveyHeader.getFormsByHeaderId = async (headerId) => {
  try {
    // First get the header to get simpang_id and tanggal
    const header = await SaSurveyHeader.findById(headerId);
    if (!header) {
      throw { kind: "not_found" };
    }

    const [rows] = await sql.query(`
      SELECT survey_type as form_type, created_at, updated_at 
      FROM sa_surveys 
      WHERE simpang_id = ? AND tanggal = ? AND survey_type IS NOT NULL
    `, [header.simpang_id, header.tanggal]);
    return rows;
  } catch (err) {
    throw err;
  }
};

module.exports = SaSurveyHeader; 