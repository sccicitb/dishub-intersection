// controllers/camera.controller.js
const {
  getAllCameras,
  getCameraById,
  createCamera,
  updateCamera,
  deleteCameraById
} = require('../models/camera.model');

// GET /api/cameras
exports.getAllCameras = async (req, res) => {
  try {
    const cameras = await getAllCameras();
    res.json({ cameras });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/cameras/:id
exports.getCameraById = async (req, res) => {
  try {
    const camera = await getCameraById(req.params.id);
    if (!camera) return res.status(404).json({ message: 'Camera not found' });
    res.json(camera);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/cameras
exports.createCamera = async (req, res) => {
  try {
    const {
      name,
      url,
      thumbnail_url,
      location,
      resolution,
      status,
      socket_event,
      ID_Simpang,
      detail
    } = req.body;

    if (
      !name || !location || typeof status === 'undefined' ||
      !socket_event || !ID_Simpang
    ) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const newId = await createCamera({
      name,
      url,
      thumbnail_url,
      location,
      resolution,
      status,
      socket_event,
      ID_Simpang,
      detail
    });

    const newCamera = await getCameraById(newId);
    res.status(201).json(newCamera);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/cameras/:id
exports.updateCamera = async (req, res) => {
  try {
    const {
      name,
      url,
      thumbnail_url,
      location,
      resolution,
      status,
      socket_event,
      ID_Simpang,
      detail
    } = req.body;

    if (
      !name || !location || typeof status === 'undefined' ||
      !socket_event || !ID_Simpang
    ) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const result = await updateCamera(req.params.id, {
      name,
      url,
      thumbnail_url,
      location,
      resolution,
      status,
      socket_event,
      ID_Simpang,
      detail
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Camera not found' });
    }

    const updatedCamera = await getCameraById(req.params.id);
    res.json(updatedCamera);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/cameras/:id
exports.deleteCameraById = async (req, res) => {
  try {
    const result = await deleteCameraById(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Camera not found' });
    }
    res.json({ message: 'Camera deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
