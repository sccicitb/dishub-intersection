const db = require("../config/db");
const simpangModel = require("./simpang.model");

const CityTraffic = function (data) {
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

// Simpang configuration with IN/OUT direction logic
const SIMPANG_CONFIG = {
  5: { // Tempel (Utara)
    name: 'Tempel',
    position: 'Utara',
    in_directions: ['south'],      // Masuk kota = ke Selatan
    out_directions: ['north']       // Keluar kota = ke Utara
  },
  2: { // Prambanan (Timur)
    name: 'Prambanan',
    position: 'Timur',
    in_directions: ['west'],        // Masuk kota = ke Barat
    out_directions: ['east']        // Keluar kota = ke Timur
  },
  4: { // Piyungan (Selatan)
    name: 'Piyungan',
    position: 'Selatan',
    in_directions: ['west', 'north'],   // Masuk kota = ke Barat/Utara
    out_directions: ['east', 'south']   // Keluar kota = ke Timur/Selatan
  },
  3: { // Glagah (Barat)
    name: 'Glagah',
    position: 'Barat',
    in_directions: ['east'],        // Masuk kota = ke Timur
    out_directions: ['west']        // Keluar kota = ke Barat
  }
};

// Helper function to generate time slots based on interval
const generateTimeSlots = (interval) => {
  const slots = [];
  let minutes = 0;

  const intervalMinutes = {
    "5min": 5,
    "15min": 15,
    "30min": 30,
    "1hour": 60
  };

  const step = intervalMinutes[interval] || 60;
  const totalMinutes = 24 * 60;

  while (minutes < totalMinutes) {
    const startHour = Math.floor(minutes / 60);
    const startMin = minutes % 60;
    const endMinutes = minutes + step;
    const endHour = Math.floor(endMinutes / 60) % 24;
    const endMin = endMinutes % 60;

    const label = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}-${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    slots.push({
      label: label,
      startHour: startHour,
      startMin: startMin,
      endHour: endHour,
      endMin: endMin
    });

    minutes = endMinutes;
  }

  return slots;
};

// Get city traffic summary (masuk/keluar kota) by interval for specific or all simpangs
CityTraffic.getCityTrafficSummary = async (simpangId, date, interval = '1hour') => {
  try {
    // Validate inputs
    if (!simpangId) {
      throw new Error('simpang_id is required');
    }

    if (!date) {
      throw new Error('date parameter is required in YYYY-MM-DD format');
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD format (e.g., 2026-01-29)');
    }

    // Validate interval
    const validIntervals = ['5min', '15min', '30min', '1hour'];
    if (!validIntervals.includes(interval)) {
      throw new Error(`Invalid interval. Use one of: ${validIntervals.join(', ')}`);
    }

    const startDateTime = `${date} 00:00:00`;
    const endDateTime = `${date} 23:59:59`;

    // Determine which simpangs to query
    let simpangsToQuery = [];
    let isAllSimpangs = false;

    if (simpangId === 'semua' || simpangId === '0') {
      // Query all 4 simpangs
      simpangsToQuery = [2, 3, 4, 5]; // Prambanan, Glagah, Piyungan, Tempel
      isAllSimpangs = true;
    } else {
      const sid = parseInt(simpangId);
      if (!SIMPANG_CONFIG[sid]) {
        throw new Error(`Simpang with id ${simpangId} not configured for city traffic`);
      }
      simpangsToQuery = [sid];
    }

    // Generate time slots
    const slots = generateTimeSlots(interval);

    // Initialize result structure
    const result = {};
    slots.forEach(slot => {
      result[slot.label] = {
        vehicles: {}
      };

      // Initialize vehicle type counters
      Object.keys(VEHICLE_TYPES).forEach(type => {
        result[slot.label].vehicles[type] = {
          IN: 0,
          OUT: 0,
          label: VEHICLE_TYPES[type]
        };
      });
      
      // Add total counter
      result[slot.label].vehicles.TOTAL = {
        IN: 0,
        OUT: 0,
        label: "Total Semua Kendaraan"
      };
    });

    // Query and aggregate data for each simpang
    for (const sid of simpangsToQuery) {
      const config = SIMPANG_CONFIG[sid];
      const simpang = await simpangModel.getSimpangById(sid);
      
      if (!simpang) {
        console.warn(`Simpang ${sid} not found in database, skipping...`);
        continue;
      }

      // Query all traffic data for this simpang
      // OPTIMIZED: Aggregated by minute to reduce row count
      const query = `
        SELECT 
          dari_arah,
          ke_arah,
          HOUR(waktu) as hour,
          MINUTE(waktu) as minute,
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
          AND waktu >= ?
          AND waktu <= ?
        GROUP BY dari_arah, ke_arah, HOUR(waktu), MINUTE(waktu)
        ORDER BY hour, minute
      `;

      const [rows] = await db.execute(query, [sid, startDateTime, endDateTime]);

      // Process rows into time slots
      rows.forEach(row => {
        const recordMinutes = row.hour * 60 + row.minute;
        
        // Find which slot this record belongs to
        for (const slot of slots) {
          const slotStartMinutes = slot.startHour * 60 + slot.startMin;
          const slotEndMinutes = slot.endHour * 60 + slot.endMin;
          
          // Handle slot that wraps to next day
          let isInSlot = false;
          if (slotEndMinutes > slotStartMinutes) {
            isInSlot = recordMinutes >= slotStartMinutes && recordMinutes < slotEndMinutes;
          } else {
            isInSlot = recordMinutes >= slotStartMinutes || recordMinutes < slotEndMinutes;
          }

          if (isInSlot) {
            const ke = row.ke_arah;

            // Check if this is IN (masuk kota) or OUT (keluar kota) based on simpang config
            if (ke && config.in_directions.includes(ke)) {
              // This is IN (masuk kota)
              Object.keys(VEHICLE_TYPES).forEach(type => {
                const count = parseInt(row[type]) || 0;
                result[slot.label].vehicles[type].IN += count;
                result[slot.label].vehicles.TOTAL.IN += count;
              });
            } else if (ke && config.out_directions.includes(ke)) {
              // This is OUT (keluar kota)
              Object.keys(VEHICLE_TYPES).forEach(type => {
                const count = parseInt(row[type]) || 0;
                result[slot.label].vehicles[type].OUT += count;
                result[slot.label].vehicles.TOTAL.OUT += count;
              });
            }

            break;
          }
        }
      });
    }

    // Format result
    const formattedResult = {
      simpang_id: isAllSimpangs ? 'semua' : simpangId,
      simpang_name: isAllSimpangs ? 'Semua Simpang DIY' : SIMPANG_CONFIG[parseInt(simpangId)]?.name || 'Unknown',
      simpang_position: isAllSimpangs ? 'Semua' : SIMPANG_CONFIG[parseInt(simpangId)]?.position || 'Unknown',
      date: date,
      interval: interval,
      slot_count: slots.length,
      description: isAllSimpangs 
        ? 'Agregat masuk/keluar kota dari 4 simpang: Tempel (Utara), Prambanan (Timur), Piyungan (Selatan), Glagah (Barat)'
        : `IN (Masuk Kota) = ${SIMPANG_CONFIG[parseInt(simpangId)]?.in_directions.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join('/')}; OUT (Keluar Kota) = ${SIMPANG_CONFIG[parseInt(simpangId)]?.out_directions.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join('/')}`,
      slots: result
    };

    return formattedResult;
  } catch (error) {
    console.error('[ERROR] getCityTrafficSummary:', error);
    throw error;
  }
};

module.exports = CityTraffic;
