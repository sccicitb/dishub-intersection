// models/camera.model.js
const db = require('../config/db');

// List semua kamera (dengan join ke simpang)
const getAllCameras = async () => {
  const [rows] = await db.query(`
    SELECT c.*, s.Nama_Simpang as simpang_name
    FROM cameras c
    LEFT JOIN simpang s ON c.ID_Simpang = s.id
  `);
  return rows;
};

const getCameraById = async (id) => {
  const [rows] = await db.query(`
    SELECT c.*, s.Nama_Simpang as simpang_name
    FROM cameras c
    LEFT JOIN simpang s ON c.ID_Simpang = s.id
    WHERE c.id = ?
  `, [id]);
  return rows[0];
};

const createCamera = async ({
  name,
  url,
  thumbnail_url,
  location,
  resolution,
  status,
  socket_event,
  ID_Simpang,
  detail
}) => {
  const [result] = await db.query(
    `INSERT INTO cameras 
      (name, url, thumbnail_url, location, resolution, status, socket_event, ID_Simpang, detail)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, url, thumbnail_url, location, resolution, status, socket_event, ID_Simpang, detail]
  );
  return result.insertId;
};

const updateCamera = async (id, {
  name,
  url,
  thumbnail_url,
  location,
  resolution,
  status,
  socket_event,
  ID_Simpang,
  detail
}) => {
  const [result] = await db.query(
    `UPDATE cameras SET 
      name = ?, url = ?, thumbnail_url = ?, location = ?, resolution = ?, 
      status = ?, socket_event = ?, ID_Simpang = ?, detail = ?
     WHERE id = ?`,
    [name, url, thumbnail_url, location, resolution, status, socket_event, ID_Simpang, detail, id]
  );
  return result;
};

const deleteCameraById = async (id) => {
  const [result] = await db.query('DELETE FROM cameras WHERE id = ?', [id]);
  return result;
};

module.exports = {
  getAllCameras,
  getCameraById,
  createCamera,
  updateCamera,
  deleteCameraById
};
