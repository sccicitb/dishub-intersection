const db = require('../config/db'); // koneksi mysql2/promise

// POST /api/cameras/status-log
exports.createCameraStatusLog = async (req, res) => {
  const { camera_id, status } = req.body;

  if (typeof camera_id === 'undefined' || typeof status === 'undefined') {
    return res.status(400).json({ error: 'camera_id and status are required' });
  }

  try {
    const [insertResult] = await db.execute(
      `INSERT INTO camera_status_logs (camera_id, status) VALUES (?, ?)`,
      [camera_id, status]
    );

    // Update snapshot status di tabel cameras
    await db.execute(
      `UPDATE cameras SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, camera_id]
    );

    return res.status(201).json({
      message: 'Status log saved and camera status updated',
      data: {
        id: insertResult.insertId,
        camera_id,
        status,
        recorded_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error saving camera status log:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/cameras/:id/status-log
exports.getCameraStatusLogs = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT id, status, recorded_at FROM camera_status_logs WHERE camera_id = ? ORDER BY recorded_at DESC LIMIT 100`,
      [id]
    );

    return res.status(200).json({ camera_id: id, logs: rows });
  } catch (err) {
    console.error('Error fetching status logs:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/cameras/status-latest
exports.getLatestCameraStatus = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT l.camera_id, l.status, l.recorded_at AS last_updated
      FROM camera_status_logs l
      JOIN (
          SELECT camera_id, MAX(recorded_at) AS last_time
          FROM camera_status_logs
          GROUP BY camera_id
      ) latest
      ON l.camera_id = latest.camera_id AND l.recorded_at = latest.last_time
    `);

    // Format waktu
    const formattedRows = rows.map(row => ({
      camera_id: row.camera_id,
      status: row.status,
      last_updated: new Date(row.last_updated).toLocaleString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta' // optional: disesuaikan ke WIB
      }).replace(',', '')
        .replace(/\//g, '-') // "2025-05-22 13:00:00"
        .replace(/-/g, '/')
    }));

    return res.status(200).json(formattedRows);
  } catch (err) {
    console.error('Error fetching latest camera status:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/cameras/down-today -> Nice to have, but not required
exports.getCamerasDownToday = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT DISTINCT camera_id
      FROM camera_status_logs
      WHERE DATE(recorded_at) = CURDATE()
      AND status = 0
    `);

    return res.status(200).json({ down: rows.map(r => r.camera_id) });
  } catch (err) {
    console.error('Error fetching down cameras:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
