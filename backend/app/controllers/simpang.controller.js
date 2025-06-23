// controllers/simpang.controller.js
const {
  getAllSimpang,
  getSimpangById,
  getSimpangDetail,
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

// Helper function to validate enum values
const validateEnumField = (value, allowedValues, fieldName) => {
  if (value && !allowedValues.includes(value)) {
    throw new Error(`Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`);
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
      ditangani_oleh,
      kecamatan,
      lebar_jalur,
      hambatan_samping,
      status_non_aktif,
      cuaca,
      metode_survei,
      jumlah_lajur,
      median,
      belok_kiri_jalan_terus
    } = req.body;

    // Basic validation
    if (
      !name || typeof latitude === 'undefined' || typeof longitude === 'undefined' ||
      !kategori || !kota || !ukuran_kota || !tanggal || !periode || !ditangani_oleh
    ) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Enum validation
    try {
      validateEnumField(hambatan_samping, ['Tinggi', 'Sedang', 'Rendah'], 'Hambatan Samping');
      // cuaca is now VARCHAR (free text), no validation needed
      validateEnumField(median, ['Ada', 'Tanpa'], 'Median');
      validateEnumField(belok_kiri_jalan_terus, ['Ya', 'Tidak'], 'Belok Kiri Jalan Terus');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    // Numeric validation
    if (lebar_jalur !== undefined && lebar_jalur !== null && (isNaN(lebar_jalur) || lebar_jalur < 0)) {
      return res.status(400).json({ error: 'Lebar Jalur must be a positive number' });
    }
    if (jumlah_lajur !== undefined && jumlah_lajur !== null && (isNaN(jumlah_lajur) || jumlah_lajur < 1)) {
      return res.status(400).json({ error: 'Jumlah Lajur must be a positive integer' });
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
      ditangani_oleh,
      kecamatan,
      lebar_jalur,
      hambatan_samping,
      status_non_aktif: status_non_aktif || false,
      cuaca,
      metode_survei,
      jumlah_lajur,
      median,
      belok_kiri_jalan_terus
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
      ditangani_oleh,
      kecamatan,
      lebar_jalur,
      hambatan_samping,
      status_non_aktif,
      cuaca,
      metode_survei,
      jumlah_lajur,
      median,
      belok_kiri_jalan_terus
    } = req.body;

    // Basic validation
    if (
      !name || typeof latitude === 'undefined' || typeof longitude === 'undefined' ||
      !kategori || !kota || !ukuran_kota || !tanggal || !periode || !ditangani_oleh
    ) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Enum validation
    try {
      validateEnumField(hambatan_samping, ['Tinggi', 'Sedang', 'Rendah'], 'Hambatan Samping');
      // cuaca is now VARCHAR (free text), no validation needed
      validateEnumField(median, ['Ada', 'Tanpa'], 'Median');
      validateEnumField(belok_kiri_jalan_terus, ['Ya', 'Tidak'], 'Belok Kiri Jalan Terus');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    // Numeric validation
    if (lebar_jalur !== undefined && lebar_jalur !== null && (isNaN(lebar_jalur) || lebar_jalur < 0)) {
      return res.status(400).json({ error: 'Lebar Jalur must be a positive number' });
    }
    if (jumlah_lajur !== undefined && jumlah_lajur !== null && (isNaN(jumlah_lajur) || jumlah_lajur < 1)) {
      return res.status(400).json({ error: 'Jumlah Lajur must be a positive integer' });
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
      ditangani_oleh,
      kecamatan,
      lebar_jalur,
      hambatan_samping,
      status_non_aktif,
      cuaca,
      metode_survei,
      jumlah_lajur,
      median,
      belok_kiri_jalan_terus
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

// GET /api/simpang/:id/detail
exports.getSimpangDetail = async (req, res) => {
  try {
    const simpangDetail = await getSimpangDetail(req.params.id);
    if (!simpangDetail) return res.status(404).json({ message: 'Simpang not found' });
    res.json(simpangDetail);
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
