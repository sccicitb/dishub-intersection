const db = require('../config/db');

const getBuildings = async () => {
  const [rows] = await db.query(`
    SELECT
      s.id AS id,
      s.Nama_Simpang AS name,
      s.latitude,
      s.longitude,
      s.kategori,
      c.id AS camera_id,
      c.name AS camera_name,
      c.socket_event
    FROM simpang s
    LEFT JOIN cameras c ON c.ID_Simpang = s.id
      AND c.id = (
          SELECT MIN(id) FROM cameras WHERE cameras.ID_Simpang = s.id
      )
    WHERE s.Kota = 'Jogja';
  `);
  return rows;
};

module.exports = { getBuildings };
