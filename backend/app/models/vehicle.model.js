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

Vehicle.getAll = async (result) => {
  try {
    const [rows] = await db.query('SELECT * FROM arus ORDER BY waktu DESC LIMIT 10');
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// Add new chart method
Vehicle.getChartMasukKeluar = async (result) => {
  try {
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
      WHERE DATE(CONVERT_TZ(waktu, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'));

    `);
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// Add group by tipe kendaraan
Vehicle.getGroupTipeKendaraan = async (result) => {
  try {
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
      WHERE DATE(CONVERT_TZ(waktu, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'))
      GROUP BY SM, MP, AUP, TR, BS, TS, TB, BB, GANDENG, KTB
      ORDER BY total_IN DESC;

    `);
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// Add group by arah mata angin
Vehicle.getMasukKeluarByArah = async (result) => {
  try {
    const [rows] = await db.query(`
      SELECT arah, SUM(total_IN) AS total_IN, SUM(total_OUT) AS total_OUT
        FROM (
          -- IN berdasarkan aturan logika
          SELECT
            CASE
              WHEN ID_Simpang = 5 AND dari_arah = 'north' THEN 'north'
              WHEN ID_Simpang = 2 AND dari_arah = 'east' THEN 'east'
              WHEN ID_Simpang = 4 AND dari_arah = 'east' THEN 'east'
              WHEN ID_Simpang = 3 AND dari_arah = 'west' THEN 'west'
            END AS arah,
            1 AS total_IN,
            0 AS total_OUT
          FROM arus
          WHERE DATE(CONVERT_TZ(waktu, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'))
            AND (
              (ID_Simpang = 5 AND dari_arah = 'north') OR
              (ID_Simpang = 2 AND dari_arah = 'east') OR
              (ID_Simpang = 4 AND dari_arah = 'east') OR
              (ID_Simpang = 3 AND dari_arah = 'west')
            )

          UNION ALL

          -- OUT berdasarkan aturan logika
          SELECT
            CASE
              WHEN ID_Simpang = 5 AND ke_arah = 'north' THEN 'north'
              WHEN ID_Simpang = 2 AND ke_arah = 'east' THEN 'east'
              WHEN ID_Simpang = 4 AND ke_arah = 'east' THEN 'east'
              WHEN ID_Simpang = 3 AND ke_arah = 'west' THEN 'west'
            END AS arah,
            0 AS total_IN,
            1 AS total_OUT
          FROM arus
          WHERE DATE(CONVERT_TZ(waktu, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'))
            AND (
              (ID_Simpang = 5 AND ke_arah = 'north' AND dari_arah IN ('east', 'south', 'west')) OR
              (ID_Simpang = 2 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) OR
              (ID_Simpang = 4 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) OR
              (ID_Simpang = 3 AND ke_arah = 'west' AND dari_arah IN ('east', 'south', 'north'))
            )
        ) AS arah_rekap
        GROUP BY arah
        ORDER BY arah;


    `);
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

module.exports = Vehicle;
