// app/h
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

  function generateTimeSlots(start, end) {
    let slots = [];
    let t = toMinutes(start);
    let e = toMinutes(end);
    while (t < e) {
      let slotStart = fromMinutes(t);
      let slotEnd = fromMinutes(t + 15);
      slots.push({ slotStart, slotEnd });
      t += 15;
    }
    return slots;
  }

  function toMinutes(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }
  function fromMinutes(min) {
    return `${String(Math.floor(min/60)).padStart(2,'0')}:${String(min%60).padStart(2,'0')}`;
  }
  // Helper: agregasi sesuai sampleVehicleData.json
  function getPeriodsAndSlots(arusRows) {
    return PERIODS.map(period => {
      const slots = generateTimeSlots(period.start, period.end);
      const timeSlots = slots.map(({ slotStart, slotEnd }) => {
        const slotData = arusRows.filter(row => {
          const jam = row.waktu.toTimeString().slice(0,5);
          return jam >= slotStart && jam < slotEnd;
        });

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
          gandengSemitrailer: sum(slotData, 'GANDEG'),
          ktb: sum(slotData, 'KTB'),
          total: slotData.reduce((acc, row) =>
            acc + row.SM + row.MP + row.AUP + row.TR + row.BS +
            row.TS + row.BB + row.TB + row.GANDEG + row.KTB, 0)
        };
        const status = slotData.length > 0 ? 1 : 0;

        return {
          time: `${slotStart} - ${slotEnd}`,
          status,
          data
        };
      });
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
  