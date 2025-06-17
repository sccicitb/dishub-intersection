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

Vehicle.getAll = async (result) => {
  try {
    const [rows] = await db.query('SELECT * FROM arus ORDER BY waktu DESC LIMIT 10');
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// Updated: Add filter parameter to chart method
Vehicle.getChartMasukKeluar = async (result, filter = 'day') => {
  try {
    const dateFilter = getDateFilterClause(filter);
    const [rows] = await db.query(`
      SELECT
        SUM(
          CASE
            WHEN (ID_Simpang = 5 AND dari_arah = 'north') THEN 1
            WHEN (ID_Simpang = 2 AND dari_arah = 'east') THEN 1
            WHEN (ID_Simpang = 4 AND dari_arah = 'east') THEN 1
            WHEN (ID_Simpang = 3 AND dari_arah = 'west') THEN 1
            ELSE 0
          END
        ) AS total_IN,

        SUM(
          CASE
            WHEN (ID_Simpang = 5 AND ke_arah = 'north' AND dari_arah IN ('east', 'south', 'west')) THEN 1
            WHEN (ID_Simpang = 2 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) THEN 1
            WHEN (ID_Simpang = 4 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) THEN 1
            WHEN (ID_Simpang = 3 AND ke_arah = 'west' AND dari_arah IN ('east', 'south', 'north')) THEN 1
            ELSE 0
          END
        ) AS total_OUT
      FROM arus
      WHERE ${dateFilter};
    `);
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// Updated: Add filter parameter to group by tipe kendaraan
Vehicle.getGroupTipeKendaraan = async (result, filter = 'day') => {
  try {
    const dateFilter = getDateFilterClause(filter);
    const [rows] = await db.query(`
      SELECT
        SM, MP, AUP, TR, BS, TS, TB, BB, GANDENG, KTB,

        SUM(
          CASE
            WHEN (ID_Simpang = 5 AND dari_arah = 'north') THEN 1
            WHEN (ID_Simpang = 2 AND dari_arah = 'east') THEN 1
            WHEN (ID_Simpang = 4 AND dari_arah = 'east') THEN 1
            WHEN (ID_Simpang = 3 AND dari_arah = 'west') THEN 1
            ELSE 0
          END
        ) AS total_IN,

        SUM(
          CASE
            WHEN (ID_Simpang = 5 AND ke_arah = 'north' AND dari_arah IN ('east', 'south', 'west')) THEN 1
            WHEN (ID_Simpang = 2 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) THEN 1
            WHEN (ID_Simpang = 4 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) THEN 1
            WHEN (ID_Simpang = 3 AND ke_arah = 'west' AND dari_arah IN ('east', 'south', 'north')) THEN 1
            ELSE 0
          END
        ) AS total_OUT

      FROM arus
      WHERE ${dateFilter}
      GROUP BY SM, MP, AUP, TR, BS, TS, TB, BB, GANDENG, KTB
      ORDER BY total_IN DESC;
    `);
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// Updated: Add filter parameter to group by arah mata angin
Vehicle.getMasukKeluarByArah = async (result, filter = 'day') => {
  try {
    const dateFilter = getDateFilterClause(filter);
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
          CASE
            WHEN ID_Simpang = 5 AND dari_arah = 'north' THEN 'north'
            WHEN ID_Simpang = 2 AND dari_arah = 'east' THEN 'east'
            WHEN ID_Simpang = 4 AND dari_arah = 'east' THEN 'east'
            WHEN ID_Simpang = 3 AND dari_arah = 'west' THEN 'west'
            WHEN ID_Simpang = 2 AND dari_arah = 'south' THEN 'south'
          END AS arah,
          1 AS total_IN,
          0 AS total_OUT
        FROM arus
        WHERE ${dateFilter}
          AND (
            (ID_Simpang = 5 AND dari_arah = 'north') OR
            (ID_Simpang = 2 AND dari_arah = 'east') OR
            (ID_Simpang = 4 AND dari_arah = 'east') OR
            (ID_Simpang = 3 AND dari_arah = 'west') OR
            (ID_Simpang = 2 AND dari_arah = 'south')
          )

        UNION ALL

        SELECT
          CASE
            WHEN ID_Simpang = 5 AND ke_arah = 'north' THEN 'north'
            WHEN ID_Simpang = 2 AND ke_arah = 'east' THEN 'east'
            WHEN ID_Simpang = 4 AND ke_arah = 'east' THEN 'east'
            WHEN ID_Simpang = 3 AND ke_arah = 'west' THEN 'west'
            WHEN ID_Simpang = 2 AND ke_arah = 'south' THEN 'south'
          END AS arah,
          0 AS total_IN,
          1 AS total_OUT
        FROM arus
        WHERE ${dateFilter}
          AND (
            (ID_Simpang = 5 AND ke_arah = 'north' AND dari_arah IN ('east', 'south', 'west')) OR
            (ID_Simpang = 2 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) OR
            (ID_Simpang = 4 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) OR
            (ID_Simpang = 3 AND ke_arah = 'west' AND dari_arah IN ('east', 'south', 'north')) OR
            (ID_Simpang = 2 AND ke_arah = 'south' AND dari_arah IN ('east', 'north', 'west'))
          )
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

// Updated: Add filter parameter to rata-rata kendaraan per jam
Vehicle.getRataPerJam = async (result, filter = 'day') => {
  try {
    const dateFilter = getDateFilterClause(filter);
    const [rows] = await db.query(`
      SELECT
        HOUR(CONVERT_TZ(waktu, '+00:00', '+07:00')) AS jam,

        SUM(
          CASE
            WHEN (ID_Simpang = 5 AND dari_arah = 'north') THEN 1
            WHEN (ID_Simpang = 2 AND dari_arah = 'east') THEN 1
            WHEN (ID_Simpang = 4 AND dari_arah = 'east') THEN 1
            WHEN (ID_Simpang = 3 AND dari_arah = 'west') THEN 1
            ELSE 0
          END
        ) AS total_IN,

        SUM(
          CASE
            WHEN (ID_Simpang = 5 AND ke_arah = 'north' AND dari_arah IN ('east', 'south', 'west')) THEN 1
            WHEN (ID_Simpang = 2 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) THEN 1
            WHEN (ID_Simpang = 4 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) THEN 1
            WHEN (ID_Simpang = 3 AND ke_arah = 'west' AND dari_arah IN ('east', 'south', 'north')) THEN 1
            ELSE 0
          END
        ) AS total_OUT

      FROM arus
      WHERE ${dateFilter}
      GROUP BY jam
      ORDER BY jam;
    `);
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// Updated: Add filter parameter to rata-rata kendaraan per 15 menit
Vehicle.getRataPer15Menit = async (result, filter = 'day') => {
  try {
    const dateFilter = getDateFilterClause(filter);
    const [rows] = await db.query(`
      SELECT
        DATE(CONVERT_TZ(waktu, '+00:00', '+07:00')) AS tanggal,
        HOUR(CONVERT_TZ(waktu, '+00:00', '+07:00')) AS jam,
        FLOOR(MINUTE(CONVERT_TZ(waktu, '+00:00', '+07:00')) / 15) * 15 AS menit,

        SUM(
          CASE
            WHEN (ID_Simpang = 5 AND dari_arah = 'north') THEN 1
            WHEN (ID_Simpang = 2 AND dari_arah = 'east') THEN 1
            WHEN (ID_Simpang = 4 AND dari_arah = 'east') THEN 1
            WHEN (ID_Simpang = 3 AND dari_arah = 'west') THEN 1
            ELSE 0
          END
        ) AS total_IN,

        SUM(
          CASE
            WHEN (ID_Simpang = 5 AND ke_arah = 'north' AND dari_arah IN ('east', 'south', 'west')) THEN 1
            WHEN (ID_Simpang = 2 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) THEN 1
            WHEN (ID_Simpang = 4 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) THEN 1
            WHEN (ID_Simpang = 3 AND ke_arah = 'west' AND dari_arah IN ('east', 'south', 'north')) THEN 1
            ELSE 0
          END
        ) AS total_OUT

      FROM arus
      WHERE ${dateFilter}

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
