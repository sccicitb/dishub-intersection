const { getBuildings } = require('../models/maps.model');

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

module.exports = { fetchBuildings };
