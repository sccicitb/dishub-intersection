const db = require('../config/db');
const { getPeriodsAndSlots } = require('../helpers/arus');

// Mapping agar subCode dari DB bisa disamakan dengan field alias di unit test
const vehicleAlias = {
  GANDENG: 'gandengSemitrailer',
  SM: 'sm',
  MP: 'mp',
  AUP: 'aup',
  TR: 'tr',
  BS: 'bs',
  TS: 'ts',
  BB: 'bb',
  TB: 'tb',
  KTB: 'ktb'
};

function mapRowToAlias(row, includedSubCodes) {
  const data = {};
  let total = 0;
  for (const code of includedSubCodes) {
    const alias = vehicleAlias[code] || code.toLowerCase();
    const val = Number(row[code] || 0);
    data[alias] = val;
    total += val;
  }
  data.total = total;
  return data;
}

const getVehicleDataGrouped = async ({ simpangId, approach, direction, date }, includedSubCodes, interval = '15min') => {
  let query = `SELECT waktu, ${includedSubCodes.join(', ')} FROM arus WHERE waktu IS NOT NULL`;
  const params = [];

  // Filter kamera, pendekatan, arah
  if (simpangId) {
    query += ` AND ID_Simpang = ?`;
    params.push(simpangId);
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

/**
 * 1. Ambil agregasi per hari berdasarkan rentang tanggal.
 *    filters: { simpangId, approach, direction }
 *    includedSubCodes: array of column‐names di DB (misal ['SM','MP','AUP', …])
 *    startDate, endDate: 'YYYY-MM-DD'
 *
 *  Output: array of { date: '2025-02-03', sm: 100, mp: 50, aup: 0, …, total: 150 }
 */
async function getDailySummaryByDateRange(filters, includedSubCodes, startDate, endDate) {
  // 1) Siapkan SELECT‐SUM field per subCode
  const sumFields = includedSubCodes
    .map(code => `SUM(\`${code}\`) AS \`${code}\``)
    .join(', ');
  // 2) Bangun query dasar
  let sql = `SELECT DATE(waktu) AS date, ${sumFields}
             FROM arus
             WHERE waktu BETWEEN ? AND ?`;
  const params = [`${startDate} 00:00:00`, `${endDate} 23:59:59`];

  if (filters.simpangId) {
    sql += ` AND ID_Simpang = ?`;
    params.push(filters.simpangId);
  }
  if (filters.approach && filters.approach.toLowerCase() !== 'semua') {
    sql += ` AND dari_arah = ?`;
    params.push(filters.approach);
  }
  if (filters.direction && filters.direction.toLowerCase() !== 'semua') {
    sql += ` AND ke_arah = ?`;
    params.push(filters.direction);
  }
  sql += ` GROUP BY DATE(waktu) ORDER BY DATE(waktu)`;

  const [rows] = await db.query(sql, params);

  // Tambahkan kolom total dan mapping alias
  return rows.map(row => ({
    date: row.date,
    ...mapRowToAlias(row, includedSubCodes)
  }));
}

/**
 * 2. Ambil agregasi harian untuk sebuah bulan tertentu (MONTH, YEAR).
 *    month: 1..12, year: 4‐digit integer
 *    Kita akan bangun array semua tanggal di bulan tersebut, lalu join hasil getDailySummaryByDateRange.
 */
async function getMonthlySummary(month, year, filters, includedSubCodes) {
  // 2.1 Hitung jumlah hari dalam bulan + workDays
  const firstDate = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0); // tanggal terakhir di bulan
  const daysInMonth = lastDate.getDate();

  // Hitung workDays (Senin‐Jumat) di bulan itu:
  let workDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const wk = new Date(year, month - 1, d).getDay(); // 0 = Minggu, 6=Sabtu
    if (wk >= 1 && wk <= 5) workDays++;
  }

  // 2.2 Panggil fungsi agregasi harian untuk rentang seluruh bulan
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
  const dailyRows = await getDailySummaryByDateRange(filters, includedSubCodes, startDate, endDate);

  // 2.3 Kita buat array semua hari di bulan tersebut,
  //     jika tanggal tidak muncul di dailyRows, data=0.
  const dailyMap = {};
  dailyRows.forEach(r => { dailyMap[r.date] = r; });

  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (dailyMap[isoDate]) {
      const row = { ...dailyMap[isoDate] };
      delete row.date;
      days.push({ date: isoDate, data: row });
    } else {
      const empty = {};
      for (const code of includedSubCodes) {
        const alias = vehicleAlias[code] || code.toLowerCase();
        empty[alias] = 0;
      }
      empty.total = 0;
      days.push({ date: isoDate, data: empty });
    }
  }

  // 2.4 Hitung monthlyTotal (jumlah keseluruhan dari dailyRows)
  const monthlyTotal = {};
  for (const code of includedSubCodes) {
    const alias = vehicleAlias[code] || code.toLowerCase();
    monthlyTotal[alias] = dailyRows.reduce((sum, r) => sum + (r[alias] || 0), 0);
  }
  monthlyTotal.total = dailyRows.reduce((sum, r) => sum + (r.total || 0), 0);

  // Kembalikan objek format mirip DataTableDaysMonth.json per‐bulan
  return {
    month: firstDate.toLocaleString('id-ID', { month: 'long' }), // 'Januari', 'Februari', …
    year,
    workDays,
    days,           // array per‐tanggal
    monthlyTotal
  };
}

/**
 * 3. Ambil agregasi tahunan: 
 *    startDateObj: Date JS (misal new Date('2025-02-03'))
 *    numYears: berapa periode (default 4)
 */
async function getYearlySummary(startDateObj, filters, includedSubCodes, numYears = 4) {
  const yearlyData = [];
  const lhrtData = [];

  for (let i = 0; i < numYears; i++) {
    // periode i: [ start_i, end_i ) = [ startDateObj + i tahun, startDateObj + (i+1) tahun )
    const periodStart = new Date(startDateObj);
    periodStart.setFullYear(startDateObj.getFullYear() + i);
    const periodEnd = new Date(startDateObj);
    periodEnd.setFullYear(startDateObj.getFullYear() + i + 1);

    // Format tanggal untuk SQL
    const fmt = d => d.toISOString().slice(0, 19).replace('T', ' ');
    const startSql = fmt(periodStart);
    const endSql = fmt(periodEnd);

    // 3.1 Query agregasi penuh di antara [startSql, endSql)
    const sumFields = includedSubCodes.map(code => `SUM(\`${code}\`) AS \`${code}\``).join(', ');
    let sql = `SELECT ${sumFields} FROM arus WHERE waktu >= ? AND waktu < ?`;
    const params = [startSql, endSql];
    if (filters.simpangId) {
      sql += ` AND ID_Simpang = ?`;
      params.push(filters.simpangId);
    }
    if (filters.approach && filters.approach.toLowerCase() !== 'semua') {
      sql += ` AND dari_arah = ?`;
      params.push(filters.approach);
    }
    if (filters.direction && filters.direction.toLowerCase() !== 'semua') {
      sql += ` AND ke_arah = ?`;
      params.push(filters.direction);
    }

    const [rows] = await db.query(sql, params);
    const row = rows[0] || {};
    const data = mapRowToAlias(row, includedSubCodes);

    // 3.2 Push ke yearlyData (label based on tahun periodStart)
    yearlyData.push({
      year: String(periodStart.getFullYear()),
      data
    });

    // 3.3 Hitung LHRT: daysInPeriod (bisa 365/366 tergantung leap year)
    const daysInPeriod = Math.round((periodEnd - periodStart) / (1000 * 60 * 60 * 24));
    // dailyAverage = total / daysInPeriod (bulatkan ke integer)
    const dailyAverage = {};
    for (const k of Object.keys(data)) {
      dailyAverage[k] = daysInPeriod > 0 ? Math.round(data[k] / daysInPeriod) : 0;
    }

    lhrtData.push({
      period: `LHRT ${periodStart.getFullYear()}`,
      daysInPeriod,
      data,
      dailyAverage
    });
  }

  return { yearlyData, lhrtData };
}

module.exports = {
  getVehicleDataGrouped,
  getArusBySimpangDate,
  getArusSummaryByInterval,
  getSumForCell,
  getArusSummaryGrid,
  // Tambahan:
  getDailySummaryByDateRange,
  getMonthlySummary,
  getYearlySummary
};
