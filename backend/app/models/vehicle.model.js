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

// ✅ OPTIMIZED: Helper function to get index-friendly WHERE clause based on filter type
const getDateFilterClause = (filter) => {
  // Get current date in Jakarta timezone (UTC+7)
  const now = new Date();
  const jakartaOffset = 7 * 60; // 7 hours in minutes
  const jakartaNow = new Date(now.getTime() + (jakartaOffset * 60 * 1000));
  
  switch (filter) {
    case 'day':
    case 'harian': {
      // Today in Jakarta timezone
      const todayStart = new Date(jakartaNow);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(jakartaNow);
      todayEnd.setHours(23, 59, 59, 999);
      
      // Convert back to UTC for database storage
      const startUTC = new Date(todayStart.getTime() - (jakartaOffset * 60 * 1000));
      const endUTC = new Date(todayEnd.getTime() - (jakartaOffset * 60 * 1000));
      
      return `waktu >= '${startUTC.toISOString().slice(0, 19).replace('T', ' ')}' AND waktu <= '${endUTC.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }
      
    case 'week':
    case 'minggu': {
      // This week (Monday to Sunday) in Jakarta timezone
      const startOfWeek = new Date(jakartaNow);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      // Convert back to UTC
      const startUTC = new Date(startOfWeek.getTime() - (jakartaOffset * 60 * 1000));
      const endUTC = new Date(endOfWeek.getTime() - (jakartaOffset * 60 * 1000));
      
      return `waktu >= '${startUTC.toISOString().slice(0, 19).replace('T', ' ')}' AND waktu <= '${endUTC.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }
      
    case 'month':
    case 'bulanan': {
      // This month in Jakarta timezone
      const startOfMonth = new Date(jakartaNow.getFullYear(), jakartaNow.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date(jakartaNow.getFullYear(), jakartaNow.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      // Convert back to UTC
      const startUTC = new Date(startOfMonth.getTime() - (jakartaOffset * 60 * 1000));
      const endUTC = new Date(endOfMonth.getTime() - (jakartaOffset * 60 * 1000));
      
      return `waktu >= '${startUTC.toISOString().slice(0, 19).replace('T', ' ')}' AND waktu <= '${endUTC.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }
      
    case 'quarter':
    case 'kuartal': {
      // This quarter in Jakarta timezone
      const quarter = Math.floor(jakartaNow.getMonth() / 3);
      const startOfQuarter = new Date(jakartaNow.getFullYear(), quarter * 3, 1);
      startOfQuarter.setHours(0, 0, 0, 0);
      
      const endOfQuarter = new Date(jakartaNow.getFullYear(), quarter * 3 + 3, 0);
      endOfQuarter.setHours(23, 59, 59, 999);
      
      // Convert back to UTC
      const startUTC = new Date(startOfQuarter.getTime() - (jakartaOffset * 60 * 1000));
      const endUTC = new Date(endOfQuarter.getTime() - (jakartaOffset * 60 * 1000));
      
      return `waktu >= '${startUTC.toISOString().slice(0, 19).replace('T', ' ')}' AND waktu <= '${endUTC.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }
      
    case 'year':
    case 'tahunan': {
      // This year in Jakarta timezone
      const startOfYear = new Date(jakartaNow.getFullYear(), 0, 1);
      startOfYear.setHours(0, 0, 0, 0);
      
      const endOfYear = new Date(jakartaNow.getFullYear(), 11, 31);
      endOfYear.setHours(23, 59, 59, 999);
      
      // Convert back to UTC
      const startUTC = new Date(startOfYear.getTime() - (jakartaOffset * 60 * 1000));
      const endUTC = new Date(endOfYear.getTime() - (jakartaOffset * 60 * 1000));
      
      return `waktu >= '${startUTC.toISOString().slice(0, 19).replace('T', ' ')}' AND waktu <= '${endUTC.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }
      
    default: {
      // Default to today
      const todayStart = new Date(jakartaNow);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(jakartaNow);
      todayEnd.setHours(23, 59, 59, 999);
      
      const startUTC = new Date(todayStart.getTime() - (jakartaOffset * 60 * 1000));
      const endUTC = new Date(todayEnd.getTime() - (jakartaOffset * 60 * 1000));
      
      return `waktu >= '${startUTC.toISOString().slice(0, 19).replace('T', ' ')}' AND waktu <= '${endUTC.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }
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
