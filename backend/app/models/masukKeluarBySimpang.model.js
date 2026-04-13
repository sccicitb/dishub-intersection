const db = require("../config/db");

const MasukKeluarBySimpang = {};

MasukKeluarBySimpang.findByFilter = async (simpangId, startDate, endDate) => {
  const query = `
    SELECT 
      s.id AS ID_Simpang,
      s.Nama_Simpang,
      a.ke_arah AS Direction_To,

      SUM(
        CASE 
          WHEN NOT (
            (s.id = 2 AND UPPER(a.ke_arah) = 'EAST') OR
            (s.id = 3 AND UPPER(a.ke_arah) IN ('WEST', 'SOUTH')) OR
            (s.id = 4 AND UPPER(a.ke_arah) = 'EAST') OR
            (s.id = 5 AND UPPER(a.ke_arah) = 'NORTH')
          ) THEN (a.SM + a.MP + a.AUP + a.TR + a.BS + a.TS + a.TB + a.BB + a.GANDENG + a.KTB)
          ELSE 0
        END
      ) AS Kendaraan_Masuk,

      SUM(
        CASE 
          WHEN (
            (s.id = 2 AND UPPER(a.ke_arah) = 'EAST') OR
            (s.id = 3 AND UPPER(a.ke_arah) IN ('WEST', 'SOUTH')) OR
            (s.id = 4 AND UPPER(a.ke_arah) = 'EAST') OR
            (s.id = 5 AND UPPER(a.ke_arah) = 'NORTH')
          ) THEN (a.SM + a.MP + a.AUP + a.TR + a.BS + a.TS + a.TB + a.BB + a.GANDENG + a.KTB)
          ELSE 0
        END
      ) AS Kendaraan_Keluar,

      MAX(a.waktu) AS Update_Terakhir
    FROM simpang s
    JOIN arus a ON s.id = a.ID_Simpang
    WHERE a.waktu BETWEEN ? AND ?
      AND s.id = ?
    GROUP BY s.id, s.Nama_Simpang, a.ke_arah
    ORDER BY s.id ASC, a.ke_arah ASC;
  `;

  const [rows] = await db.query(query, [startDate, endDate, simpangId]);
  return rows;
};

module.exports = MasukKeluarBySimpang;
