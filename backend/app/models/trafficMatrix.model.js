const db = require("../config/db");

const TrafficMatrix = {};

// NEW: Get camera status for a specific simpang and time range
const getCameraStatusByTimeRange = async (simpangId, startDateTime, endDateTime) => {
  try {
    let query = `
      SELECT 
        c.id as camera_id,
        c.name as camera_name,
        c.status,
        COUNT(CASE WHEN csl.status = 1 THEN 1 END) as active_logs,
        COUNT(CASE WHEN csl.status = 0 THEN 1 END) as inactive_logs,
        MAX(csl.recorded_at) as last_recorded,
        MIN(csl.recorded_at) as first_recorded
      FROM cameras c
      LEFT JOIN camera_status_logs csl ON c.id = csl.camera_id
        AND csl.recorded_at BETWEEN ? AND ?
    `;
    
    const params = [startDateTime, endDateTime];
    
    if (simpangId !== 'semua') {
      query += ` WHERE c.ID_Simpang = ?`;
      params.push(parseInt(simpangId));
    }
    
    query += ` GROUP BY c.id, c.name, c.status`;
    
    const [rows] = await db.query(query, params);
    
    // Format camera status data
    const cameraStatus = {};
    rows.forEach(row => {
      const uptime = row.active_logs + row.inactive_logs > 0 
        ? Math.round((row.active_logs / (row.active_logs + row.inactive_logs)) * 100)
        : 0;
      
      cameraStatus[row.camera_id] = {
        camera_id: row.camera_id,
        camera_name: row.camera_name,
        current_status: row.status,
        uptime_percentage: uptime,
        active_logs: row.active_logs,
        inactive_logs: row.inactive_logs,
        last_recorded: row.last_recorded,
        first_recorded: row.first_recorded
      };
    });
    
    return cameraStatus;
  } catch (error) {
    throw new Error(`Error getting camera status: ${error.message}`);
  }
};

// NEW: Get camera status for a specific hour
const getCameraStatusByHour = async (simpangId, hour) => {
  try {
    let query = `
      SELECT 
        c.id as camera_id,
        c.name as camera_name,
        c.status,
        COUNT(CASE WHEN csl.status = 1 THEN 1 END) as active_logs,
        COUNT(CASE WHEN csl.status = 0 THEN 1 END) as inactive_logs,
        MAX(csl.recorded_at) as last_recorded
      FROM cameras c
      LEFT JOIN camera_status_logs csl ON c.id = csl.camera_id
        AND HOUR(csl.recorded_at) = ?
    `;
    
    const params = [hour];
    
    if (simpangId !== 'semua') {
      query += ` WHERE c.ID_Simpang = ?`;
      params.push(parseInt(simpangId));
    }
    
    query += ` GROUP BY c.id, c.name, c.status`;
    
    const [rows] = await db.query(query, params);
    
    // Format camera status data
    const cameraStatus = {};
    rows.forEach(row => {
      const uptime = row.active_logs + row.inactive_logs > 0 
        ? Math.round((row.active_logs / (row.active_logs + row.inactive_logs)) * 100)
        : 0;
      
      cameraStatus[row.camera_id] = {
        camera_id: row.camera_id,
        camera_name: row.camera_name,
        current_status: row.status,
        uptime_percentage: uptime,
        active_logs: row.active_logs,
        inactive_logs: row.inactive_logs,
        last_recorded: row.last_recorded
      };
    });
    
    return cameraStatus;
  } catch (error) {
    throw new Error(`Error getting camera status by hour: ${error.message}`);
  }
};

// NEW: Build arah pergerakan matrix based on movement direction (Belok Kiri, Lurus, Belok Kanan)
TrafficMatrix.buildArahPergerakanByCategory = (asalTujuanCategoryData) => {
  try {
    
    // Define vehicle categories
    const vehicleCategories = {
      'SM': 'Sepeda Motor',
      'MP': 'Mobil Penumpang',
      'AUP': 'Angkutan Umum',
      'TR': 'Truk Ringan',
      'BS': 'Bus Sedang',
      'TS': 'Truk Sedang',
      'TB': 'Truk Berat',
      'BB': 'Bus Besar',
      'GANDENG': 'Gandeng/Semitrailer',
      'KTB': 'Kendaraan Tidak Bermotor'
    };
    
    // Direction mapping from English to Indonesian
    const directionMap = {
      'east': 'timur',
      'west': 'barat', 
      'south': 'selatan',
      'north': 'utara'
    };
    
    const directions = ['barat', 'selatan', 'timur', 'utara'];
    const movementTypes = ['Belok Kiri', 'Lurus', 'Belok Kanan'];
    
    // Initialize result matrix: movement -> direction -> category
    const result = {};
    movementTypes.forEach(movement => {
      result[movement] = {};
      directions.forEach(dir => {
        result[movement][dir] = {};
        Object.keys(vehicleCategories).forEach(catCode => {
          const catName = vehicleCategories[catCode];
          result[movement][dir][catName] = 0;
        });
        result[movement][dir]['Total'] = 0;
      });
      result[movement]['Total'] = {};
      Object.keys(vehicleCategories).forEach(catCode => {
        const catName = vehicleCategories[catCode];
        result[movement]['Total'][catName] = 0;
      });
      result[movement]['Total']['Total'] = 0;
    });
    
    let processedCount = 0;
    
    // Process each origin-destination pair
    asalTujuanCategoryData.forEach(row => {
      const { dari_arah, ke_arah } = row;
      
      // FIX: Validate dari_arah exists in directionMap
      if (!directionMap[dari_arah]) {
        return;
      }
      
      const dariArahId = directionMap[dari_arah];
      
      // Determine movement type based on origin and destination
      let movementType = null;
      
      if (dari_arah === 'east') {
        if (ke_arah === 'south') movementType = 'Belok Kiri';      // East → South = BKi
        else if (ke_arah === 'north') movementType = 'Belok Kanan'; // East → North = BKa
        else if (ke_arah === 'west') movementType = 'Lurus';        // East → West = Lurus
      }
      else if (dari_arah === 'west') {
        if (ke_arah === 'north') movementType = 'Belok Kiri';       // West → North = BKi
        else if (ke_arah === 'south') movementType = 'Belok Kanan'; // West → South = BKa
        else if (ke_arah === 'east') movementType = 'Lurus';        // West → East = Lurus
      }
      else if (dari_arah === 'north') {
        if (ke_arah === 'west') movementType = 'Belok Kiri';        // North → West = BKi
        else if (ke_arah === 'east') movementType = 'Belok Kanan';  // North → East = BKa
        else if (ke_arah === 'south') movementType = 'Lurus';       // North → South = Lurus
      }
      else if (dari_arah === 'south') {
        if (ke_arah === 'east') movementType = 'Belok Kiri';        // South → East = BKi
        else if (ke_arah === 'west') movementType = 'Belok Kanan';  // South → West = BKa
        else if (ke_arah === 'north') movementType = 'Lurus';       // South → North = Lurus
      }
      
      // FIX: Validate movement type is determined
      if (!movementType) {
        return;
      }
      
      processedCount++;
      
      // Process all vehicle categories and add to matrix
      Object.keys(vehicleCategories).forEach(catCode => {
        const catName = vehicleCategories[catCode];
        // IMPORTANT: Convert to integer to handle string values from database
        const count = parseInt(row[catCode]) || 0;
        
        // FIX: Add even if count is 0 (for complete data coverage)
        // Only skip if value is null/undefined
        if (count !== null && count !== undefined) {
          result[movementType][dariArahId][catName] += count;
          result[movementType][dariArahId]['Total'] += count;
          
          // Add to total
          result[movementType]['Total'][catName] += count;
          result[movementType]['Total']['Total'] += count;
        }
      });
    });
    
    return result;
  } catch (error) {
    throw new Error(`Error building arah pergerakan by category: ${error.message}`);
  }
};

// NEW: Get time period categories based on hour
// Period mapping:
//   - Dini Hari: 00:00 - 06:00 (hours 0-5)
//   - Pagi Hari: 06:00 - 12:00 (hours 6-11)
//   - Siang Hari: 12:00 - 15:00 (hours 12-14)
//   - Sore Hari: 15:00 - 18:00 (hours 15-17)
//   - Malam Hari: 18:00 - 00:00 (hours 18-23)
const getTimePeriodCategories = () => {
  return {
    'Dini Hari': { startHour: 0, endHour: 5 },      // 00:00 - 05:59
    'Pagi Hari': { startHour: 6, endHour: 11 },     // 06:00 - 11:59
    'Siang Hari': { startHour: 12, endHour: 14 },   // 12:00 - 14:59
    'Sore Hari': { startHour: 15, endHour: 17 },    // 15:00 - 17:59
    'Malam Hari': { startHour: 18, endHour: 23 }    // 18:00 - 23:59
  };
};

// NEW: Get time period name for a specific hour
const getTimePeriodByHour = (hour) => {
  const categories = getTimePeriodCategories();
  for (const [periodName, range] of Object.entries(categories)) {
    if (hour >= range.startHour && hour <= range.endHour) {
      return periodName;
    }
  }
  return null;
};

// NEW: Generate time slots based on interval
// Interval: 5min, 10min, 30min, 1hour
// Returns array of {label, startHour, startMin, endHour, endMin, timePeriod}
const generateTimeSlots = (interval) => {
  const slots = [];
  
  switch(interval) {
    case '5min':
      for (let hour = 0; hour < 24; hour++) {
        for (let min = 0; min < 60; min += 5) {
          const endMin = min + 5;
          const startLabel = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
          const endLabel = `${String(hour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
          slots.push({
            label: `${startLabel}-${endLabel}`,
            startHour: hour,
            startMin: min,
            endHour: hour,
            endMin: endMin,
            timePeriod: getTimePeriodByHour(hour)
          });
        }
      }
      break;
      
    case '15min':
      for (let hour = 0; hour < 24; hour++) {
        for (let min = 0; min < 60; min += 15) {
          const endMin = min + 15;
          const startLabel = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
          const endLabel = `${String(hour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
          slots.push({
            label: `${startLabel}-${endLabel}`,
            startHour: hour,
            startMin: min,
            endHour: hour,
            endMin: endMin,
            timePeriod: getTimePeriodByHour(hour)
          });
        }
      }
      break;
      
    case '30min':
      for (let hour = 0; hour < 24; hour++) {
        for (let min = 0; min < 60; min += 30) {
          const endMin = min + 30;
          const startLabel = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
          const endLabel = `${String(hour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
          slots.push({
            label: `${startLabel}-${endLabel}`,
            startHour: hour,
            startMin: min,
            endHour: hour,
            endMin: endMin,
            timePeriod: getTimePeriodByHour(hour)
          });
        }
      }
      break;
      
    case '1hour':
    default:
      for (let hour = 0; hour < 24; hour++) {
        const hourLabel = `${String(hour).padStart(2, '0')}:00`;
        const nextHour = String(hour).padStart(2, '0');
        slots.push({
          label: `${hourLabel}-${nextHour}:59`,
          startHour: hour,
          startMin: 0,
          endHour: hour,
          endMin: 59,
          timePeriod: getTimePeriodByHour(hour)
        });
      }
      break;
  }
  
  return slots;
};

// NEW: Get traffic matrix by filter (5min, 10min, 30min, 1hour) - OPTIMIZED with batch query
TrafficMatrix.getTrafficMatrixByFilter = async (simpangId, date, interval = '1hour') => {
  try {
    // Validate interval
    const validIntervals = ['5min', '15min', '30min', '1hour'];
    if (!validIntervals.includes(interval)) {
      throw new Error(`Invalid interval. Supported: ${validIntervals.join(', ')}`);
    }
    
    // Convert date format from YYYY/MM/DD to YYYY-MM-DD if needed
    const formattedDate = date.includes('/') ? date.replace(/\//g, '-') : date;
    const startDateTime = `${formattedDate} 00:00:00`;
    const endDateTime = `${formattedDate} 23:59:59`;
    

    const startTime = Date.now();
    
    // OPTIMIZED: Use single batch query instead of individual queries per time slot
    // This reduces database round trips from ~288 to 1
    let query = `
      SELECT 
        dari_arah,
        ke_arah,
        HOUR(waktu) as jam,
        MINUTE(waktu) as menit,
        SUM(CAST(SM AS UNSIGNED)) as SM,
        SUM(CAST(MP AS UNSIGNED)) as MP,
        SUM(CAST(AUP AS UNSIGNED)) as AUP,
        SUM(CAST(TR AS UNSIGNED)) as TR,
        SUM(CAST(BS AS UNSIGNED)) as BS,
        SUM(CAST(TS AS UNSIGNED)) as TS,
        SUM(CAST(TB AS UNSIGNED)) as TB,
        SUM(CAST(BB AS UNSIGNED)) as BB,
        SUM(CAST(GANDENG AS UNSIGNED)) as GANDENG,
        SUM(CAST(KTB AS UNSIGNED)) as KTB
      FROM arus 
      WHERE waktu BETWEEN ? AND ?
    `;
    
    const params = [startDateTime, endDateTime];
    
    if (simpangId !== 'semua') {
      query += ` AND ID_Simpang = ?`;
      params.push(parseInt(simpangId));
    }
    
    // Group by direction, destination, hour, and minute
    query += ` GROUP BY dari_arah, ke_arah, HOUR(waktu), MINUTE(waktu)
              ORDER BY HOUR(waktu), MINUTE(waktu), dari_arah, ke_arah`;
    
    const [allRows] = await db.query(query, params);
    
    // Generate time slots
    const timeSlots = generateTimeSlots(interval);
    const result = {};
    
    // OPTIMIZED: Process results in memory instead of querying per slot
    // Group results by time slot
    for (const slot of timeSlots) {
      const slotData = [];
      
      // Filter rows that match this time slot
      for (const row of allRows) {
        const rowHour = row.jam;
        const rowMin = row.menit;
        
        // Check if row falls within this slot
        let matchesSlot = false;
        
        if (interval === '1hour') {
          // For hourly: match exact hour
          matchesSlot = rowHour === slot.startHour;
        } else {
          // For 5/15/30 min: check if minute falls within the slot range
          const slotEndMin = slot.startMin + (interval === '5min' ? 5 : interval === '15min' ? 15 : 30);
          matchesSlot = rowHour === slot.startHour && rowMin >= slot.startMin && rowMin < slotEndMin;
        }
        
        if (matchesSlot) {
          slotData.push({
            dari_arah: row.dari_arah,
            ke_arah: row.ke_arah,
            SM: row.SM,
            MP: row.MP,
            AUP: row.AUP,
            TR: row.TR,
            BS: row.BS,
            TS: row.TS,
            TB: row.TB,
            BB: row.BB,
            GANDENG: row.GANDENG,
            KTB: row.KTB
          });
        }
      }
      
      // Process into movement direction matrix
      const arahPergerakanData = TrafficMatrix.buildArahPergerakanByCategory(slotData);
      result[slot.label] = arahPergerakanData;
    }

    const elapsedTime = Date.now() - startTime;
    return result;
  } catch (error) {
    throw new Error(`Error getting traffic matrix by filter: ${error.message}`);
  }
};

module.exports = TrafficMatrix;
