const db = require('../config/db'); // koneksi mysql2/promise

// POST /api/cameras/status-log
// status: 1 = aktif, 0 = tidak aktif/mati
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

    const statusLabel = status === 1 ? 'aktif' : 'tidak aktif/mati';
    return res.status(201).json({
      message: 'Status log saved and camera status updated',
      data: {
        id: insertResult.insertId,
        camera_id,
        status,
        status_label: statusLabel,
        recorded_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error saving camera status log:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/cameras/status-log
// Query params: simpang_id (required), date (optional YYYY-MM-DD)
// Response: status = 1 (aktif) jika ada data di survey, status = 0 (tidak aktif/mati) jika tidak ada data
exports.getCameraStatusLogs = async (req, res) => {
  const { simpang_id, date } = req.query;

  if (!simpang_id) {
    return res.status(400).json({ error: 'simpang_id is required' });
  }

  try {
    // Get camera based on simpang_id
    const [cameras] = await db.execute(
      `SELECT id FROM cameras WHERE ID_Simpang = ? LIMIT 1`,
      [simpang_id]
    );

    if (cameras.length === 0) {
      return res.status(404).json({ error: 'Camera not found for this simpang_id' });
    }

    // Build query dengan optional date filter
    let query = `SELECT id, recorded_at FROM camera_status_logs WHERE camera_id = ?`;
    const params = [cameraId];
    
    if (date) {
      // Validate date format YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }
      // Filter by date range (full day) - convert UTC to WIB (UTC+7)
      query += ` AND DATE(CONVERT_TZ(recorded_at, '+00:00', '+07:00')) = ?`;
      params.push(date);
    }
    
    query += ` ORDER BY recorded_at DESC LIMIT 100`;
    
    const [rows] = await db.execute(query, params);

    // Jika tidak ada logs, langsung return empty
    if (rows.length === 0) {
      return res.status(200).json({ 
        camera_id: cameraId,
        simpang_id: parseInt(simpang_id),
        filter_date: date || null,
        logs: [] 
      });
    }

    // Untuk setiap log, cek apakah ada data di survey pada tanggal tersebut
    const surveyModel = require('../models/survey.model');
    const subCodeMap = require('../helpers/subCodeMap');
    const fs = require('fs');
    const path = require('path');

    // Load classification
    const classificationPath = path.join(__dirname, '../data/classification.json');
    const classificationJson = JSON.parse(fs.readFileSync(classificationPath, 'utf-8'));
    
    const rawSubCodes = classificationJson
      .filter(item => item.type === 'luar_kota')
      .map(item => item.subCode);
    const includedSubCodes = rawSubCodes.map(code => subCodeMap[code] || code);

    // Map logs dengan status dari survey
    const logsWithLabel = await Promise.all(rows.map(async (log) => {
      try {
        // Extract date from recorded_at (YYYY-MM-DD)
        const logDate = new Date(log.recorded_at).toISOString().split('T')[0];

        // Query survey data untuk tanggal spesifik dan simpang ini
        const surveyData = await surveyModel.getVehicleDataGrouped(
          {
            simpangId: simpang_id,
            approach: 'semua',
            direction: null,
            date: logDate, // Pass tanggal dari log
            classificationType: 'luar_kota'
          },
          includedSubCodes,
          '5min'
        );

        // Cek apakah ada data (structure baru: { vehicleData: [...] })
        let hasData = false;
        let dataCount = 0;
        
        if (surveyData && surveyData.vehicleData && Array.isArray(surveyData.vehicleData)) {
          dataCount = surveyData.vehicleData.length;
          
          // Cek apakah ada minimal satu timeSlot dengan total > 0
          for (const periodItem of surveyData.vehicleData) {
            if (periodItem.timeSlots && Array.isArray(periodItem.timeSlots)) {
              for (const timeSlot of periodItem.timeSlots) {
                if (timeSlot.data && timeSlot.data.total > 0) {
                  hasData = true;
                  break;
                }
              }
              if (hasData) break;
            }
          }
        }

        const status = hasData ? 1 : 0;
        const statusLabel = status === 1 ? 'aktif' : 'tidak aktif/mati';

        return {
          id: log.id,
          status: status,
          status_label: statusLabel,
          recorded_at: log.recorded_at
        };
      } catch (err) {
        console.error(`[ERROR Simpang ${simpang_id}] Error checking survey data for log ${log.id}:`, err.message);
        console.error(err.stack);
        
        // Fallback
        return {
          id: log.id,
          status: 0,
          status_label: 'tidak aktif/mati',
          recorded_at: log.recorded_at
        };
      }
    }));

    return res.status(200).json({ 
      camera_id: cameraId,
      simpang_id: parseInt(simpang_id),
      filter_date: date || null,
      logs: logsWithLabel 
    });
  } catch (err) {
    console.error('Error fetching status logs:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/cameras/status-log-idcamera
// Query params: camera_id (required), date (optional YYYY-MM-DD)
// Response: status = 1 (aktif) jika ada data di survey, status = 0 (tidak aktif/mati) jika tidak ada data
// Query by CAMERA_ID
exports.getCameraStatusLogsByCameraId = async (req, res) => {
  const { camera_id, date } = req.query;

  if (!camera_id) {
    return res.status(400).json({ error: 'camera_id is required' });
  }

  try {
    const cameraId = parseInt(camera_id);
    
    // Get camera to get simpang_id
    const [cameras] = await db.execute(
      `SELECT ID_Simpang FROM cameras WHERE id = ? LIMIT 1`,
      [cameraId]
    );

    if (cameras.length === 0) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    const simpangId = cameras[0].ID_Simpang;
    
    // Determine the date to filter (use provided date or today)
    let filterDate = date;
    let isToday = false;
    
    if (!filterDate) {
      // Get today's date in Jakarta timezone
      const now = new Date();
      const jakartaDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      filterDate = jakartaDate.toISOString().split('T')[0];
      isToday = true;
    } else {
      // Check if the provided date is today
      const now = new Date();
      const jakartaDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const todayStr = jakartaDate.toISOString().split('T')[0];
      isToday = (filterDate === todayStr);
    }
    
    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(filterDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Query logs for the specific date - convert recorded_at from UTC to Jakarta timezone (+07:00)
    const query = `
      SELECT id, status, CONVERT_TZ(recorded_at, '+00:00', '+07:00') as recorded_at 
      FROM camera_status_logs 
      WHERE camera_id = ? 
        AND DATE(CONVERT_TZ(recorded_at, '+00:00', '+07:00')) = ?
      ORDER BY recorded_at ASC
    `;
    
    const [rows] = await db.execute(query, [cameraId, filterDate]);

    // Create a map of time -> status for quick lookup
    const logMap = {};
    let lastLogTime = null;
    
    rows.forEach((log) => {
      // Extract time directly from recorded_at without conversion
      const time = log.recorded_at.toISOString().split('T')[1].substring(0, 8); // HH:MM:SS
      
      // Format recorded_at as-is from database (no additional conversion)
      const recordedAtFormatted = log.recorded_at.toISOString().slice(0, 19).replace('T', ' ');
      
      const logEntry = {
        id: log.id,
        status: log.status,
        status_label: log.status === 1 ? 'aktif' : 'tidak aktif/mati',
        recorded_at: recordedAtFormatted
      };
      
      logMap[time] = logEntry;
      lastLogTime = time; // Track last log time
    });

    // Get current time in Jakarta timezone if today
    let currentTimeStr = null;
    if (isToday) {
      const now = new Date();
      const jakartaDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const hours = String(jakartaDate.getHours()).padStart(2, '0');
      const minutes = String(jakartaDate.getMinutes()).padStart(2, '0');
      currentTimeStr = `${hours}:${minutes}:00`;
    }

    // Query arus table to check for vehicle data on this date and time
    const arusQuery = `
      SELECT DISTINCT 
        HOUR(waktu) as jam,
        MINUTE(waktu) as menit
      FROM arus
      WHERE ID_Simpang = ?
        AND DATE(waktu) = ?
      ORDER BY jam ASC, menit ASC
    `;
    
    const [arusRows] = await db.execute(arusQuery, [simpangId, filterDate]);
    
    // Create a set of time slots (HH:MM:00) with vehicle data in arus table
    const timeSlotsWithArusData = new Set();
    arusRows.forEach(row => {
      const timeSlot = `${String(row.jam).padStart(2, '0')}:${String(row.menit).padStart(2, '0')}:00`;
      timeSlotsWithArusData.add(timeSlot);
    });
        
    // Generate all 5-minute intervals for the day (00:00 to 23:55)
    const timeline = [];
    let lastKnownStatus = null; // Track last known status for interpolation
    let lastRecordedAt = null; // Track last recorded_at for interpolation
    let firstLogEncountered = false; // Track if we've hit the first log entry

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
        
        // Check if there's a log at this exact time
        if (logMap[timeStr]) {
          const logData = logMap[timeStr];
          lastKnownStatus = logData.status;
          lastRecordedAt = logData.recorded_at;
          firstLogEncountered = true;
          
          timeline.push({
            time: timeStr,
            status: logData.status,
            status_label: logData.status_label,
            recorded_at: logData.recorded_at
          });
        } else {
          // Check if this is after the last log and today is the filter date
          if (isToday && lastLogTime && timeStr > lastLogTime) {
            // After last log on today - send null for no data yet
            timeline.push({
              time: timeStr,
              status: null,
              status_label: null,
              recorded_at: null
            });
          } else if (!firstLogEncountered && timeSlotsWithArusData.has(timeStr)) {
            // Before first log entry - if there's vehicle data in arus, assume camera is on
            timeline.push({
              time: timeStr,
              status: 1,
              status_label: 'aktif (inferred dari arus)',
              recorded_at: null
            });
            lastKnownStatus = 1; // Set status for interpolation
          } else if (lastKnownStatus === 0) {
            // Last known status is 0 (mati) - keep it as mati (interpolate)
            timeline.push({
              time: timeStr,
              status: 0,
              status_label: 'tidak aktif/mati',
              recorded_at: lastRecordedAt
            });
          } else if (lastKnownStatus === 1) {
            // Last known status is 1 (aktif) - keep it as aktif (interpolate)
            timeline.push({
              time: timeStr,
              status: 1,
              status_label: 'aktif',
              recorded_at: lastRecordedAt
            });
          } else if (timeSlotsWithArusData.has(timeStr)) {
            // No log data but there's vehicle data in arus table at this exact time - assume camera is on
            timeline.push({
              time: timeStr,
              status: 1,
              status_label: 'aktif (inferred dari arus)',
              recorded_at: null
            });
            lastKnownStatus = 1; // Update last known status for subsequent interpolation
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
      timeline_5min: timeline
    });
  } catch (err) {
    console.error('Error fetching status logs by camera_id:', err);
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
    // ✅ OPTIMIZED: Use index-friendly date range instead of DATE() function (5-10x faster)
    const today = new Date();
    const startOfDay = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 00:00:00`;
    const endOfDay = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 23:59:59`;
    
    const [rows] = await db.execute(`
      SELECT DISTINCT camera_id
      FROM camera_status_logs
      WHERE recorded_at BETWEEN ? AND ?
      AND status = 0
    `, [startOfDay, endOfDay]);

    return res.status(200).json({ down: rows.map(r => r.camera_id) });
  } catch (err) {
    console.error('Error fetching down cameras:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
