function pad(n) {
  return (n < 10 ? '0' : '') + n.toString();
}

function formatTime(date) {
  return pad(date.getHours()) + ':' + pad(date.getMinutes());
}

function parseDate(dateStr, timeStr = '00:00') {
  return new Date(dateStr + 'T' + timeStr + ':00');
}

function getIntervals(date, intervalType, isToday, now = null) {
  const intervals = [];
  const start = parseDate(date, '00:00');
  let end;

  if (isToday) {
    now = now || new Date();
    const nowHour = now.getHours();
    const nowMinute = now.getMinutes();
    if (intervalType === '15min') {
      let minute = Math.ceil((nowMinute + 1) / 15) * 15;
      let hour = nowHour;
      if (minute === 60) {
        hour += 1;
        minute = 0;
      }
      end = new Date(now);
      end.setHours(hour);
      end.setMinutes(minute);
      end.setSeconds(0);
      end.setMilliseconds(0);
    } else {
      let hour = nowHour + 1;
      end = new Date(now);
      end.setHours(hour);
      end.setMinutes(0);
      end.setSeconds(0);
      end.setMilliseconds(0);
    }
  } else {
    // FULL DAY PATCH: sampai 24:00, tapi agar tidak over-extend, set ke 23:59:59 dan stop sebelum next>24:00
    end = parseDate(date, '23:59');
    end.setMinutes(59, 59, 999);
    end = new Date(end.getTime() + 60 * 1000); // 24:00
  }
  let current = new Date(start);
  while (current < end) {
    let next = new Date(current);
    if (intervalType === '15min') {
      next.setMinutes(current.getMinutes() + 15);
    } else {
      next.setHours(current.getHours() + 1);
    }
    if (next > end) break; // PATCH: stop kalau next lebih dari end
    intervals.push({
      label: formatTime(current),
      start: new Date(current),
      end: new Date(next)
    });
    current = next;
  }
  return intervals;
}

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
