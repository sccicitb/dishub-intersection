function getArusStatus(simpang, dari_arah, ke_arah) {
  const s = simpang?.toLowerCase();
  const dari = dari_arah?.toLowerCase();
  const ke = ke_arah?.toLowerCase();

  if (s === 'tempel') {
    if (dari === 'utara') return 'IN';
    if (ke === 'utara' && ['barat', 'selatan', 'timur'].includes(dari)) return 'OUT';
  }

  if (s === 'prambanan') {
    if (dari === 'timur') return 'IN';
    if (ke === 'timur' && ['barat', 'selatan', 'utara'].includes(dari)) return 'OUT';
  }

  if (s === 'piyungan') {
    if (dari === 'timur') return 'IN';
    if (ke === 'timur' && ['barat', 'selatan', 'utara'].includes(dari)) return 'OUT';
  }

  if (s === 'glagah') {
    if (dari === 'barat') return 'IN';
    if (ke === 'barat' && ['timur', 'selatan', 'utara'].includes(dari)) return 'OUT';
  }

  return 'UNDEFINED';
}

function countArus(data, simpangMap) {
  let totalIN = 0;
  let totalOUT = 0;

  data.forEach((item) => {
    const simpang = simpangMap[item.ID_Simpang]?.toLowerCase();
    const status = getArusStatus(simpang, item.dari_arah, item.ke_arah);

    if (status === 'IN') totalIN++;
    if (status === 'OUT') totalOUT++;
  });

  return { totalIN, totalOUT };
}

const PERIODS = [
  { name: 'Pagi', start: '06:00', end: '11:59' },
  { name: 'Siang', start: '12:00', end: '15:59' },
  { name: 'Sore', start: '16:00', end: '18:59' },
  { name: 'Malam', start: '19:00', end: '23:59' }
];

// generateTimeSlots support interval (minutes: 15/60)
function generateTimeSlots(start, end, interval = 15) {
  let slots = [];
  let t = toMinutes(start);
  let e = toMinutes(end);
  while (t < e) {
    let slotStart = fromMinutes(t);
    let slotEnd = fromMinutes(t + interval);
    slots.push({ slotStart, slotEnd });
    t += interval;
  }
  return slots;
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function fromMinutes(min) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

// Main helper: interval = '5min' | '10min' | '15min' | '1h' | '60min'
// vehicleCodes = optional array of vehicle code columns, defaults to standard columns
function getPeriodsAndSlots(arusRows, interval = '15min', vehicleCodes = null) {
  let intervalMinutes;
  
  // Determine interval in minutes based on input
  switch (interval.toLowerCase()) {
    case '5min':
      intervalMinutes = 5;
      break;
    case '10min':
      intervalMinutes = 10;
      break;
    case '15min':
      intervalMinutes = 15;
      break;
    case '1h':
    case '60min':
      intervalMinutes = 60;
      break;
    default:
      intervalMinutes = 15; // fallback to 15min
  }

  // Default vehicle codes if not provided
  const VEHICLE_CODES = vehicleCodes || ['SM', 'MP', 'AUP', 'TR', 'BS', 'TS', 'TB', 'BB', 'GANDENG', 'KTB'];
  console.log(`[getPeriodsAndSlots] START: interval=${interval} (${intervalMinutes}min), rows=${arusRows.length}, vehicleCodes=${VEHICLE_CODES.join(',')}`);

  return PERIODS.map(period => {
    const slots = generateTimeSlots(period.start, period.end, intervalMinutes);
    let periodTotalVehicles = 0;
    let slotDebugLogged = false;
    
    const timeSlots = slots.map(({ slotStart, slotEnd }) => {
      const slotData = arusRows.filter(row => {
        // pastikan row.waktu Date/Datetime object
        let jam;
        if (typeof row.waktu === 'string') {
          // kadang string ISO, kadang Date
          const dateObj = new Date(row.waktu);
          // IMPORTANT: Handle timezone! Use local time from ISO string
          // Extract time part from ISO string: "2025-12-16T08:24:14.000Z" -> "08:24"
          const isoStr = row.waktu;
          const timeMatch = isoStr.match(/T(\d{2}):(\d{2}):/);
          if (timeMatch) {
            jam = `${timeMatch[1]}:${timeMatch[2]}`;
          } else {
            jam = dateObj.toTimeString().slice(0, 5);
          }
        } else if (row.waktu instanceof Date) {
          jam = row.waktu.toTimeString().slice(0, 5);
        } else {
          // Fallback for other formats
          console.warn('Unexpected waktu format:', row.waktu, typeof row.waktu);
          return false;
        }
        const inSlot = jam >= slotStart && jam < slotEnd;
        
        // Debug log untuk slot pertama
        if (!slotDebugLogged && slotStart === '06:00' && period.name === 'Pagi') {
          console.log(`[DEBUG] Sample row waktu: ${row.waktu}, parsed jam: ${jam}, slot: ${slotStart}-${slotEnd}, inSlot: ${inSlot}`);
          slotDebugLogged = true;
        }
        
        return inSlot;
      });

      // Dynamically build data object based on available columns
      const data = {
        sm: sum(slotData, 'SM'),
        mp: sum(slotData, 'MP'),
        aup: sum(slotData, 'AUP'),
        trMp: sum(slotData, 'MP'), // Atur jika ada field sendiri
        tr: sum(slotData, 'TR'),
        bs: sum(slotData, 'BS'),
        ts: sum(slotData, 'TS'),
        bb: sum(slotData, 'BB'),
        tb: sum(slotData, 'TB'),
        gandengSemitrailer: sum(slotData, 'GANDENG'),
        ktb: sum(slotData, 'KTB'),
        // Calculate total from all available vehicle codes
        total: slotData.reduce((acc, row) => {
          let rowTotal = 0;
          for (const code of VEHICLE_CODES) {
            rowTotal += Number(row[code]) || 0;
          }
          return acc + rowTotal;
        }, 0)
      };
      const status = slotData.length > 0 ? 1 : 0;
      
      // Log untuk slot dengan data
      if (data.total > 0) {
        console.log(`[getPeriodsAndSlots] ${period.name} ${slotStart}-${slotEnd}: ${slotData.length} rows, total=${data.total}, mp=${data.mp}, sm=${data.sm}`);
      }
      periodTotalVehicles += data.total;

      return {
        time: `${slotStart} - ${slotEnd}`,
        status,
        data
      };
    });
    console.log(`[getPeriodsAndSlots] ✓ ${period.name}: totalVehicles=${periodTotalVehicles}`);
    
    return {
      name: period.name,
      timeSlots
    };
  });
}

function sum(arr, field) {
  return arr.reduce((acc, cur) => acc + (Number(cur[field]) || 0), 0);
}

module.exports = {
  getArusStatus,
  countArus,
  getPeriodsAndSlots
};
