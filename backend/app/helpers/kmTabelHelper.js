/**
 * KM Tabel Helper Functions
 * Supporting the KM Tabel API implementation
 * Based on traffic flow analysis results from Phase 1, Step 1.1
 */

/**
 * Determines if traffic is 'masuk' (incoming) based on simpang and direction
 * Based on volume analysis from traffic flow patterns
 */
function isTrafficMasuk(simpang_id, dari_arah) {
  const masukRules = {
    2: ['east', 'south'],     // East dominant, South secondary
    3: ['south'],             // South dominant only
    4: ['west', 'north'],     // West and North balanced
    5: ['west', 'south']      // West dominant, South secondary
  };

  return masukRules[simpang_id]?.includes(dari_arah) || false;
}

/**
 * Maps database vehicle types to KM Tabel format
 * Returns object with sm, mp, ks, ktb counts
 */
function mapVehicleTypes(vehicleData) {
  return {
    sm: vehicleData.SM || 0,                                    // Sepeda Motor
    mp: vehicleData.MP || 0,                                    // Mobil Penumpang
    ks: (vehicleData.BS || 0) + (vehicleData.TS || 0),         // Kendaraan Sedang (Bus Sedang + Truck Sedang)
    ktb: (vehicleData.BB || 0) + (vehicleData.TB || 0) + 
         (vehicleData.GANDENG || 0) + (vehicleData.KTB || 0)   // Kendaraan Berat
  };
}

/**
 * Calculates total vehicles from KM Tabel format
 */
function calculateTotalVehicles(kmVehicleData) {
  return kmVehicleData.sm + kmVehicleData.mp + kmVehicleData.ks + kmVehicleData.ktb;
}

/**
 * Determines time period based on hour (0-23)
 * Returns period name and index
 */
function getTimePeriod(hour) {
  const periods = [
    { name: 'Dini Hari', start: 0, end: 4, index: 0 },
    { name: 'Pagi', start: 5, end: 9, index: 1 },
    { name: 'Siang', start: 10, end: 14, index: 2 },
    { name: 'Sore', start: 15, end: 17, index: 3 },
    { name: 'Malam', start: 18, end: 23, index: 4 }
  ];

  for (const period of periods) {
    if (hour >= period.start && hour <= period.end) {
      return {
        name: period.name,
        index: period.index,
        start: period.start,
        end: period.end
      };
    }
  }

  // Fallback for invalid hour
  return periods[0];
}

/**
 * Generates time slots for a specific interval
 * Returns array of time slot objects
 */
function generateTimeSlots(interval = '15min') {
  const slots = [];
  
  if (interval === '15min') {
    // Generate 15-minute intervals for 24 hours
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMinute = minute + 15;
        const endHour = endMinute >= 60 ? hour + 1 : hour;
        const adjustedEndMinute = endMinute >= 60 ? endMinute - 60 : endMinute;
        const endTime = `${(endHour % 24).toString().padStart(2, '0')}:${adjustedEndMinute.toString().padStart(2, '0')}`;
        
        slots.push({
          time: `${startTime} - ${endTime}`,
          status: 1,
          hour: hour,
          minute: minute,
          masukSimpang: { sm: 0, mp: 0, ks: 0, ktb: 0, total: 0 },
          keluarSimpang: { sm: 0, mp: 0, ks: 0, ktb: 0, total: 0 }
        });
      }
    }
  } else if (interval === '1h') {
    // Generate 1-hour intervals for 24 hours
    for (let hour = 0; hour < 24; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${((hour + 1) % 24).toString().padStart(2, '0')}:00`;
      
      slots.push({
        time: `${startTime} - ${endTime}`,
        status: 1,
        hour: hour,
        minute: 0,
        masukSimpang: { sm: 0, mp: 0, ks: 0, ktb: 0, total: 0 },
        keluarSimpang: { sm: 0, mp: 0, ks: 0, ktb: 0, total: 0 }
      });
    }
  }
  
  return slots;
}

/**
 * Groups time slots by periods for KM Tabel format
 */
function groupSlotsByPeriods(timeSlots) {
  const periods = [
    { name: 'Dini Hari', start: 0, end: 4 },
    { name: 'Pagi', start: 5, end: 9 },
    { name: 'Siang', start: 10, end: 14 },
    { name: 'Sore', start: 15, end: 17 },
    { name: 'Malam', start: 18, end: 23 }
  ];

  return periods.map(period => ({
    period: period.name,
    timeSlots: timeSlots.filter(slot => 
      slot.hour >= period.start && slot.hour <= period.end
    )
  }));
}

/**
 * Validates KM Tabel API parameters
 */
function validateKmTabelParams(params) {
  const errors = [];
  
  // Required parameters
  if (!params.simpang_id) {
    errors.push('simpang_id is required');
  } else if (![2, 3, 4, 5].includes(parseInt(params.simpang_id))) {
    errors.push('simpang_id must be one of: 2, 3, 4, 5');
  }
  
  if (!params.date) {
    errors.push('date is required');
  } else {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(params.date)) {
      errors.push('date must be in YYYY-MM-DD format');
    }
  }
  
  // Optional parameters validation
  if (params.interval && !['15min', '1h'].includes(params.interval)) {
    errors.push('interval must be either "15min" or "1h"');
  }
  
  if (params.approach && !['north', 'south', 'east', 'west', 'utara', 'selatan', 'timur', 'barat', 'semua'].includes(params.approach)) {
    errors.push('approach must be one of: north, south, east, west, utara, selatan, timur, barat, semua');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Creates empty KM Tabel structure
 */
function createEmptyKmTabelStructure(interval = '15min') {
  const timeSlots = generateTimeSlots(interval);
  return {
    vehicleData: groupSlotsByPeriods(timeSlots)
  };
}

/**
 * Formats date for MySQL queries
 */
function formatDateForQuery(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

/**
 * Gets SQL condition for time slot filtering
 */
function getTimeSlotCondition(hour, minute, interval) {
  if (interval === '1h') {
    return `HOUR(waktu) = ${hour}`;
  } else {
    // 15min interval
    const startMinute = minute;
    const endMinute = minute + 15;
    
    return `HOUR(waktu) = ${hour} AND MINUTE(waktu) >= ${startMinute} AND MINUTE(waktu) < ${endMinute}`;
  }
}

/**
 * Aggregates vehicle data for specific time slot
 */
function aggregateVehicleData(vehicles) {
  const aggregated = { sm: 0, mp: 0, ks: 0, ktb: 0 };
  
  vehicles.forEach(vehicle => {
    const mapped = mapVehicleTypes(vehicle);
    aggregated.sm += mapped.sm;
    aggregated.mp += mapped.mp;
    aggregated.ks += mapped.ks;
    aggregated.ktb += mapped.ktb;
  });
  
  aggregated.total = calculateTotalVehicles(aggregated);
  return aggregated;
}

/**
 * Gets masuk/keluar rules for all simpangs
 */
function getAllTrafficRules() {
  return {
    2: {
      masuk: ['east', 'south'],
      keluar: ['west', 'north']
    },
    3: {
      masuk: ['south'],
      keluar: ['east', 'west', 'north']
    },
    4: {
      masuk: ['west', 'north'],
      keluar: ['east', 'south']
    },
    5: {
      masuk: ['west', 'south'],
      keluar: ['east', 'north']
    }
  };
}

module.exports = {
  isTrafficMasuk,
  mapVehicleTypes,
  calculateTotalVehicles,
  getTimePeriod,
  generateTimeSlots,
  groupSlotsByPeriods,
  validateKmTabelParams,
  createEmptyKmTabelStructure,
  formatDateForQuery,
  getTimeSlotCondition,
  aggregateVehicleData,
  getAllTrafficRules
}; 