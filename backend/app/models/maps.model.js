const db = require('../config/db');

// Sudah ada
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

// Tambahan baru
const getCameraById = async (id) => {
  const [rows] = await db.query('SELECT * FROM cameras WHERE id = ?', [id]);
  return rows[0];
};

const deleteCameraById = async (id) => {
  const [result] = await db.query('DELETE FROM cameras WHERE id = ?', [id]);
  return result;
};

const createCamera = async ({ title, category, status, latitude, longitude, socketEvent }) => {
  const [result] = await db.query(
    `INSERT INTO cameras (name, category, status, latitude, longitude, socket_event)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, category, status, latitude, longitude, socketEvent]
  );
  return result.insertId;
};

const updateCamera = async (id, { title, category, status, latitude, longitude, socketEvent }) => {
  const [result] = await db.query(
    `UPDATE cameras
     SET name = ?, category = ?, status = ?, latitude = ?, longitude = ?, socket_event = ?
     WHERE id = ?`,
    [title, category, status, latitude, longitude, socketEvent, id]
  );
  return result;
};

module.exports = {
  getBuildings,
  getCameraById,
  deleteCameraById,
  createCamera,
  updateCamera
};
