// Tambah 0 di depan jika kurang dari 10
const pad = (n) => (n < 10 ? '0' : '') + n.toString();

// Format waktu HH:MM
const formatTime = (date) => pad(date.getHours()) + ':' + pad(date.getMinutes());

// Parse tanggal dan waktu
const parseDate = (dateStr, timeStr = '00:00') => new Date(dateStr + 'T' + timeStr + ':00');

// Ambil interval waktu dengan jenis (5min, 15min, 1h)
const getIntervals = (date, intervalType, isToday, now = null) => {
  const intervals = [];
  const start = parseDate(date, '00:00');
  const intervalMap = { '5min': 5, '10min': 10, '15min': 15, '1h': 60, '60min': 60, '1hour': 60 };
  const intervalMinutes = intervalMap[intervalType?.toLowerCase()] || 15;

  let end;
  if (isToday) {
    now = now || new Date();
    const totalMin = Math.ceil((now.getHours() * 60 + now.getMinutes() + 1) / intervalMinutes) * intervalMinutes;
    end = new Date(start);
    end.setHours(Math.floor(totalMin / 60), totalMin % 60, 0, 0);
  } else {
    end = new Date(parseDate(date, '23:59'));
    end.setTime(end.getTime() + 60 * 1000);
  }
  
  let current = new Date(start);
  while (current < end) {
    let next = new Date(current);
    next.setMinutes(next.getMinutes() + intervalMinutes);
    
    if (next > end) break;
    
    intervals.push({
      label: formatTime(current),
      start: new Date(current),
      end: new Date(next)
    });
    current = next;
  }
  return intervals;
};

const PERIODS = [
  { name: 'Pagi', start: '06:00', end: '11:59' },
  { name: 'Siang', start: '12:00', end: '15:59' },
  { name: 'Sore', start: '16:00', end: '18:59' },
  { name: 'Malam', start: '19:00', end: '23:59' }
];

function getPeriodLabel(hourMinute) {
  for (const p of PERIODS) {
    if (hourMinute >= p.start && hourMinute <= p.end) return p.name;
  }
  return 'Malam';
}

module.exports = { getIntervals, getPeriodLabel, PERIODS, parseDate, formatTime, pad };
