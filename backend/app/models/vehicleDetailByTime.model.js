const db = require("../config/db");
const simpangModel = require("./simpang.model");

const VehicleDetailByTime = function (data) {
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

// Time period categories
const TIME_PERIODS = {
  "Dini Hari": { start: 0, end: 6 },
  "Pagi Hari": { start: 6, end: 12 },
  "Siang Hari": { start: 12, end: 15 },
  "Sore Hari": { start: 15, end: 18 },
  "Malam Hari": { start: 18, end: 24 }
};

// Helper function to get time period name by hour
const getTimePeriodByHour = (hour) => {
  for (const [period, range] of Object.entries(TIME_PERIODS)) {
    if (hour >= range.start && hour < range.end) {
      return period;
    }
  }
  return "Dini Hari"; // Default if somehow out of range
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
    const timePeriod = getTimePeriodByHour(startHour);

    slots.push({
      label: label,
      startHour: startHour,
      startMin: startMin,
      endHour: endHour,
      endMin: endMin,
      timePeriod: timePeriod
    });

    minutes = endMinutes;
  }

  return slots;
};
// Get detailed masuk/keluar by time intervals for specific simpang
VehicleDetailByTime.getMasukKeluarDetailByTime = async (simpangId, date, interval = '1hour', callback) => {
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
      throw new Error('Invalid date format. Use YYYY-MM-DD format (e.g., 2026-01-05)');
    }

    // Validate interval
    const validIntervals = ['5min', '15min', '30min', '1hour'];
    if (!validIntervals.includes(interval)) {
      throw new Error(`Invalid interval. Use one of: ${validIntervals.join(', ')}`);
    }

    // Check if simpang exists
    const simpang = await simpangModel.getSimpangById(simpangId);
    if (!simpang) {
      throw new Error(`Simpang with id ${simpangId} not found`);
    }

    // Use local time strings assuming DB stores in +07:00 timezone
    const startDateTime = `${date} 00:00:00`;
    const endDateTime = `${date} 23:59:59`;

    // Query all traffic data for the day
    const query = `
      SELECT 
        dari_arah,
        ke_arah,
        HOUR(waktu) as hour,
        MINUTE(waktu) as minute,
        SM, MP, AUP, TR, BS, TS, TB, BB, GANDENG, KTB
      FROM arus
      WHERE ID_Simpang = ?
        AND waktu >= ?
        AND waktu <= ?
      ORDER BY waktu ASC
    `;

    const [rows] = await db.execute(query, [
      simpangId,
      startDateTime,
      endDateTime
    ]);

    // Generate time slots
    const slots = generateTimeSlots(interval);

    // Initialize result structure
    const result = {};
    slots.forEach(slot => {
      result[slot.label] = {
        time_period: slot.timePeriod,
        data: {
          'north': { IN: {}, OUT: {} },
          'south': { IN: {}, OUT: {} },
          'east': { IN: {}, OUT: {} },
          'west': { IN: {}, OUT: {} }
        }
      };

      // Initialize vehicle type counters
      Object.keys(result[slot.label].data).forEach(arah => {
        ['IN', 'OUT'].forEach(dir => {
          Object.keys(VEHICLE_TYPES).forEach(type => {
            result[slot.label].data[arah][dir][type] = 0;
          });
          result[slot.label].data[arah][dir].total = 0;
        });
      });
    });

    // Group rows into time slots
    rows.forEach(row => {
      const recordMinutes = row.hour * 60 + row.minute;
      
      // Find which slot this record belongs to
      for (const slot of slots) {
        const slotStartMinutes = slot.startHour * 60 + slot.startMin;
        const slotEndMinutes = slot.endHour * 60 + slot.endMin;
        
        // Handle slot that wraps to next day (e.g., 23:30-00:00)
        let isInSlot = false;
        if (slotEndMinutes > slotStartMinutes) {
          isInSlot = recordMinutes >= slotStartMinutes && recordMinutes < slotEndMinutes;
        } else {
          isInSlot = recordMinutes >= slotStartMinutes || recordMinutes < slotEndMinutes;
        }

        if (isInSlot) {
          const dari = row.dari_arah;
          const ke = row.ke_arah;

          // Determine target arah and direction
          let targetArah = dari;
          let direction = 'IN';

          if (['north', 'south', 'east', 'west'].includes(ke)) {
            targetArah = ke;
            direction = 'OUT';
          }

          // Add vehicle counts
          if (result[slot.label].data[targetArah] && result[slot.label].data[targetArah][direction]) {
            Object.keys(VEHICLE_TYPES).forEach(type => {
              const count = parseInt(row[type]) || 0;
              result[slot.label].data[targetArah][direction][type] += count;
              result[slot.label].data[targetArah][direction].total += count;
            });
          }

          break;
        }
      }
    });

    // Format result
    const formattedResult = {
      simpang_id: simpangId,
      date: date,
      interval: interval,
      time_periods: TIME_PERIODS,
      slot_count: slots.length,
      slots: result
    };

    callback(null, formattedResult);
  } catch (error) {
    console.error('[ERROR] getMasukKeluarDetailByTime:', error);
    callback(error);
  }
};

module.exports = VehicleDetailByTime;
