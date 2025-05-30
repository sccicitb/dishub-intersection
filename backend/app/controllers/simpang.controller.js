// controllers/simpang.controller.js
const {
  getAllSimpang,
  getSimpangById,
  createSimpang,
  updateSimpang,
  deleteSimpangById,
  getCamerasBySimpangId
} = require('../models/simpang.model');

// GET /api/simpang
exports.getAllSimpang = async (req, res) => {
  try {
    const simpang = await getAllSimpang();
    res.json({ simpang });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/simpang/:id
exports.getSimpangById = async (req, res) => {
  try {
    const simpang = await getSimpangById(req.params.id);
    if (!simpang) return res.status(404).json({ message: 'Simpang not found' });
    res.json(simpang);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/simpang
exports.createSimpang = async (req, res) => {
  try {
    const {
      name,
      latitude,
      longitude,
      kategori,
      kota,
      ukuran_kota,
      tanggal,
      periode,
      ditangani_oleh
    } = req.body;

    // Validasi
    if (
      !name || typeof latitude === 'undefined' || typeof longitude === 'undefined' ||
      !kategori || !kota || !ukuran_kota || !tanggal || !periode || !ditangani_oleh
    ) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const newId = await createSimpang({
      name,
      latitude,
      longitude,
      kategori,
      kota,
      ukuran_kota,
      tanggal,
      periode,
      ditangani_oleh
    });
    const newSimpang = await getSimpangById(newId);
    res.status(201).json(newSimpang);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/simpang/:id
exports.updateSimpang = async (req, res) => {
  try {
    const {
      name,
      latitude,
      longitude,
      kategori,
      kota,
      ukuran_kota,
      tanggal,
      periode,
      ditangani_oleh
    } = req.body;

    if (
      !name || typeof latitude === 'undefined' || typeof longitude === 'undefined' ||
      !kategori || !kota || !ukuran_kota || !tanggal || !periode || !ditangani_oleh
    ) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const result = await updateSimpang(req.params.id, {
      name,
      latitude,
      longitude,
      kategori,
      kota,
      ukuran_kota,
      tanggal,
      periode,
      ditangani_oleh
    });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Simpang not found' });
    }
    const updatedSimpang = await getSimpangById(req.params.id);
    res.json(updatedSimpang);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/simpang/:id
exports.deleteSimpangById = async (req, res) => {
  try {
    const result = await deleteSimpangById(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Simpang not found' });
    }
    res.json({ message: 'Simpang deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/simpang/:id/cameras (relasi)
exports.getCamerasBySimpangId = async (req, res) => {
  try {
    const cameras = await getCamerasBySimpangId(req.params.id);
    res.json({ cameras });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
