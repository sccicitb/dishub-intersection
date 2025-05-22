const {
  getBuildings,
  getCameraById,
  deleteCameraById,
  createCamera,
  updateCamera
} = require('../models/maps.model');

// GET /api/maps/buildings
const fetchBuildings = async (req, res) => {
  try {
    const rows = await getBuildings();

    const buildings = rows.map(row => ({
      id: row.id,
      name: row.name,
      location: {
        latitude: row.latitude,
        longitude: row.longitude
      },
      model_detection: row.camera_id !== null,
      category: row.kategori,
      camera: row.camera_id !== null
        ? {
            id: `detection${row.camera_id}`,
            title: row.camera_name,
            socketEvent: row.socket_event
          }
        : null
    }));

    res.json({ buildings });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/cameras/:id
const handleGetCameraById = async (req, res) => {
  try {
    const camera = await getCameraById(req.params.id);

    if (!camera) return res.status(404).json({ message: 'Camera not found' });

    res.json({
      id: camera.id,
      name: camera.name,
      category: camera.category,
      model_detection: camera.status === 1,
      location: {
        latitude: camera.latitude,
        longitude: camera.longitude
      },
      camera: {
        id: `detection${camera.id}`,
        title: camera.name,
        socketEvent: camera.socket_event
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/cameras/:id
const handleDeleteCameraById = async (req, res) => {
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

// POST /api/cameras
const handleCreateCamera = async (req, res) => {
  try {
    const {
      name,
      category,
      model_detection,
      location,
      camera
    } = req.body;

    const newId = await createCamera({
      title: camera.title,
      category,
      status: model_detection ? 1 : 0,
      latitude: location.latitude,
      longitude: location.longitude,
      socketEvent: camera.socketEvent
    });

    res.status(201).json({
      message: 'Camera created',
      id: newId,
      camera_id: `detection${newId}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/cameras/:id
const handleUpdateCamera = async (req, res) => {
  try {
    const {
      name,
      category,
      model_detection,
      location,
      camera
    } = req.body;

    const result = await updateCamera(req.params.id, {
      title: camera.title,
      category,
      status: model_detection ? 1 : 0,
      latitude: location.latitude,
      longitude: location.longitude,
      socketEvent: camera.socketEvent
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Camera not found' });
    }

    res.json({ message: 'Camera updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  fetchBuildings,
  getCameraById: handleGetCameraById,
  deleteCameraById: handleDeleteCameraById,
  createCamera: handleCreateCamera,
  updateCamera: handleUpdateCamera
};
