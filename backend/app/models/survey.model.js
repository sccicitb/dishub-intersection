const db = require('../config/db');
const { getPeriodsAndSlots } = require('../helpers/arus');

const getVehicleDataGrouped = async ({ cameraId, approach, direction, date }, includedSubCodes, interval = '15min') => {
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
    // default round up to 15min slot (bisa juga 1h, tinggal ubah logic)
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

  const [rows] = await db.query(query, params);

  // DELEGATE GROUPING/AGGREGATION TO HELPER, pass interval
  const vehicleData = getPeriodsAndSlots(rows, interval).map(period => ({
    period: period.name,
    timeSlots: period.timeSlots
  }));

  return { vehicleData };
};

const getArusBySimpangDate = async (simpang_id, date) => {
  const [rows] = await db.query(`SELECT * FROM arus WHERE ID_Simpang = ? AND DATE(waktu) = ?`, [simpang_id, date]);
  return rows;
};

const getArusSummaryByInterval = async (ID_Simpang, dbSubCodes, start, end) => {
  const selectFields = dbSubCodes.map(code => `SUM(\`${code}\`) AS \`${code}\``).join(', ');
  const sql = `
    SELECT dari_arah, ${selectFields}
    FROM arus
    WHERE ID_Simpang = ?
      AND waktu >= ? AND waktu < ?
    GROUP BY dari_arah
  `;
  const [rows] = await db.query(sql, [ID_Simpang, start, end]);
  return rows;
};

const getSumForCell = async (ID_Simpang, dari_arah, ke_arah, jenis, date) => {
  // date: 'YYYY-MM-DD'
  const sql = `
    SELECT SUM(\`${jenis}\`) AS total
    FROM arus
    WHERE ID_Simpang = ?
      AND dari_arah = ?
      AND ke_arah = ?
      AND DATE(waktu) = ?
  `;
  const [rows] = await db.query(sql, [ID_Simpang, dari_arah, ke_arah, date]);
  return Number(rows[0]?.total) || 0;
};

const getArusSummaryGrid = async (ID_Simpang, jenisKendaraanDB, queryDate) => {
  const selectFields = jenisKendaraanDB.map(code => `SUM(\`${code}\`) AS \`${code}\``).join(', ');
  const sql = `
    SELECT dari_arah, ke_arah, ${selectFields}
    FROM arus
    WHERE ID_Simpang = ?
      AND DATE(waktu) = ?
    GROUP BY dari_arah, ke_arah
  `;
  const [rows] = await db.query(sql, [ID_Simpang, queryDate]);
  return rows; // Array of { dari_arah, ke_arah, SM, MP, ... }
};

module.exports = { getVehicleDataGrouped, getArusBySimpangDate, getArusSummaryByInterval, getSumForCell, getArusSummaryGrid };
