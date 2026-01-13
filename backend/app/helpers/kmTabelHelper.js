// Helper KM Tabel

const TIME_PERIODS = [
  { name: 'Dini Hari', start: 0, end: 4 },
  { name: 'Pagi', start: 5, end: 9 },
  { name: 'Siang', start: 10, end: 14 },
  { name: 'Sore', start: 15, end: 17 },
  { name: 'Malam', start: 18, end: 23 }
];

// Konversi tipe kendaraan ke format KM Tabel
function mapVehicleTypes(data) {
  return {
    sm: Number(data.SM) || 0,
    mp: Number(data.MP) || 0,
    ks: (Number(data.BS) || 0) + (Number(data.TS) || 0),
    ktb: (Number(data.BB) || 0) + (Number(data.TB) || 0) + 
         (Number(data.GANDENG) || 0) + (Number(data.KTB) || 0)
  };
}

// Total kendaraan dari format KM Tabel
function calculateTotalVehicles(kmData) {
  return kmData.sm + kmData.mp + kmData.ks + kmData.ktb;
}

// Cari periode jam (0-23)
function getTimePeriod(hour) {
  const period = TIME_PERIODS.find(p => hour >= p.start && hour <= p.end);
  return period || TIME_PERIODS[0];
}

// Buat slot waktu per interval (5min, 10min, 15min, 1hour)
function generateTimeSlots(interval = '15min') {
  const slots = [];
  const minuteMap = { '5min': 5, '10min': 10, '15min': 15, '1h': 60, '60min': 60 };
  const minutes = minuteMap[interval] || 15;
  
  if (minutes === 60) {
    // Slot per jam
    for (let h = 0; h < 24; h++) {
      slots.push({
        time: `${String(h).padStart(2, '0')}:00 - ${String((h + 1) % 24).padStart(2, '0')}:00`,
        hour: h,
        minute: 0,
        masukSimpang: { sm: 0, mp: 0, ks: 0, ktb: 0, total: 0 },
        keluarSimpang: { sm: 0, mp: 0, ks: 0, ktb: 0, total: 0 }
      });
    }
  } else {
    // Slot per menit (5, 10, 15)
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += minutes) {
        const endM = m + minutes;
        const [eh, em] = endM >= 60 ? [(h + 1) % 24, endM - 60] : [h, endM];
        slots.push({
          time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} - ${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`,
          hour: h,
          minute: m,
          masukSimpang: { sm: 0, mp: 0, ks: 0, ktb: 0, total: 0 },
          keluarSimpang: { sm: 0, mp: 0, ks: 0, ktb: 0, total: 0 }
        });
      }
    }
  }
  return slots;
}

// Kelompokkan slot berdasarkan periode waktu
function groupSlotsByPeriods(timeSlots) {
  return TIME_PERIODS.map(period => ({
    period: period.name,
    timeSlots: timeSlots.filter(slot => slot.hour >= period.start && slot.hour <= period.end)
  }));
}

// Validasi parameter KM Tabel
function validateKmTabelParams(params) {
  const errors = [];
  
  if (!params.simpang_id) errors.push('simpang_id diperlukan');
  else if (![2, 3, 4, 5].includes(parseInt(params.simpang_id))) 
    errors.push('simpang_id harus: 2, 3, 4, atau 5');
  
  if (!params.date) errors.push('date diperlukan (YYYY-MM-DD)');
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) 
    errors.push('date format YYYY-MM-DD');
  
  if (params.interval && !['5min', '10min', '15min', '1h', '60min'].includes(params.interval))
    errors.push('interval: 5min, 10min, 15min, 1h, atau 60min');
  
  if (params.approach && !['north', 'south', 'east', 'west', 'utara', 'selatan', 'timur', 'barat', 'semua'].includes(params.approach))
    errors.push('approach tidak valid');
  
  return { isValid: errors.length === 0, errors };
}

// Struktur KM Tabel kosong
function createEmptyKmTabelStructure(interval = '15min') {
  return { vehicleData: groupSlotsByPeriods(generateTimeSlots(interval)) };
}

// Format tanggal untuk query SQL
function formatDateForQuery(dateString) {
  return new Date(dateString).toISOString().split('T')[0];
}


/**
 * Gets SQL condition for time slot filtering
 */
function getTimeSlotCondition(hour, minute, interval) {
  if (interval === '1h' || interval === '60min') {
    return `HOUR(waktu) = ${hour}`;
  } else {
    // Minute-based intervals (5min, 10min, 15min)
    let minuteIncrement;
    switch (interval) {
      case '5min':
        minuteIncrement = 5;
        break;
      case '10min':
        minuteIncrement = 10;
        break;
      case '15min':
        minuteIncrement = 15;
        break;
      default:
        minuteIncrement = 15;
    }
    
    const startMinute = minute;
    const endMinute = minute + minuteIncrement;
    
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

// REMOVED: getAllTrafficRules function - replaced with dynamic approach in survey.model.js

module.exports = {
  // Utility functions (still needed)
  mapVehicleTypes,
  calculateTotalVehicles,
  getTimePeriod,
  generateTimeSlots,
  groupSlotsByPeriods,
  validateKmTabelParams,
  createEmptyKmTabelStructure,
  formatDateForQuery,
  getTimeSlotCondition,
  aggregateVehicleData
  
  // REMOVED: isTrafficMasuk, getAllTrafficRules - replaced with dynamic approach
}; 
