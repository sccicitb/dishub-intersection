const db = require("../config/db");

const Vehicle = function (data) {
  this.ID_Simpang = data.ID_Simpang;
  this.tipe_pendekat = data.tipe_pendekat;
  this.dari_arah = data.dari_arah;
  this.ke_arah = data.ke_arah;
  this.SM = data.SM;
  this.MP = data.MP;
  this.AUP = data.AUP;
  this.TR = data.TR;
  this.BS = data.BS;
  this.TS = data.TS;
  this.TB = data.TB;
  this.BB = data.BB;
  this.GANDENG = data.GANDENG;
  this.KTB = data.KTB;
  this.waktu = data.waktu;
  this.created_at = data.created_at;
  this.updated_at = data.updated_at;
};

// Helper function to get WHERE clause based on filter type
const getDateFilterClause = (filter) => {
  switch (filter) {
    case 'day':
    case 'harian':
      return "DATE(CONVERT_TZ(waktu, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'))";
      
    case 'week':
    case 'minggu':
      // This week (Monday to Sunday)
      return "WEEK(CONVERT_TZ(waktu, '+00:00', '+07:00'), 1) = WEEK(CONVERT_TZ(NOW(), '+00:00', '+07:00'), 1) AND YEAR(CONVERT_TZ(waktu, '+00:00', '+07:00')) = YEAR(CONVERT_TZ(NOW(), '+00:00', '+07:00'))";
      
    case 'month':
    case 'bulanan':
      return "MONTH(CONVERT_TZ(waktu, '+00:00', '+07:00')) = MONTH(CONVERT_TZ(NOW(), '+00:00', '+07:00')) AND YEAR(CONVERT_TZ(waktu, '+00:00', '+07:00')) = YEAR(CONVERT_TZ(NOW(), '+00:00', '+07:00'))";
      
    case 'quarter':
    case 'kuartal':
      // This quarter (Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec)
      return "QUARTER(CONVERT_TZ(waktu, '+00:00', '+07:00')) = QUARTER(CONVERT_TZ(NOW(), '+00:00', '+07:00')) AND YEAR(CONVERT_TZ(waktu, '+00:00', '+07:00')) = YEAR(CONVERT_TZ(NOW(), '+00:00', '+07:00'))";
      
    case 'year':
    case 'tahunan':
      return "YEAR(CONVERT_TZ(waktu, '+00:00', '+07:00')) = YEAR(CONVERT_TZ(NOW(), '+00:00', '+07:00'))";
      
    default:
      return "DATE(CONVERT_TZ(waktu, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'))";
  }
};

/**
 * Helper function to get valid simpang IDs from database
 * Uses simpang table if available, otherwise falls back to known IDs
 */
const getValidSimpangIds = async () => {
  try {
    // Try to get simpang IDs from simpang table
    const [simpangRows] = await db.query('SELECT DISTINCT id FROM simpang WHERE id IN (SELECT DISTINCT ID_Simpang FROM arus) ORDER BY id');
    return simpangRows.map(row => row.id);
  } catch (error) {
    // Fallback to known simpang IDs if simpang table doesn't exist or has issues
    console.warn('Using fallback simpang IDs:', error.message);
    const [arusRows] = await db.query('SELECT DISTINCT ID_Simpang FROM arus ORDER BY ID_Simpang');
    return arusRows.map(row => row.ID_Simpang);
  }
};

Vehicle.getAll = async (result) => {
  try {
    const [rows] = await db.query('SELECT * FROM arus ORDER BY waktu DESC LIMIT 10');
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// DYNAMIC: Use dynamic queries with simpang table validation for 100% coverage
Vehicle.getChartMasukKeluar = async (result, filter = 'day') => {
  try {
    const dateFilter = getDateFilterClause(filter);
    const validSimpangIds = await getValidSimpangIds();
    
    const [rows] = await db.query(`
      SELECT
        COUNT(CASE WHEN dari_arah IN ('east', 'west', 'north', 'south') THEN 1 END) AS total_IN,
        COUNT(CASE WHEN ke_arah IN ('east', 'west', 'north', 'south') AND dari_arah IN ('east', 'west', 'north', 'south') THEN 1 END) AS total_OUT
      FROM arus
      WHERE ${dateFilter}
        AND ID_Simpang IN (${validSimpangIds.join(', ')});
    `);
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// DYNAMIC: Use dynamic queries with simpang table validation for 100% coverage
Vehicle.getGroupTipeKendaraan = async (result, filter = 'day') => {
  try {
    const dateFilter = getDateFilterClause(filter);
    const validSimpangIds = await getValidSimpangIds();
    
    const [rows] = await db.query(`
      SELECT
        SM, MP, AUP, TR, BS, TS, TB, BB, GANDENG, KTB,
        COUNT(CASE WHEN dari_arah IN ('east', 'west', 'north', 'south') THEN 1 END) AS total_IN,
        COUNT(CASE WHEN ke_arah IN ('east', 'west', 'north', 'south') AND dari_arah IN ('east', 'west', 'north', 'south') THEN 1 END) AS total_OUT
      FROM arus
      WHERE ${dateFilter}
        AND ID_Simpang IN (${validSimpangIds.join(', ')})
      GROUP BY SM, MP, AUP, TR, BS, TS, TB, BB, GANDENG, KTB
      ORDER BY total_IN DESC;
    `);
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// DYNAMIC: Use dynamic queries with simpang table validation for 100% coverage
Vehicle.getMasukKeluarByArah = async (result, filter = 'day') => {
  try {
    const dateFilter = getDateFilterClause(filter);
    const validSimpangIds = await getValidSimpangIds();
    
    const [rows] = await db.query(`
      SELECT 
        d.arah, 
        COALESCE(SUM(data.total_IN), 0) AS total_IN, 
        COALESCE(SUM(data.total_OUT), 0) AS total_OUT
      FROM (
        SELECT 'east' as arah
        UNION ALL SELECT 'north' as arah
        UNION ALL SELECT 'south' as arah  
        UNION ALL SELECT 'west' as arah
      ) d
      LEFT JOIN (
        SELECT
          dari_arah AS arah,
          1 AS total_IN,
          0 AS total_OUT
        FROM arus
        WHERE ${dateFilter}
          AND ID_Simpang IN (${validSimpangIds.join(', ')})
          AND dari_arah IN ('east', 'west', 'north', 'south')

        UNION ALL

        SELECT
          ke_arah AS arah,
          0 AS total_IN,
          1 AS total_OUT
        FROM arus
        WHERE ${dateFilter}
          AND ID_Simpang IN (${validSimpangIds.join(', ')})
          AND ke_arah IN ('east', 'west', 'north', 'south')
          AND dari_arah IN ('east', 'west', 'north', 'south')
      ) data ON d.arah = data.arah
      GROUP BY d.arah
      ORDER BY d.arah;
    `);
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// DYNAMIC: Use dynamic queries with simpang table validation for 100% coverage
Vehicle.getRataPerJam = async (result, filter = 'day') => {
  try {
    const dateFilter = getDateFilterClause(filter);
    const validSimpangIds = await getValidSimpangIds();
    
    const [rows] = await db.query(`
      SELECT
        HOUR(CONVERT_TZ(waktu, '+00:00', '+07:00')) AS jam,
        COUNT(CASE WHEN dari_arah IN ('east', 'west', 'north', 'south') THEN 1 END) AS total_IN,
        COUNT(CASE WHEN ke_arah IN ('east', 'west', 'north', 'south') AND dari_arah IN ('east', 'west', 'north', 'south') THEN 1 END) AS total_OUT
      FROM arus
      WHERE ${dateFilter}
        AND ID_Simpang IN (${validSimpangIds.join(', ')})
      GROUP BY jam
      ORDER BY jam;
    `);
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// DYNAMIC: Use dynamic queries with simpang table validation for 100% coverage
Vehicle.getRataPer15Menit = async (result, filter = 'day') => {
  try {
    const dateFilter = getDateFilterClause(filter);
    const validSimpangIds = await getValidSimpangIds();
    
    const [rows] = await db.query(`
      SELECT
        DATE(CONVERT_TZ(waktu, '+00:00', '+07:00')) AS tanggal,
        HOUR(CONVERT_TZ(waktu, '+00:00', '+07:00')) AS jam,
        FLOOR(MINUTE(CONVERT_TZ(waktu, '+00:00', '+07:00')) / 15) * 15 AS menit,
        COUNT(CASE WHEN dari_arah IN ('east', 'west', 'north', 'south') THEN 1 END) AS total_IN,
        COUNT(CASE WHEN ke_arah IN ('east', 'west', 'north', 'south') AND dari_arah IN ('east', 'west', 'north', 'south') THEN 1 END) AS total_OUT
      FROM arus
      WHERE ${dateFilter}
        AND ID_Simpang IN (${validSimpangIds.join(', ')})
      GROUP BY tanggal, jam, menit
      ORDER BY tanggal, jam, menit;
    `);
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

module.exports = Vehicle;
