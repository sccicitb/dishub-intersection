// app/models/survey.model.js
const db = require('../config/db');

const getVehicleDataGrouped = async ({ cameraId, approach, direction, date }, includedSubCodes) => {
  let query = `SELECT waktu, ${includedSubCodes.join(', ')} FROM arus WHERE waktu IS NOT NULL`;
  const params = [];

  // Filter kamera, pendekatan, arah
  if (cameraId) {
    query += ` AND ID_Simpang = ?`;
    params.push(cameraId);
  }
  if (approach && approach.toLowerCase() !== 'semua') {
    query += ` AND dari_arah = ?`;
    params.push(approach);
  }
  if (direction && direction.toLowerCase() !== 'semua') {
    query += ` AND ke_arah = ?`;
    params.push(direction);
  }

  // === Filter waktu ===
  if (date) {
    query += ` AND waktu BETWEEN ? AND ?`;
    params.push(`${date} 00:00:00`, `${date} 23:59:59`);
  } else {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const start = `${year}-${month}-${day} 00:00:00`;

    let end = new Date(now);
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil((minutes + 1) / 15) * 15;
    if (roundedMinutes === 60) {
      end.setHours(end.getHours() + 1);
      end.setMinutes(0, 0, 0);
    } else {
      end.setMinutes(roundedMinutes, 0, 0);
    }
    const fmt = d => d.toISOString().replace('T', ' ').substring(0, 19);
    query += ` AND waktu BETWEEN ? AND ?`;
    params.push(start, fmt(end));
  }

  const rows = await db.query(query, params);

  // === Grouping dan agregasi sama seperti sebelumnya ===
  const periods = [
    { name: 'Malam', ranges: [['00:00', '05:00']] },
    { name: 'Pagi', ranges: [['05:00', '11:00']] },
    { name: 'Siang', ranges: [['11:00', '16:00']] },
    { name: 'Sore', ranges: [['16:00', '20:00']] },
    { name: 'Malam', ranges: [['20:00', '23:59']] }
  ];

  const grouped = {};

  for (const row of rows[0]) {
    const waktu = new Date(row.waktu);
    const jamMenit = waktu.toTimeString().slice(0, 5);

    // Tentukan period
    const period = periods.find(p =>
      p.ranges.some(([start, end]) => jamMenit >= start && jamMenit <= end)
    );
    if (!period) continue;
    const periodName = period.name;
    if (!grouped[periodName]) grouped[periodName] = [];

    // Hitung slot 15 menit
    const menit = waktu.getMinutes();
    const jam = waktu.getHours().toString().padStart(2, '0');
    const slotIdx = Math.floor(menit / 15);
    const intervalStart = `${jam}:${(slotIdx * 15).toString().padStart(2, '0')}`;
    let nextHour = jam;
    let intervalEndMinutes = (slotIdx + 1) * 15;
    if (intervalEndMinutes === 60) {
      intervalEndMinutes = '00';
      nextHour = (parseInt(jam, 10) + 1).toString().padStart(2, '0');
    }
    const intervalEnd = `${nextHour}:${intervalEndMinutes.toString().padStart(2, '0')}`;
    const timeLabel = `${intervalStart} - ${intervalEnd}`;

    // Akumulasi
    const dataEntry = {};
    let total = 0;
    for (const code of includedSubCodes) {
      const val = row[code] || 0;
      dataEntry[code] = val;
      total += val;
    }
    dataEntry.total = total;

    const existing = grouped[periodName].find(slot => slot.time === timeLabel);
    if (!existing) {
      grouped[periodName].push({
        time: timeLabel,
        status: 1,
        data: dataEntry
      });
    } else {
      for (const code of includedSubCodes) {
        existing.data[code] = (existing.data[code] || 0) + dataEntry[code];
      }
      existing.data.total += total;
    }
  }

  // Output format
  const vehicleData = Object.entries(grouped).map(([period, slots]) => ({
    period,
    timeSlots: slots.sort((a, b) => a.time.localeCompare(b.time))
  }));

  return { vehicleData };
};

const getArusBySimpangDate = async (simpang_id, date) => {
  const [rows] = await db.query(`SELECT * FROM arus WHERE ID_Simpang = ? AND DATE(waktu) = ?`, [simpang_id, date]);
  return rows;
};

module.exports = { getVehicleDataGrouped, getArusBySimpangDate };
