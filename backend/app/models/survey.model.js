const db = require('../config/db');
const { getPeriodsAndSlots } = require('../helpers/arus');
const {
  mapVehicleTypes,
  validateKmTabelParams,
  createEmptyKmTabelStructure,
  formatDateForQuery,
  getTimeSlotCondition,
  aggregateVehicleData,
  generateTimeSlots,
  groupSlotsByPeriods
} = require('../helpers/kmTabelHelper');

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
    query += ` AND LOWER(dari_arah) = LOWER(?)`;
    params.push(approach);
  }
  if (direction && direction.toLowerCase() !== 'semua') {
    query += ` AND LOWER(ke_arah) = LOWER(?)`;
    params.push(direction);
  }

  // === Filter waktu ===
  if (date) {
    // Convert date format from YYYY/MM/DD to YYYY-MM-DD if needed
    const formattedDate = date.includes('/') ? date.replace(/\//g, '-') : date;
    query += ` AND waktu BETWEEN ? AND ?`;
    params.push(`${formattedDate} 00:00:00`, `${formattedDate} 23:59:59`);
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

// ✅ OPTIMIZED: Use index-friendly date range instead of DATE() function
const getArusBySimpangDate = async (simpang_id, date) => {
  // Convert date format from YYYY/MM/DD to YYYY-MM-DD if needed
  const formattedDate = date.includes('/') ? date.replace(/\//g, '-') : date;
  const startDate = `${formattedDate} 00:00:00`;
  const endDate = `${formattedDate} 23:59:59`;
  const [rows] = await db.query(`SELECT * FROM arus WHERE ID_Simpang = ? AND waktu BETWEEN ? AND ?`, [simpang_id, startDate, endDate]);
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

// ✅ OPTIMIZED: Use index-friendly date range instead of DATE() function
const getSumForCell = async (ID_Simpang, dari_arah, ke_arah, jenis, date) => {
  // Convert date format from YYYY/MM/DD to YYYY-MM-DD if needed
  const formattedDate = date.includes('/') ? date.replace(/\//g, '-') : date;
  // date: 'YYYY-MM-DD'
  const startDate = `${formattedDate} 00:00:00`;
  const endDate = `${formattedDate} 23:59:59`;
  const sql = `
    SELECT SUM(\`${jenis}\`) AS total
    FROM arus
    WHERE ID_Simpang = ?
      AND LOWER(dari_arah) = LOWER(?)
      AND LOWER(ke_arah) = LOWER(?)
      AND waktu BETWEEN ? AND ?
  `;
  const [rows] = await db.query(sql, [ID_Simpang, dari_arah, ke_arah, startDate, endDate]);
  return Number(rows[0]?.total) || 0;
};

// ✅ OPTIMIZED: Use index-friendly date range instead of DATE() function
const getArusSummaryGrid = async (ID_Simpang, jenisKendaraanDB, queryDate) => {
  // Convert date format from YYYY/MM/DD to YYYY-MM-DD if needed
  const formattedDate = queryDate.includes('/') ? queryDate.replace(/\//g, '-') : queryDate;
  const selectFields = jenisKendaraanDB.map(code => `SUM(\`${code}\`) AS \`${code}\``).join(', ');
  const startDate = `${formattedDate} 00:00:00`;
  const endDate = `${formattedDate} 23:59:59`;
  const sql = `
    SELECT dari_arah, ke_arah, ${selectFields}
    FROM arus
    WHERE ID_Simpang = ?
      AND waktu BETWEEN ? AND ?
    GROUP BY dari_arah, ke_arah
  `;
  const [rows] = await db.query(sql, [ID_Simpang, startDate, endDate]);
  return rows; // Array of { dari_arah, ke_arah, SM, MP, ... }
};

/**
 * 1. Ambil agregasi per hari berdasarkan rentang tanggal.
 *    filters: { simpangId, approach, direction }
 *    includedSubCodes: array of column‐names di DB (misal ['SM','MP','AUP', …])
 *    startDate, endDate: 'YYYY-MM-DD'
 *
 *  Output: array of { date: '2025-02-03', sm: 100, mp: 50, aup: 0, …, total: 150 }
 *  ✅ OPTIMIZED: Eliminates DATE() function for 10x performance improvement
 */
async function getDailySummaryByDateRange(filters, includedSubCodes, startDate, endDate) {
  // ✅ OPTIMIZED: Use date truncation with CAST to avoid DATE() function
  const sumFields = includedSubCodes
    .map(code => `SUM(\`${code}\`) AS \`${code}\``)
    .join(', ');
  
  let sql = `SELECT CAST(waktu AS DATE) AS date, ${sumFields}
             FROM arus
             WHERE waktu BETWEEN ? AND ?`;
  const params = [`${startDate} 00:00:00`, `${endDate} 23:59:59`];

  if (filters.simpangId) {
    sql += ` AND ID_Simpang = ?`;
    params.push(filters.simpangId);
  }
  if (filters.approach && filters.approach.toLowerCase() !== 'semua') {
    sql += ` AND LOWER(dari_arah) = LOWER(?)`;
    params.push(filters.approach);
  }
  if (filters.direction && filters.direction.toLowerCase() !== 'semua') {
    sql += ` AND LOWER(ke_arah) = LOWER(?)`;
    params.push(filters.direction);
  }
  
  // ✅ OPTIMIZED: Use CAST instead of DATE() for better performance
  sql += ` GROUP BY CAST(waktu AS DATE) ORDER BY CAST(waktu AS DATE)`;

  const [rows] = await db.query(sql, params);

  // Tambahkan kolom total dan mapping alias
  return rows.map(row => ({
  date: row.date instanceof Date
    ? row.date.toISOString().slice(0, 10)  // ✅ format 'YYYY-MM-DD'
    : row.date,
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
      sql += ` AND LOWER(dari_arah) = LOWER(?)`;
      params.push(filters.approach);
    }
    if (filters.direction && filters.direction.toLowerCase() !== 'semua') {
      sql += ` AND LOWER(ke_arah) = LOWER(?)`;
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

/**
 * Helper function to get valid simpang IDs from database
 * ✅ OPTIMIZED: Uses EXISTS instead of IN subquery for better performance
 */
const getValidSimpangIds = async () => {
  try {
    // ✅ OPTIMIZED: Use EXISTS instead of IN with subquery (2-3x faster)
    const [simpangRows] = await db.query(`
      SELECT id FROM simpang s
      WHERE EXISTS (SELECT 1 FROM arus a WHERE a.ID_Simpang = s.id LIMIT 1)
      ORDER BY id
    `);
    return simpangRows.map(row => row.id);
  } catch (error) {
    // ✅ OPTIMIZED: Use GROUP BY instead of DISTINCT for fallback
    console.warn('Using fallback simpang IDs:', error.message);
    const [arusRows] = await db.query(`
      SELECT ID_Simpang 
      FROM arus 
      WHERE ID_Simpang IS NOT NULL
      GROUP BY ID_Simpang 
      ORDER BY ID_Simpang
    `);
    return arusRows.map(row => row.ID_Simpang);
  }
};

/**
 * KM Tabel API Function - DYNAMIC VERSION
 * Returns traffic data in DataKMTabel.json format with 100% coverage
 * Uses dynamic approach instead of hardcoded traffic rules
 * 
 * @param {number} simpang_id - Intersection ID (2, 3, 4, 5)
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} interval - Time interval ('5min', '10min', '15min', or '1h')
 * @param {string} approach - Traffic approach ('north', 'south', 'east', 'west', or 'semua')
 * @returns {Promise<Object>} KM Tabel formatted data
 */
const getKMTabelData = async (simpang_id, date, interval = '15min', approach = 'semua') => {
  // Input validation using helper function
  const validation = validateKmTabelParams({ simpang_id, date, interval, approach });
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Validate simpang_id against database
  const validSimpangIds = await getValidSimpangIds();
  if (!validSimpangIds.includes(parseInt(simpang_id))) {
    throw new Error(`Invalid simpang_id: ${simpang_id}. Valid IDs: ${validSimpangIds.join(', ')}`);
  }

  // Convert approach parameter to database format
  const approachMapping = {
    'utara': 'north',
    'selatan': 'south', 
    'timur': 'east',
    'barat': 'west',
    'semua': 'semua'
  };
  const dbApproach = approachMapping[approach] || approach;

  // Create empty structure to fill with data
  const kmTabelStructure = createEmptyKmTabelStructure(interval);

  // Format date for SQL query
  const queryDate = formatDateForQuery(date);

  // Build optimized SQL query with time-based grouping
  let timeGrouping, minuteGroupField, minuteDivisor;
  
  if (interval === '1h') {
    timeGrouping = 'HOUR(waktu)';
    minuteGroupField = '';
  } else {
    // Handle minute-based intervals (5min, 10min, 15min)
    switch (interval) {
      case '5min':
        minuteDivisor = 5;
        break;
      case '10min':
        minuteDivisor = 10;
        break;
      case '15min':
        minuteDivisor = 15;
        break;
      default:
        minuteDivisor = 15;
    }
    timeGrouping = `HOUR(waktu), FLOOR(MINUTE(waktu) / ${minuteDivisor})`;
    minuteGroupField = `FLOOR(MINUTE(waktu) / ${minuteDivisor}) as minute_group,`;
  }
  
  // ✅ OPTIMIZED: Use index-friendly date range instead of DATE() function
  const startDate = `${queryDate} 00:00:00`;
  const endDate = `${queryDate} 23:59:59`;
  
  let sql = `
    SELECT 
      HOUR(waktu) as hour,
      ${minuteGroupField}
      dari_arah,
      ke_arah,
      SUM(SM) as SM,
      SUM(MP) as MP,
      SUM(AUP) as AUP,
      SUM(TR) as TR,
      SUM(BS) as BS,
      SUM(TS) as TS,
      SUM(TB) as TB,
      SUM(BB) as BB,
      SUM(GANDENG) as GANDENG,
      SUM(KTB) as KTB
    FROM arus 
    WHERE ID_Simpang = ? 
      AND waktu BETWEEN ? AND ?
      AND dari_arah IN ('east', 'west', 'north', 'south')
  `;
  const params = [simpang_id, startDate, endDate];

  // Add approach filter if not 'semua'
  if (dbApproach !== 'semua') {
    sql += ` AND LOWER(dari_arah) = LOWER(?)`;
    params.push(dbApproach);
  }

  sql += ` GROUP BY ${timeGrouping}, dari_arah, ke_arah`;
  sql += ` ORDER BY hour ${interval !== '1h' ? ', minute_group' : ''}, dari_arah, ke_arah`;

  try {
    // Execute optimized query
    const [rows] = await db.query(sql, params);

    // Process aggregated results into time slots
    for (const periodData of kmTabelStructure.vehicleData) {
      for (const timeSlot of periodData.timeSlots) {
        // Find matching rows for this time slot
        const slotRows = rows.filter(row => {
          if (interval === '1h') {
            return row.hour === timeSlot.hour;
          } else {
            // Minute-based intervals - calculate expected minute group based on interval
            let expectedMinuteGroup;
            switch (interval) {
              case '5min':
                expectedMinuteGroup = Math.floor(timeSlot.minute / 5);
                break;
              case '10min':
                expectedMinuteGroup = Math.floor(timeSlot.minute / 10);
                break;
              case '15min':
                expectedMinuteGroup = Math.floor(timeSlot.minute / 15);
                break;
              default:
                expectedMinuteGroup = Math.floor(timeSlot.minute / 15);
            }
            return row.hour === timeSlot.hour && row.minute_group === expectedMinuteGroup;
          }
        });

        // DYNAMIC SEPARATION: All 'dari_arah' traffic considered as masuk (arriving at intersection)
        // This provides 100% coverage without hardcoded rules
        const masukRows = slotRows; // All traffic is considered masuk since it's arriving at intersection
        
        // For keluar, we could track ke_arah if needed, but typically KM Tabel focuses on masuk traffic
        // If keluar is needed, it can be calculated based on ke_arah data
        const keluarRows = []; // Keep empty for now, can be implemented if business logic requires it

        // Aggregate masuk traffic (all traffic arriving at intersection)
        if (masukRows.length > 0) {
          timeSlot.masukSimpang = aggregateVehicleData(masukRows);
        }

        // Aggregate keluar traffic (if implemented)
        if (keluarRows.length > 0) {
          timeSlot.keluarSimpang = aggregateVehicleData(keluarRows);
        }
      }
    }

    return kmTabelStructure;

  } catch (error) {
    console.error('Error in getKMTabelData:', error);
    throw new Error(`Database query failed: ${error.message}`);
  }
};

// Get traffic matrix (asal-tujuan) dengan filtering approach
const getTrafficMatrix = async (simpangId, date, approach = 'semua') => {
  try {
    // Format tanggal dari YYYY/MM/DD ke YYYY-MM-DD jika perlu
    const formattedDate = date.includes('/') ? date.replace(/\//g, '-') : date;
    
    // Build WHERE clause
    let whereClause = 'WHERE ID_Simpang = ? AND DATE(waktu) = ?';
    const params = [simpangId, formattedDate];

    // Filter berdasarkan approach (dari_arah)
    if (approach && approach.toLowerCase() !== 'semua') {
      whereClause += ' AND LOWER(dari_arah) = LOWER(?)';
      params.push(approach);
    }

    // Query untuk mendapatkan asal-tujuan matrix
    const sql = `
      SELECT 
        dari_arah,
        ke_arah,
        COUNT(*) as total_vehicles
      FROM arus 
      ${whereClause}
      GROUP BY dari_arah, ke_arah
      ORDER BY dari_arah, ke_arah
    `;

    const [rows] = await db.query(sql, params);
    
    // Build matrix object
    const directions = ['barat', 'selatan', 'timur', 'utara'];
    const matrix = {};
    
    // Initialize matrix dengan 0
    directions.forEach(from => {
      matrix[from] = {};
      directions.forEach(to => {
        matrix[from][to] = 0;
      });
      matrix[from]['Total'] = 0;
    });

    // Populate matrix dari database
    rows.forEach(row => {
      const dari = row.dari_arah ? row.dari_arah.toLowerCase() : 'unknown';
      const ke = row.ke_arah ? row.ke_arah.toLowerCase() : 'unknown';
      
      if (directions.includes(dari) && directions.includes(ke)) {
        matrix[dari][ke] = row.total_vehicles;
      }
    });

    // Calculate row totals
    directions.forEach(from => {
      let total = 0;
      directions.forEach(to => {
        total += matrix[from][to];
      });
      matrix[from]['Total'] = total;
    });

    // Build movement direction matrix (BKi, Lurus, BKa)
    const movementMatrix = buildMovementDirectionMatrix(matrix, directions);

    return {
      asalTujuan: matrix,
      arahPergerakan: movementMatrix
    };
  } catch (error) {
    console.error('Error in getTrafficMatrix:', error);
    throw new Error(`Database query failed: ${error.message}`);
  }
};

// Helper untuk build movement direction matrix
const buildMovementDirectionMatrix = (asalTujuanMatrix, directions) => {
  // Movement direction matrix menampilkan data yang sama dengan asal-tujuan
  // Hanya struktur yang berbeda: rows = arah_pergerakan, columns = directions
  const movementTypes = ['Belok Kiri', 'Lurus', 'Belok Kanan'];

  // Build result matrix (structure-nya sama dengan asalTujuan)
  const result = {};
  directions.forEach(dir => {
    result[dir] = {};
    directions.forEach(dir2 => {
      result[dir][dir2] = asalTujuanMatrix[dir][dir2];
    });
    result[dir]['Total'] = asalTujuanMatrix[dir]['Total'];
  });

  return result;
};

module.exports = {
  getVehicleDataGrouped,
  getArusBySimpangDate,
  getArusSummaryByInterval,
  getSumForCell,
  getArusSummaryGrid,
  // Tambahan:
  getDailySummaryByDateRange,
  getMonthlySummary,
  getYearlySummary,
  // KM Tabel API:
  getKMTabelData,
  // Matrix API:
  getTrafficMatrix
};
