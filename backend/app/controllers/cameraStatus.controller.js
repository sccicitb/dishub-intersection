const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const surveyModel = require('../models/survey.model');
const subCodeMap = require('../helpers/subCodeMap');

// Validasi format tanggal
const validateDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

// Ambil subCode
const getSubCodes = () => {
  const classificationPath = path.join(__dirname, '../data/classification.json');
  const classificationJson = JSON.parse(fs.readFileSync(classificationPath, 'utf-8'));
  const rawSubCodes = classificationJson
    .filter(item => item.type === 'luar_kota')
    .map(item => item.subCode);
  return rawSubCodes.map(code => subCodeMap[code] || code);
};

// POST /api/cameras/status-log
exports.createCameraStatusLog = async (req, res) => {
  const { camera_id, status } = req.body;

  if (typeof camera_id === 'undefined' || typeof status === 'undefined') {
    return res.status(400).json({ error: 'camera_id dan status wajib' });
  }

  try {
    const [insertResult] = await db.execute(
      `INSERT INTO camera_status_logs (camera_id, status) VALUES (?, ?)`,
      [camera_id, status]
    );

    await db.execute(
      `UPDATE cameras SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, camera_id]
    );

    const statusLabel = status === 1 ? 'aktif' : 'tidak aktif';
    return res.status(201).json({
      message: 'Status log tersimpan',
      data: {
        id: insertResult.insertId,
        camera_id, status, status_label: statusLabel,
        recorded_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error server' });
  }
};

// GET /api/cameras/status-log
exports.getCameraStatusLogs = async (req, res) => {
  const { simpang_id, date } = req.query;

  if (!simpang_id) {
    return res.status(400).json({ error: 'simpang_id wajib' });
  }

  try {
    const [cameras] = await db.execute(
      `SELECT id FROM cameras WHERE ID_Simpang = ? LIMIT 1`,
      [simpang_id]
    );

    if (cameras.length === 0) {
      return res.status(404).json({ error: 'Kamera tidak ditemukan' });
    }

    const cameraId = cameras[0].id;
    let query = `SELECT id, recorded_at FROM camera_status_logs WHERE camera_id = ?`;
    const params = [cameraId];
    
    if (date) {
      if (!validateDate(date)) {
        return res.status(400).json({ error: 'Format tanggal YYYY-MM-DD' });
      }
      query += ` AND DATE(CONVERT_TZ(recorded_at, '+00:00', '+07:00')) = ?`;
      params.push(date);
    }
    
    query += ` ORDER BY recorded_at DESC LIMIT 100`;
    const [rows] = await db.execute(query, params);

    if (rows.length === 0) {
      return res.status(200).json({ camera_id: cameraId, simpang_id: parseInt(simpang_id), filter_date: date || null, logs: [] });
    }

    // Cek survey data
    const includedSubCodes = getSubCodes();
    const logsWithLabel = await Promise.all(rows.map(async (log) => {
      try {
        const logDate = new Date(log.recorded_at).toISOString().split('T')[0];
        const surveyData = await surveyModel.getVehicleDataGrouped(
          { simpangId: simpang_id, approach: 'semua', direction: null, date: logDate, classificationType: 'luar_kota' },
          includedSubCodes, '5min'
        );

        let hasData = false;
        if (surveyData?.vehicleData?.length > 0) {
          for (const period of surveyData.vehicleData) {
            for (const slot of period.timeSlots || []) {
              if (slot.data?.total > 0) {
                hasData = true;
                break;
              }
            }
            if (hasData) break;
          }
        }

        const status = hasData ? 1 : 0;
        return {
          id: log.id,
          status,
          status_label: status === 1 ? 'aktif' : 'tidak aktif',
          recorded_at: log.recorded_at
        };
      } catch (err) {
        console.error(err);
        return { id: log.id, status: 0, status_label: 'tidak aktif', recorded_at: log.recorded_at };
      }
    }));

    return res.status(200).json({ camera_id: cameraId, simpang_id: parseInt(simpang_id), filter_date: date || null, logs: logsWithLabel });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error server' });
  }
};

// GET /api/cameras/status-log-idcamera
exports.getCameraStatusLogsByCameraId = async (req, res) => {
  const { camera_id, date } = req.query;

  if (!camera_id) {
    return res.status(400).json({ error: 'camera_id wajib' });
  }

  try {
    const cameraId = parseInt(camera_id);
    const [cameras] = await db.execute(
      `SELECT ID_Simpang FROM cameras WHERE id = ? LIMIT 1`,
      [cameraId]
    );

    if (cameras.length === 0) {
      return res.status(404).json({ error: 'Kamera tidak ditemukan' });
    }

    const simpangId = cameras[0].ID_Simpang;
    let filterDate = date;
    let isToday = false;
    
    if (!filterDate) {
      const now = new Date();
      const jakartaDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      filterDate = jakartaDate.toISOString().split('T')[0];
      isToday = true;
    } else {
      if (!validateDate(filterDate)) {
        return res.status(400).json({ error: 'Format tanggal YYYY-MM-DD' });
      }
      const now = new Date();
      const jakartaDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const todayStr = jakartaDate.toISOString().split('T')[0];
      isToday = (filterDate === todayStr);
    }

    const query = `
      SELECT id, status, recorded_at 
      FROM camera_status_logs 
      WHERE camera_id = ? 
        AND DATE(recorded_at) = ?
      ORDER BY recorded_at ASC
    `;
    
    const [rows] = await db.execute(query, [cameraId, filterDate]);

    const logMap = {};
    let lastLogTime = null;
    
    rows.forEach((log) => {
      // Format waktu langsung dari database (sudah waktu Jakarta)
      const year = log.recorded_at.getFullYear();
      const month = String(log.recorded_at.getMonth() + 1).padStart(2, '0');
      const day = String(log.recorded_at.getDate()).padStart(2, '0');
      const hours = String(log.recorded_at.getHours()).padStart(2, '0');
      const minutes = String(log.recorded_at.getMinutes()).padStart(2, '0');
      const seconds = String(log.recorded_at.getSeconds()).padStart(2, '0');
      
      const time = `${hours}:${minutes}:${seconds}`;
      const recordedAtFormatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      
      logMap[time] = {
        id: log.id,
        status: log.status,
        status_label: log.status === 1 ? 'aktif' : 'tidak aktif',
        recorded_at: recordedAtFormatted
      };
      lastLogTime = time;
    });

    // Query untuk mengambil data kendaraan yang ada (grouping per 5 menit)
    const startDateTime = `${filterDate} 00:00:00`;
    const endDateTime = `${filterDate} 23:59:59`;
    
    const [arusRows] = await db.execute(
      `SELECT 
        HOUR(waktu) as jam, 
        FLOOR(MINUTE(waktu) / 5) * 5 as menit_interval,
        COUNT(*) as total
       FROM arus 
       WHERE ID_Simpang = ? 
         AND waktu BETWEEN ? AND ?
       GROUP BY HOUR(waktu), FLOOR(MINUTE(waktu) / 5)
       ORDER BY jam ASC, menit_interval ASC`,
      [simpangId, startDateTime, endDateTime]
    );
    
    const timeSlotsWithArusData = new Set();
    arusRows.forEach(row => {
      const timeStr = `${String(row.jam).padStart(2, '0')}:${String(row.menit_interval).padStart(2, '0')}:00`;
      timeSlotsWithArusData.add(timeStr);
    });
        
    const timeline = [];
    
    // Hitung waktu sekarang dalam menit untuk perbandingan
    const now = new Date();
    const jakartaNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const currentTimeInMinutes = jakartaNow.getHours() * 60 + jakartaNow.getMinutes();

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
        const slotTimeInMinutes = hour * 60 + minute;
        
        // Cek apakah interval ini sudah lewat atau belum terjadi
        const isFutureTime = isToday && slotTimeInMinutes > currentTimeInMinutes;
        
        // Cek apakah ada data kendaraan di interval ini
        const hasArusData = timeSlotsWithArusData.has(timeStr);
        
        if (logMap[timeStr]) {
          const logData = logMap[timeStr];
          
          // Jika ada data kendaraan, status pasti aktif (override apapun status log)
          if (hasArusData) {
            timeline.push({
              time: timeStr, 
              status: 1,
              status_label: 'aktif (ada data kendaraan)', 
              recorded_at: logData.recorded_at
            });
          } else {
            // Tidak ada data kendaraan, gunakan status dari log
            timeline.push({
              time: timeStr, 
              status: logData.status,
              status_label: logData.status_label, 
              recorded_at: logData.recorded_at
            });
          }
        } else {
          // Tidak ada log di interval ini
          if (hasArusData) {
            // Ada data kendaraan tapi tidak ada log, berarti aktif
            timeline.push({
              time: timeStr, 
              status: 1,
              status_label: 'aktif (ada data kendaraan)', 
              recorded_at: null
            });
          } else if (isFutureTime) {
            // Interval waktu yang belum terjadi
            timeline.push({ 
              time: timeStr, 
              status: null, 
              status_label: null, 
              recorded_at: null 
            });
          } else {
            // Interval sudah lewat, tidak ada log dan tidak ada data kendaraan = tidak aktif
            timeline.push({ 
              time: timeStr, 
              status: 0, 
              status_label: 'tidak aktif', 
              recorded_at: null 
            });
          }
        }
      }
    }

    return res.status(200).json({ 
      camera_id: cameraId, 
      simpang_id: simpangId, 
      filter_date: filterDate,
      is_today: isToday, 
      total_logs: rows.length,
      total_arus_intervals: timeSlotsWithArusData.size,
      timeline_5min: timeline
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error server' });
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

    const formattedRows = rows.map(row => {
      const date = new Date(row.last_updated);
      const jakartaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const formatted = jakartaDate.toISOString().slice(0, 19).replace('T', ' ');
      return { camera_id: row.camera_id, status: row.status, last_updated: formatted };
    });

    return res.status(200).json(formattedRows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error server' });
  }
};

// GET /api/cameras/down-today
exports.getCamerasDownToday = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 00:00:00`;
    const endOfDay = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 23:59:59`;
    
    const [rows] = await db.execute(`
      SELECT DISTINCT camera_id FROM camera_status_logs
      WHERE recorded_at BETWEEN ? AND ? AND status = 0
    `, [startOfDay, endOfDay]);

    return res.status(200).json({ down: rows.map(r => r.camera_id) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error server' });
  }
};
