const sql = require("../config/db.js");

const SaSurveyHeader = function(header) {
  this.simpang_id = header.simpang_id || 0;
  this.tanggal = header.tanggal;
  this.perihal = header.perihal;
  this.kabupaten_kota = header.kabupaten_kota || 'Default City';
  this.lokasi = header.lokasi || 'Default Location';
  this.ruas_jalan_mayor = header.ruas_jalan_mayor || JSON.stringify(['Default Road']);
  this.ruas_jalan_minor = header.ruas_jalan_minor || JSON.stringify(['Default Road']);
  this.ukuran_kota = header.ukuran_kota || '0';
  this.periode = header.periode || 'Pertama';
  this.status = header.status || 'draft';
};

// Helper function to safely parse JSON
const safeJsonParse = (jsonString, defaultValue = ['Default Road']) => {
  try {
    if (typeof jsonString === 'string') {
      return JSON.parse(jsonString);
    } else if (Array.isArray(jsonString)) {
      return jsonString;
    } else {
      return defaultValue;
    }
  } catch (error) {
    console.warn('JSON parse error:', error.message, 'for value:', jsonString);
    return defaultValue;
  }
};

SaSurveyHeader.create = async (newHeader) => {
  try {
    const headerData = {
      simpang_id: newHeader.simpang_id || 0,
      tanggal: newHeader.tanggal,
      perihal: newHeader.perihal,
      kabupaten_kota: newHeader.kabupaten_kota || 'Default City',
      lokasi: newHeader.lokasi || 'Default Location',
      ruas_jalan_mayor: Array.isArray(newHeader.ruas_jalan_mayor) 
        ? JSON.stringify(newHeader.ruas_jalan_mayor) 
        : JSON.stringify(['Default Road']),
      ruas_jalan_minor: Array.isArray(newHeader.ruas_jalan_minor) 
        ? JSON.stringify(newHeader.ruas_jalan_minor) 
        : JSON.stringify(['Default Road']),
      ukuran_kota: newHeader.ukuran_kota || '0',
      periode: newHeader.periode || 'Pertama',
      status: newHeader.status || 'draft'
    };
    
    const [result] = await sql.query("INSERT INTO sa_survey_headers SET ?", headerData);
    return { id: result.insertId, ...headerData };
  } catch (err) {
    throw err;
  }
};

SaSurveyHeader.findById = async (id) => {
  try {
    const [rows] = await sql.query(`SELECT * FROM sa_survey_headers WHERE id = ?`, [id]);
    if (rows.length) {
      const header = rows[0];
      // Parse JSON fields for response
      return {
        ...header,
        ruas_jalan_mayor: safeJsonParse(header.ruas_jalan_mayor),
        ruas_jalan_minor: safeJsonParse(header.ruas_jalan_minor)
      };
    }
    throw { kind: "not_found" };
  } catch (err) {
    throw err;
  }
};

SaSurveyHeader.getAll = async (params) => {
  try {
    let query = "SELECT * FROM sa_survey_headers";
    const conditions = [];
    const values = [];

    if (params) {
      if (params.kabupaten_kota) {
        conditions.push(`kabupaten_kota = ?`);
        values.push(params.kabupaten_kota);
      }
      if (params.lokasi) {
        conditions.push(`lokasi = ?`);
        values.push(params.lokasi);
      }
      if (params.periode) {
        conditions.push(`periode = ?`);
        values.push(params.periode);
      }
      if (params.tanggal) {
        conditions.push(`tanggal = ?`);
        values.push(params.tanggal);
      }
      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await sql.query(query, values);
    
    // Parse JSON fields for all headers
    return rows.map(header => ({
      ...header,
      ruas_jalan_mayor: safeJsonParse(header.ruas_jalan_mayor),
      ruas_jalan_minor: safeJsonParse(header.ruas_jalan_minor)
    }));
  } catch (err) {
    throw err;
  }
};

SaSurveyHeader.updateById = async (id, header) => {
  try {
    const updateData = {
      simpang_id: header.simpang_id || 0,
      tanggal: header.tanggal,
      perihal: header.perihal,
      kabupaten_kota: header.kabupaten_kota,
      lokasi: header.lokasi,
      ruas_jalan_mayor: Array.isArray(header.ruas_jalan_mayor) 
        ? JSON.stringify(header.ruas_jalan_mayor) 
        : header.ruas_jalan_mayor,
      ruas_jalan_minor: Array.isArray(header.ruas_jalan_minor) 
        ? JSON.stringify(header.ruas_jalan_minor) 
        : header.ruas_jalan_minor,
      ukuran_kota: header.ukuran_kota,
      periode: header.periode,
      status: header.status || 'draft'
    };
    
    const [result] = await sql.query(
      "UPDATE sa_survey_headers SET ? WHERE id = ?",
      [updateData, id]
    );
    
    if (result.affectedRows == 0) {
      throw { kind: "not_found" };
    }
    return { id: id, ...updateData };
  } catch (err) {
    throw err;
  }
};

SaSurveyHeader.remove = async (id) => {
  try {
    const [result] = await sql.query("DELETE FROM sa_survey_headers WHERE id = ?", [id]);
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
    // First get the header to get tanggal
    const header = await SaSurveyHeader.findById(headerId);
    if (!header) {
      throw { kind: "not_found" };
    }

    const [rows] = await sql.query(`
      SELECT survey_type as form_type, created_at, updated_at 
      FROM sa_surveys 
      WHERE tanggal = ? AND survey_type IS NOT NULL
    `, [header.tanggal]);
    return rows;
  } catch (err) {
    throw err;
  }
};

module.exports = SaSurveyHeader; 