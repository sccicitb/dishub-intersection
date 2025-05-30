const {
  getBuildingsRaw,
  getAllCamerasRaw,
  getBuildingsWithCameras
} = require('../models/maps.model');

// GET /api/maps/buildings
const fetchBuildingsRaw = async (req, res) => {
  try {
    const rows = await getBuildingsRaw();
    const buildings = rows.map(row => ({
      id: row.id,
      name: row.name,
      location: { latitude: row.latitude, longitude: row.longitude },
      model_detection: true,
      category: row.kategori
    }));
    res.json({ buildings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/maps/cameras
const fetchAllCamerasRaw = async (req, res) => {
  try {
    const cameras = await getAllCamerasRaw();
    res.json(cameras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/maps/buildings-full
const fetchBuildingsWithCameras = async (req, res) => {
  try {
    const { buildings, cameras } = await getBuildingsWithCameras();
    const result = buildings.map(b => ({
      id: b.id,
      name: b.name,
      location: { latitude: b.latitude, longitude: b.longitude },
      model_detection: cameras.some(c => c.location_id === b.id),
      category: b.kategori,
      cameras: cameras
        .filter(cam => cam.location_id === b.id)
        .map(cam => ({
          camera_id: cam.camera_id,
          id: `detection${cam.camera_id}`,
          location_id: cam.location_id,
          title: cam.title,
          socketEvent: cam.socketEvent
        }))
    }));
    res.json({ buildings: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  fetchBuildingsRaw,
  fetchAllCamerasRaw,
  fetchBuildingsWithCameras
};
