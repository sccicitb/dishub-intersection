const db = require("../config/db");

const MasukKeluarBySimpang = {};
const CACHE_TTL_MS = 30000;
const masukKeluarCache = new Map();

MasukKeluarBySimpang.findByFilter = async (simpangId, startDate, endDate, isAll = false) => {
  const cacheKey = `${isAll ? 'semua' : simpangId}|${startDate}|${endDate}`;
  const cached = masukKeluarCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  let query = `
    SELECT 
      dt.ID_Simpang,
      s.Nama_Simpang,
      dt.Direction_To,
      CASE 
        WHEN NOT (
          (dt.ID_Simpang = 2 AND dt.Direction_To = 'EAST') OR
          (dt.ID_Simpang = 3 AND dt.Direction_To IN ('WEST', 'SOUTH')) OR
          (dt.ID_Simpang = 4 AND dt.Direction_To = 'EAST') OR
          (dt.ID_Simpang = 5 AND dt.Direction_To = 'NORTH')
        ) THEN dt.Total_Kendaraan
        ELSE 0
      END AS Kendaraan_Masuk,
      CASE 
        WHEN (
          (dt.ID_Simpang = 2 AND dt.Direction_To = 'EAST') OR
          (dt.ID_Simpang = 3 AND dt.Direction_To IN ('WEST', 'SOUTH')) OR
          (dt.ID_Simpang = 4 AND dt.Direction_To = 'EAST') OR
          (dt.ID_Simpang = 5 AND dt.Direction_To = 'NORTH')
        ) THEN dt.Total_Kendaraan
        ELSE 0
      END AS Kendaraan_Keluar,
      dt.Update_Terakhir
    FROM (
      SELECT
        a.ID_Simpang,
        UPPER(a.ke_arah) AS Direction_To,
        SUM(a.SM + a.MP + a.AUP + a.TR + a.BS + a.TS + a.TB + a.BB + a.GANDENG + a.KTB) AS Total_Kendaraan,
        MAX(a.waktu) AS Update_Terakhir
      FROM arus a
      WHERE a.waktu BETWEEN ? AND ?
  `;

  const params = [startDate, endDate];

  if (!isAll) {
    query += " AND a.ID_Simpang = ?";
    params.push(simpangId);
  }

  query += `
      GROUP BY a.ID_Simpang, UPPER(a.ke_arah)
    ) dt
    JOIN simpang s ON s.id = dt.ID_Simpang
    ORDER BY dt.ID_Simpang ASC, dt.Direction_To ASC;
  `;

  const [rows] = await db.query(query, params);
  masukKeluarCache.set(cacheKey, {
    timestamp: Date.now(),
    data: rows,
  });

  return rows;
};

module.exports = MasukKeluarBySimpang;
