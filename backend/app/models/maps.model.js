// app/models/maps.model.js
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

// Ambil semua simpang
const getBuildingsRaw = async () => {
  const [rows] = await db.query(
    `SELECT id, Nama_Simpang AS name, latitude, longitude, kategori 
     FROM simpang WHERE Kota = 'Jogja'`
  );
  return rows;
};

// Ambil semua kamera (relasi ke simpang)
const getAllCamerasRaw = async () => {
  const [rows] = await db.query(
    `SELECT id AS camera_id, CONCAT('detection', id) AS id, ID_Simpang AS location_id, name AS title, socket_event AS socketEvent FROM cameras`
  );
  return rows;
};

// Ambil semua simpang beserta array kamera (nested)
const getBuildingsWithCameras = async () => {
  const [buildings] = await db.query(
    `SELECT id, Nama_Simpang AS name, latitude, longitude, kategori FROM simpang WHERE Kota = 'Jogja'`
  );
  const [cameras] = await db.query(
    `SELECT id AS camera_id, ID_Simpang AS location_id, name AS title, socket_event AS socketEvent FROM cameras`
  );
  return { buildings, cameras };
};

module.exports = {
  getBuildings,
  getBuildingsRaw,
  getAllCamerasRaw,
  getBuildingsWithCameras
};
