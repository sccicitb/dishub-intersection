// models/simpang.model.js
const db = require('../config/db');

// List semua simpang
const getAllSimpang = async () => {
  const [rows] = await db.query(`SELECT * FROM simpang`);
  return rows;
};

// Detail simpang by id
const getSimpangById = async (id) => {
  const [rows] = await db.query(`SELECT * FROM simpang WHERE id = ?`, [id]);
  return rows[0];
};

// Tambah simpang
const createSimpang = async ({
  name,
  latitude,
  longitude,
  kategori,
  kota,
  ukuran_kota,
  tanggal,
  periode,
  ditangani_oleh
}) => {
  const [result] = await db.query(
    `INSERT INTO simpang 
      (Nama_Simpang, latitude, longitude, kategori, Kota, Ukuran_Kota, Tanggal, Periode, Ditangani_Oleh)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, latitude, longitude, kategori, kota, ukuran_kota, tanggal, periode, ditangani_oleh]
  );
  return result.insertId;
};

// Update simpang
const updateSimpang = async (
  id,
  {
    name,
    latitude,
    longitude,
    kategori,
    kota,
    ukuran_kota,
    tanggal,
    periode,
    ditangani_oleh
  }
) => {
  const [result] = await db.query(
    `UPDATE simpang SET 
      Nama_Simpang = ?, latitude = ?, longitude = ?, kategori = ?, Kota = ?, Ukuran_Kota = ?, 
      Tanggal = ?, Periode = ?, Ditangani_Oleh = ?
     WHERE id = ?`,
    [name, latitude, longitude, kategori, kota, ukuran_kota, tanggal, periode, ditangani_oleh, id]
  );
  return result;
};

// Hapus simpang
const deleteSimpangById = async (id) => {
  const [result] = await db.query('DELETE FROM simpang WHERE id = ?', [id]);
  return result;
};

// List kamera di simpang (relasi)
const getCamerasBySimpangId = async (simpangId) => {
  const [rows] = await db.query(
    `SELECT c.*, s.Nama_Simpang as simpang_name, s.latitude as simpang_latitude, s.longitude as simpang_longitude
     FROM cameras c
     INNER JOIN simpang s ON c.ID_Simpang = s.id
     WHERE s.id = ?
     ORDER BY c.id ASC`,
    [simpangId]
  );
  return rows;
};

module.exports = {
  getAllSimpang,
  getSimpangById,
  createSimpang,
  updateSimpang,
  deleteSimpangById,
  getCamerasBySimpangId
};
