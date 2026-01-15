// Tentukan status arus IN/OUT berdasarkan simpang dan arah
const getArusStatus = (simpang, dari_arah, ke_arah) => {
  const s = simpang?.toLowerCase();
  const dari = dari_arah?.toLowerCase();
  const ke = ke_arah?.toLowerCase();

  const statusMap = {
    'tempel': { in: 'utara', out: ['barat', 'selatan', 'timur'] },
    'prambanan': { in: 'timur', out: ['barat', 'selatan', 'utara'] },
    'piyungan': { in: 'timur', out: ['barat', 'selatan', 'utara'] },
    'glagah': { in: 'barat', out: ['timur', 'selatan', 'utara'] }
  };

  const config = statusMap[s];
  if (!config) return 'UNDEFINED';
  
  if (dari === config.in) return 'IN';
  if (ke === config.in && config.out.includes(dari)) return 'OUT';
  return 'UNDEFINED';
};

// Hitung total IN/OUT
const countArus = (data, simpangMap) => {
  let totalIN = 0, totalOUT = 0;
  data.forEach(item => {
    const status = getArusStatus(simpangMap[item.ID_Simpang], item.dari_arah, item.ke_arah);
    if (status === 'IN') totalIN++;
    if (status === 'OUT') totalOUT++;
  });
  return { totalIN, totalOUT };
};

// Waktu dalam sehari
const PERIODS = [
  { name: 'Dini Hari', start: '00:00', end: '05:59' },
  { name: 'Pagi', start: '06:00', end: '11:59' },
  { name: 'Siang', start: '12:00', end: '15:59' },
  { name: 'Sore', start: '16:00', end: '18:59' },
  { name: 'Malam', start: '19:00', end: '23:59' }
];

const VEHICLE_CODES = ['SM', 'MP', 'AUP', 'TR', 'BS', 'TS', 'TB', 'BB', 'GANDENG', 'KTB'];

// Konversi HH:MM ke menit
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// Konversi menit ke HH:MM
const fromMinutes = (min) => {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
};

// Buat slot waktu
const generateTimeSlots = (start, end, interval = 15) => {
  const slots = [];
  let t = toMinutes(start);
  const e = toMinutes(end);
  while (t < e) {
    slots.push({ slotStart: fromMinutes(t), slotEnd: fromMinutes(t + interval) });
    t += interval;
  }
  return slots;
};

// Hitung total kendaraan
const sum = (arr, field) => arr.reduce((acc, cur) => acc + (Number(cur[field]) || 0), 0);

// Ekstrak jam:menit dari waktu (string ISO atau Date)
const extractHour = (waktu) => {
  if (typeof waktu === 'string') {
    const timeMatch = waktu.match(/T(\d{2}):(\d{2}):|(\d{2}):(\d{2})/);
    if (timeMatch) {
      return timeMatch[1] 
        ? `${timeMatch[1]}:${timeMatch[2]}` 
        : `${timeMatch[3]}:${timeMatch[4]}`;
    }
    return new Date(waktu).toTimeString().slice(0, 5);
  }
  return waktu instanceof Date ? waktu.toTimeString().slice(0, 5) : '';
};

// Main: ambil periode dan slot dengan interval fleksibel
const getPeriodsAndSlots = (arusRows, interval = '15min', includedSubCodes = []) => {
  const intervalMap = { '5min': 5, '10min': 10, '15min': 15, '1h': 60, '60min': 60 };
  const intervalMinutes = intervalMap[interval?.toLowerCase()] || 15;

  // Tentukan kode yang akan digunakan untuk aggregation
  const codesUsed = includedSubCodes && includedSubCodes.length > 0 ? includedSubCodes : VEHICLE_CODES;

  return PERIODS.map(period => {
    const slots = generateTimeSlots(period.start, period.end, intervalMinutes);
    
    const timeSlots = slots.map(({ slotStart, slotEnd }) => {
      const slotData = arusRows.filter(row => {
        const jam = extractHour(row.waktu);
        return jam >= slotStart && jam < slotEnd;
      });

      // Hitung data hanya dari codes yang digunakan
      const data = {
        sm: sum(slotData, 'SM'),
        mp: sum(slotData, 'MP'),
        aup: sum(slotData, 'AUP'),
        tr: sum(slotData, 'TR'),
        bs: sum(slotData, 'BS'),
        ts: sum(slotData, 'TS'),
        bb: sum(slotData, 'BB'),
        tb: sum(slotData, 'TB'),
        gandengSemitrailer: sum(slotData, 'GANDENG'),
        ktb: sum(slotData, 'KTB'),
        total: codesUsed.reduce((acc, code) => acc + sum(slotData, code), 0)
      };

      return {
        time: `${slotStart} - ${slotEnd}`,
        status: slotData.length > 0 ? 1 : 0,
        data
      };
    });

    return { name: period.name, timeSlots };
  });
};

module.exports = {
  getArusStatus,
  countArus,
  getPeriodsAndSlots
};
