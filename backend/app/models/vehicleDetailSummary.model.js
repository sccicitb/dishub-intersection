const db = require("../config/db");

const VehicleDetailSummary = function (data) {
  this.data = data;
};

// Vehicle type codes mapped to labels
const VEHICLE_TYPES = {
  SM: "Sepeda Motor",
  MP: "Mobil Penumpang",
  AUP: "Angkutan Umum Penumpang",
  TR: "Truk",
  BS: "Bus",
  TS: "Truk Sedang",
  TB: "Truk Besar",
  BB: "Bus Besar",
  GANDENG: "Gandeng",
  KTB: "Kendaraan Tak Bermotor"
};

// Helper function to get date filter clause
const getDateFilterClause = (date = null) => {
  if (!date) {
    throw new Error('date parameter is required in YYYY-MM-DD format');
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD format (e.g., 2026-01-05)');
  }

  // Parse date and create timestamp range for full day
  const start = new Date(`${date}T00:00:00+07:00`);
  const end = new Date(`${date}T23:59:59+07:00`);

  return {
    startDateTime: start.toISOString().slice(0, 19).replace('T', ' '),
    endDateTime: end.toISOString().slice(0, 19).replace('T', ' ')
  };
};

// Get detailed masuk/keluar by arah and vehicle type for specific simpang
VehicleDetailSummary.getMasukKeluarDetailBySimpang = async (simpangId, date, callback) => {
  try {
    // Validate inputs
    if (!simpangId) {
      throw new Error('simpang_id is required');
    }

    const dateRange = getDateFilterClause(date);

    const query = `
      SELECT 
        dari_arah,
        ke_arah,
        SM, MP, AUP, TR, BS, TS, TB, BB, GANDENG, KTB,
        CASE 
          WHEN dari_arah IN ('north', 'south') THEN 'IN'
          WHEN ke_arah IN ('north', 'south') THEN 'OUT'
          WHEN dari_arah IN ('east', 'west') THEN 'IN'
          WHEN ke_arah IN ('east', 'west') THEN 'OUT'
          ELSE 'UNKNOWN'
        END as direction
      FROM arus
      WHERE ID_Simpang = ?
        AND waktu >= ?
        AND waktu <= ?
      ORDER BY dari_arah, ke_arah
    `;

    const [rows] = await db.execute(query, [
      simpangId,
      dateRange.startDateTime,
      dateRange.endDateTime
    ]);

    // Process data - aggregate by arah (direction) and IN/OUT
    const arahSummary = {
      'north': { IN: {}, OUT: {} },
      'south': { IN: {}, OUT: {} },
      'east': { IN: {}, OUT: {} },
      'west': { IN: {}, OUT: {} }
    };

    // Initialize vehicle type counters for each arah and direction
    Object.keys(arahSummary).forEach(arah => {
      ['IN', 'OUT'].forEach(dir => {
        Object.keys(VEHICLE_TYPES).forEach(type => {
          arahSummary[arah][dir][type] = 0;
        });
        arahSummary[arah][dir].total = 0;
      });
    });

    // Aggregate data
    rows.forEach(row => {
      const dari = row.dari_arah;
      const ke = row.ke_arah;
      
      // Determine if it's IN or OUT based on direction
      let direction = 'UNKNOWN';
      
      // For each arah, determine if this record is IN or OUT
      if (dari === 'north' || dari === 'south' || dari === 'east' || dari === 'west') {
        direction = 'IN'; // Coming FROM this direction
      }
      if (ke === 'north' || ke === 'south' || ke === 'east' || ke === 'west') {
        direction = 'OUT'; // Going TO this direction
      }

      // Decide which arah to aggregate to
      let targetArah = dari; // Default to dari_arah
      
      // If this is an IN/OUT flow, determine the correct arah
      Object.keys(arahSummary).forEach(arah => {
        if (dari === arah) {
          targetArah = dari;
          direction = 'IN';
        } else if (ke === arah) {
          targetArah = ke;
          direction = 'OUT';
        }
      });

      // Add vehicle counts
      if (arahSummary[targetArah] && arahSummary[targetArah][direction]) {
        Object.keys(VEHICLE_TYPES).forEach(type => {
          const count = parseInt(row[type]) || 0;
          arahSummary[targetArah][direction][type] += count;
          arahSummary[targetArah][direction].total += count;
        });
      }
    });

    // Format response
    const result = [];
    Object.keys(arahSummary).forEach(arah => {
      const formattedArah = {
        arah: arah,
        IN: arahSummary[arah].IN,
        OUT: arahSummary[arah].OUT
      };
      result.push(formattedArah);
    });

    callback(null, result);
  } catch (error) {
    console.error('[ERROR] getMasukKeluarDetailBySimpang:', error);
    callback(error);
  }
};

// Get detailed masuk/keluar by arah and vehicle type for multiple simpangs
VehicleDetailSummary.getMasukKeluarDetailBySimpangs = async (simpangIds, date, callback) => {
  try {
    if (!simpangIds || simpangIds.length === 0) {
      throw new Error('At least one simpang_id is required');
    }

    const dateRange = getDateFilterClause(date);
    const placeholders = simpangIds.map(() => '?').join(',');

    const query = `
      SELECT 
        ID_Simpang,
        dari_arah,
        ke_arah,
        SM, MP, AUP, TR, BS, TS, TB, BB, GANDENG, KTB
      FROM arus
      WHERE ID_Simpang IN (${placeholders})
        AND waktu >= ?
        AND waktu <= ?
      ORDER BY ID_Simpang, dari_arah, ke_arah
    `;

    const params = [...simpangIds, dateRange.startDateTime, dateRange.endDateTime];
    const [rows] = await db.execute(query, params);

    // Process data - aggregate by simpang, arah, and IN/OUT
    const resultBySimpang = {};

    rows.forEach(row => {
      const simpangId = row.ID_Simpang;
      
      if (!resultBySimpang[simpangId]) {
        resultBySimpang[simpangId] = {
          'north': { IN: {}, OUT: {} },
          'south': { IN: {}, OUT: {} },
          'east': { IN: {}, OUT: {} },
          'west': { IN: {}, OUT: {} }
        };

        // Initialize vehicle type counters
        Object.keys(resultBySimpang[simpangId]).forEach(arah => {
          ['IN', 'OUT'].forEach(dir => {
            Object.keys(VEHICLE_TYPES).forEach(type => {
              resultBySimpang[simpangId][arah][dir][type] = 0;
            });
            resultBySimpang[simpangId][arah][dir].total = 0;
          });
        });
      }

      const dari = row.dari_arah;
      const ke = row.ke_arah;

      // Determine arah and direction
      let targetArah = dari;
      let direction = 'IN';

      if (Object.keys(resultBySimpang[simpangId]).includes(ke)) {
        targetArah = ke;
        direction = 'OUT';
      }

      // Add vehicle counts
      if (resultBySimpang[simpangId][targetArah] && resultBySimpang[simpangId][targetArah][direction]) {
        Object.keys(VEHICLE_TYPES).forEach(type => {
          const count = parseInt(row[type]) || 0;
          resultBySimpang[simpangId][targetArah][direction][type] += count;
          resultBySimpang[simpangId][targetArah][direction].total += count;
        });
      }
    });

    // Format result as array of simpangs with their data
    const result = [];
    Object.keys(resultBySimpang).forEach(simpangId => {
      const simpangData = {
        simpang_id: simpangId,
        data: []
      };

      Object.keys(resultBySimpang[simpangId]).forEach(arah => {
        const arahData = {
          arah: arah,
          IN: resultBySimpang[simpangId][arah].IN,
          OUT: resultBySimpang[simpangId][arah].OUT
        };
        simpangData.data.push(arahData);
      });

      result.push(simpangData);
    });

    callback(null, result);
  } catch (error) {
    console.error('[ERROR] getMasukKeluarDetailBySimpangs:', error);
    callback(error);
  }
};

// Helper function to initialize arah summary structure
const initializeArahSummary = () => {
  const summary = {
    'north': { IN: {}, OUT: {} },
    'south': { IN: {}, OUT: {} },
    'east': { IN: {}, OUT: {} },
    'west': { IN: {}, OUT: {} }
  };

  Object.keys(summary).forEach(arah => {
    ['IN', 'OUT'].forEach(dir => {
      Object.keys(VEHICLE_TYPES).forEach(type => {
        summary[arah][dir][type] = 0;
      });
      summary[arah][dir].total = 0;
    });
  });

  return summary;
};

// Helper function to process rows into arah summary
const processRowsToArahSummary = (rows) => {
  const arahSummary = initializeArahSummary();

  rows.forEach(row => {
    const dari = row.dari_arah;
    const ke = row.ke_arah;
    
    // Determine which arah and direction (IN/OUT)
    let targetArah = dari;
    let direction = 'IN';

    if (Object.keys(arahSummary).includes(ke)) {
      targetArah = ke;
      direction = 'OUT';
    }

    // Add vehicle counts
    if (arahSummary[targetArah] && arahSummary[targetArah][direction]) {
      Object.keys(VEHICLE_TYPES).forEach(type => {
        const count = parseInt(row[type]) || 0;
        arahSummary[targetArah][direction][type] += count;
        arahSummary[targetArah][direction].total += count;
      });
    }
  });

  // Format response
  const result = [];
  Object.keys(arahSummary).forEach(arah => {
    result.push({
      arah: arah,
      IN: arahSummary[arah].IN,
      OUT: arahSummary[arah].OUT
    });
  });

  return result;
};

// Get detailed masuk/keluar by arah with 30-minute intervals
VehicleDetailSummary.getMasukKeluarDetailBy30Min = async (simpangId, date) => {
  try {
    if (!simpangId) {
      throw new Error('simpang_id is required');
    }

    const dateRange = getDateFilterClause(date);

    // Single optimized query that groups by 30-minute intervals
    const query = `
      SELECT 
        HOUR(waktu) as hour_slot,
        FLOOR(MINUTE(waktu) / 30) as minute_slot,
        dari_arah,
        ke_arah,
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
      WHERE ID_Simpang = ?
        AND waktu BETWEEN ? AND ?
      GROUP BY HOUR(waktu), FLOOR(MINUTE(waktu) / 30), dari_arah, ke_arah
      ORDER BY HOUR(waktu), FLOOR(MINUTE(waktu) / 30), dari_arah, ke_arah
    `;

    const [rows] = await db.execute(query, [
      simpangId,
      dateRange.startDateTime,
      dateRange.endDateTime
    ]);

    // Group results by time slot
    const slotData = {};
    
    rows.forEach(row => {
      const hour = row.hour_slot;
      const minuteSlot = row.minute_slot; // 0 or 1
      const startMin = minuteSlot === 0 ? '00' : '30';
      const endMin = minuteSlot === 0 ? '29' : '59';
      const slotLabel = `${String(hour).padStart(2, '0')}:${startMin}-${String(hour).padStart(2, '0')}:${endMin}`;
      
      if (!slotData[slotLabel]) {
        slotData[slotLabel] = [];
      }
      
      slotData[slotLabel].push(row);
    });

    // Process each slot into arah summary
    const result = {};
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const startMin = minute === 0 ? '00' : '30';
        const endMin = minute === 0 ? '29' : '59';
        const slotLabel = `${String(hour).padStart(2, '0')}:${startMin}-${String(hour).padStart(2, '0')}:${endMin}`;
        
        const rowsForSlot = slotData[slotLabel] || [];
        result[slotLabel] = processRowsToArahSummary(rowsForSlot);
      }
    }

    return result;
  } catch (error) {
    console.error('[ERROR] getMasukKeluarDetailBy30Min:', error);
    throw error;
  }
};

// Get detailed masuk/keluar by arah with hourly intervals
VehicleDetailSummary.getMasukKeluarDetailByHour = async (simpangId, date) => {
  try {
    if (!simpangId) {
      throw new Error('simpang_id is required');
    }

    const dateRange = getDateFilterClause(date);

    // Single optimized query that groups by hour
    const query = `
      SELECT 
        HOUR(waktu) as hour_slot,
        dari_arah,
        ke_arah,
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
      WHERE ID_Simpang = ?
        AND waktu BETWEEN ? AND ?
      GROUP BY HOUR(waktu), dari_arah, ke_arah
      ORDER BY HOUR(waktu), dari_arah, ke_arah
    `;

    const [rows] = await db.execute(query, [
      simpangId,
      dateRange.startDateTime,
      dateRange.endDateTime
    ]);

    // Group results by hour slot
    const slotData = {};
    
    rows.forEach(row => {
      const hour = row.hour_slot;
      const hourLabel = `${String(hour).padStart(2, '0')}:00-${String(hour).padStart(2, '0')}:59`;
      
      if (!slotData[hourLabel]) {
        slotData[hourLabel] = [];
      }
      
      slotData[hourLabel].push(row);
    });

    // Process each hour into arah summary
    const result = {};
    for (let hour = 0; hour < 24; hour++) {
      const hourLabel = `${String(hour).padStart(2, '0')}:00-${String(hour).padStart(2, '0')}:59`;
      
      const rowsForHour = slotData[hourLabel] || [];
      result[hourLabel] = processRowsToArahSummary(rowsForHour);
    }

    return result;
  } catch (error) {
    console.error('[ERROR] getMasukKeluarDetailByHour:', error);
    throw error;
  }
};

module.exports = VehicleDetailSummary;
