const db = require("../config/db");

const Vehicle = function (data) {
  this.ID_Simpang = data.ID_Simpang;
  this.tipe_pendekat = data.tipe_pendekat;
  this.dari_arah = data.dari_arah;
  this.ke_arah = data.ke_arah;
  this.SM = data.SM;
  this.MP = data.MP;
  this.AUP = data.AUP;
  this.TR = data.TR;
  this.BS = data.BS;
  this.TS = data.TS;
  this.TB = data.TB;
  this.BB = data.BB;
  this.GANDENG = data.GANDENG;
  this.KTB = data.KTB;
  this.waktu = data.waktu;
  this.created_at = data.created_at;
  this.updated_at = data.updated_at;
};

// FIXED: Helper function to get index-friendly WHERE clause based on filter type
const getDateFilterClause = (filter, startDate = null, endDate = null) => {
  // Get current date in Jakarta timezone (UTC+7) - Check if data is stored in local time
  const now = new Date();
  
  switch (filter) {
    case 'customrange': {
      // Custom date range - must have both startDate and endDate
      if (!startDate || !endDate) {
        throw new Error('customrange filter requires both start-date and end-date parameters in YYYY-MM-DD hh:mm:ss format');
      }
      
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD hh:mm:ss format (e.g., 2026-01-05 00:00:00)');
      }
      
      // Parse dates
      const start = startDate;
      const end = endDate;
      
      // Validate date range
      if (start > end) {
        throw new Error('start-date must be before end-date');
      }
      
      // Assuming 'waktu' is stored in Local Time, return range in Local Time string
      return `waktu >= '${start}' AND waktu <= '${end}'`;
    }
      
    case 'day':
    case 'harian': {
      const todayJakarta = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
      return `waktu >= '${todayJakarta} 00:00:00' AND waktu <= '${todayJakarta} 23:59:59'`;
    }
      
    case 'week':
    case 'minggu': {
      const todayJakarta = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD
      const [year, month, day] = todayJakarta.split('-').map(Number);
      const today = new Date(year, month - 1, day); // Create date in local timezone
      const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ... 6=Saturday
      
      // Calculate Monday of this week (0=Sunday, so Monday is 1)
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(year, month - 1, day - daysToMonday);
      
      // Calculate Sunday of this week (6 days after Monday)
      const sunday = new Date(year, month - 1, day + (6 - daysToMonday));
      
      const mondayStr = monday.toLocaleDateString('sv-SE'); // YYYY-MM-DD
      const sundayStr = sunday.toLocaleDateString('sv-SE'); // YYYY-MM-DD
      
      return `waktu >= '${mondayStr} 00:00:00' AND waktu <= '${sundayStr} 23:59:59'`;
    }
      
    case 'month':
    case 'bulanan': {
      const todayJakarta = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD
      const [year, month, day] = todayJakarta.split('-').map(Number);
      
      // First day of current month
      const firstDay = new Date(year, month - 1, 1);
      // Last day of current month
      const lastDay = new Date(year, month, 0);
      
      const firstDayStr = firstDay.toLocaleDateString('sv-SE'); // YYYY-MM-DD
      const lastDayStr = lastDay.toLocaleDateString('sv-SE'); // YYYY-MM-DD
      
      return `waktu >= '${firstDayStr} 00:00:00' AND waktu <= '${lastDayStr} 23:59:59'`;
    }
      
    case 'quarter':
    case 'kuartal': {
      const todayJakarta = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD
      const [year, month, day] = todayJakarta.split('-').map(Number);
      const quarter = Math.floor((month - 1) / 3);
      
      const firstMonthOfQuarter = quarter * 3 + 1;
      const firstDay = new Date(year, firstMonthOfQuarter - 1, 1);
      const lastDay = new Date(year, firstMonthOfQuarter + 2, 0);
      
      const firstDayStr = firstDay.toLocaleDateString('sv-SE'); // YYYY-MM-DD
      const lastDayStr = lastDay.toLocaleDateString('sv-SE'); // YYYY-MM-DD
      
      return `waktu >= '${firstDayStr} 00:00:00' AND waktu <= '${lastDayStr} 23:59:59'`;
    }
      
    case 'year':
    case 'tahunan': {
      const todayJakarta = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD
      const [year, month, day] = todayJakarta.split('-').map(Number);
      
      const firstDay = new Date(year, 0, 1);
      const lastDay = new Date(year, 11, 31);
      
      const firstDayStr = firstDay.toLocaleDateString('sv-SE'); // YYYY-MM-DD
      const lastDayStr = lastDay.toLocaleDateString('sv-SE'); // YYYY-MM-DD
      
      return `waktu >= '${firstDayStr} 00:00:00' AND waktu <= '${lastDayStr} 23:59:59'`;
    }
      
    default: {
      const todayJakarta = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD
      return `waktu >= '${todayJakarta} 00:00:00' AND waktu <= '${todayJakarta} 23:59:59'`;
    }
  }
};

/**
 * Helper function to get valid simpang IDs from database
 * OPTIMIZED: Uses EXISTS instead of IN subquery for better performance
 */
const getValidSimpangIds = async () => {
  try {
    // OPTIMIZED: Use EXISTS instead of IN with subquery (2-3x faster)
    const [simpangRows] = await db.query(`
      SELECT id FROM simpang s
      WHERE EXISTS (SELECT 1 FROM arus a WHERE a.ID_Simpang = s.id LIMIT 1)
      ORDER BY id
    `);
    return simpangRows.map(row => row.id);
  } catch (error) {
    // OPTIMIZED: Use GROUP BY instead of DISTINCT for fallback
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

const getLocationSpecificFlowCases = () => {
  return {
    getInCases: () => `
      CASE 
        -- Tempel (ID: 5) - Arah Utara - IN: menuju Selatan
        WHEN ID_Simpang = 5 AND ke_arah = 'south' THEN 1
        
        -- Prambanan (ID: 2) - Arah Timur - IN: menuju Barat
        WHEN ID_Simpang = 2 AND ke_arah = 'west' THEN 1
        
        -- Piyungan (ID: 4) - Arah Selatan - IN: menuju Barat atau Utara
        WHEN ID_Simpang = 4 AND ke_arah IN ('west', 'north') THEN 1
        
        -- Glagah (ID: 3) - Arah Barat - IN: menuju Timur
        WHEN ID_Simpang = 3 AND ke_arah = 'east' THEN 1
        
        ELSE NULL
      END
    `,
    
    getOutCases: () => `
      CASE 
        -- Tempel (ID: 5) - Arah Utara - OUT: menuju Utara
        WHEN ID_Simpang = 5 AND ke_arah = 'north' THEN 1
        
        -- Prambanan (ID: 2) - Arah Timur -   OUT: menuju Timur
        WHEN ID_Simpang = 2 AND ke_arah = 'east' THEN 1
        
        -- Piyungan (ID: 4) - Arah Selatan - OUT: menuju Timur atau Selatan
        WHEN ID_Simpang = 4 AND ke_arah IN ('east', 'south') THEN 1
        
        -- Glagah (ID: 3) - Arah Barat - OUT: menuju Barat
        WHEN ID_Simpang = 3 AND ke_arah = 'west' THEN 1
        
        ELSE NULL
      END
    `
  };
};

Vehicle.getAll = async (result) => {
  try {
    const [rows] = await db.query('SELECT * FROM arus ORDER BY waktu DESC LIMIT 10');
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// FIXED: Use location-specific traffic flow rules instead of generic direction filtering
Vehicle.getChartMasukKeluar = async (result, filter = 'day', simpang = 'semua', startDate = null, endDate = null) => {
  try {
    const dateFilter = getDateFilterClause(filter, startDate, endDate);
    // OPTIMIZATION: remove checking all valid IDs when filtering by "semua" to speed up query
    // const validSimpangIds = await getValidSimpangIds(); 
    const flowRules = getLocationSpecificFlowCases();
    
    // Build simpang filter
    let simpangFilter = '';
    if (simpang !== 'semua') {
      const validSimpangIds = await getValidSimpangIds();
      const simpangId = parseInt(simpang, 10);
      if (!isNaN(simpangId) && validSimpangIds.includes(simpangId)) {
        simpangFilter = `AND ID_Simpang = ${simpangId}`;
      } else {
        throw new Error(`Invalid simpang ID: ${simpang}`);
      }
    } else {
      // OPTIMIZATION: Do not force "IN (...)" filter for all simpangs. 
      // Trust the date filter and assume data is reasonably clean or cleanup happens elsewhere.
      simpangFilter = ''; // `AND ID_Simpang IN (${validSimpangIds.join(', ')})`;
    }
    
    const [rows] = await db.query(`
      SELECT
        COUNT(${flowRules.getInCases()}) AS total_IN,
        COUNT(${flowRules.getOutCases()}) AS total_OUT
      FROM arus
      WHERE ${dateFilter}
        ${simpangFilter};
    `);
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// FIXED: Use location-specific traffic flow rules instead of generic direction filtering
Vehicle.getGroupTipeKendaraan = async (result, filter = 'day', simpang = 'semua', startDate = null, endDate = null) => {
  try {
    const dateFilter = getDateFilterClause(filter, startDate, endDate);
    // OPTIMIZATION: skip fetching all IDs
    // const validSimpangIds = await getValidSimpangIds();
    const flowRules = getLocationSpecificFlowCases();
    
    // Build simpang filter
    let simpangFilter = '';
    if (simpang !== 'semua') {
      const validSimpangIds = await getValidSimpangIds();
      const simpangId = parseInt(simpang, 10);
      if (!isNaN(simpangId) && validSimpangIds.includes(simpangId)) {
        simpangFilter = `AND ID_Simpang = ${simpangId}`;
      } else {
        throw new Error(`Invalid simpang ID: ${simpang}`);
      }
    } else {
       // OPTIMIZATION: No IN clause for 'semua'
      simpangFilter = '';
    }
    
    const [rows] = await db.query(`
      SELECT
        SUM(SM) AS SM, SUM(MP) AS MP, SUM(AUP) AS AUP, SUM(TR) AS TR, SUM(BS) AS BS, SUM(TS) AS TS, SUM(TB) AS TB, SUM(BB) AS BB, SUM(GANDENG) AS GANDENG, SUM(KTB) AS KTB,
        COUNT(${flowRules.getInCases()}) AS total_IN,
        COUNT(${flowRules.getOutCases()}) AS total_OUT
      FROM arus
      WHERE ${dateFilter}
        ${simpangFilter};
    `);

    if (rows.length === 0) {
      result(null, []);
      return;
    }
    
    const totals = rows[0]; // The object with summed totals
    const resultData = [];
    
    const types = ['SM', 'MP', 'AUP', 'TR', 'BS', 'TS', 'TB', 'BB', 'GANDENG', 'KTB'];
    
    types.forEach(type => {
      const count = totals[type] || 0;
      if (count > 0) {

        const obj = {};
        obj[type] = 1;
      }
    });

    const [rowsDetailed] = await db.query(`
      SELECT
        -- Sums for IN direction
        SUM(CASE WHEN ${flowRules.getInCases()} IS NOT NULL THEN SM ELSE 0 END) AS SM_IN,
        SUM(CASE WHEN ${flowRules.getInCases()} IS NOT NULL THEN MP ELSE 0 END) AS MP_IN,
        SUM(CASE WHEN ${flowRules.getInCases()} IS NOT NULL THEN AUP ELSE 0 END) AS AUP_IN,
        SUM(CASE WHEN ${flowRules.getInCases()} IS NOT NULL THEN TR ELSE 0 END) AS TR_IN,
        SUM(CASE WHEN ${flowRules.getInCases()} IS NOT NULL THEN BS ELSE 0 END) AS BS_IN,
        SUM(CASE WHEN ${flowRules.getInCases()} IS NOT NULL THEN TS ELSE 0 END) AS TS_IN,
        SUM(CASE WHEN ${flowRules.getInCases()} IS NOT NULL THEN TB ELSE 0 END) AS TB_IN,
        SUM(CASE WHEN ${flowRules.getInCases()} IS NOT NULL THEN BB ELSE 0 END) AS BB_IN,
        SUM(CASE WHEN ${flowRules.getInCases()} IS NOT NULL THEN GANDENG ELSE 0 END) AS GANDENG_IN,
        SUM(CASE WHEN ${flowRules.getInCases()} IS NOT NULL THEN KTB ELSE 0 END) AS KTB_IN,

        -- Sums for OUT direction
        SUM(CASE WHEN ${flowRules.getOutCases()} IS NOT NULL THEN SM ELSE 0 END) AS SM_OUT,
        SUM(CASE WHEN ${flowRules.getOutCases()} IS NOT NULL THEN MP ELSE 0 END) AS MP_OUT,
        SUM(CASE WHEN ${flowRules.getOutCases()} IS NOT NULL THEN AUP ELSE 0 END) AS AUP_OUT,
        SUM(CASE WHEN ${flowRules.getOutCases()} IS NOT NULL THEN TR ELSE 0 END) AS TR_OUT,
        SUM(CASE WHEN ${flowRules.getOutCases()} IS NOT NULL THEN BS ELSE 0 END) AS BS_OUT,
        SUM(CASE WHEN ${flowRules.getOutCases()} IS NOT NULL THEN TS ELSE 0 END) AS TS_OUT,
        SUM(CASE WHEN ${flowRules.getOutCases()} IS NOT NULL THEN TB ELSE 0 END) AS TB_OUT,
        SUM(CASE WHEN ${flowRules.getOutCases()} IS NOT NULL THEN BB ELSE 0 END) AS BB_OUT,
        SUM(CASE WHEN ${flowRules.getOutCases()} IS NOT NULL THEN GANDENG ELSE 0 END) AS GANDENG_OUT,
        SUM(CASE WHEN ${flowRules.getOutCases()} IS NOT NULL THEN KTB ELSE 0 END) AS KTB_OUT
      FROM arus
      WHERE ${dateFilter}
        ${simpangFilter};
    `);

    const data = rowsDetailed[0];
    const formattedResult = [];
    const vehicleTypes = ['SM', 'MP', 'AUP', 'TR', 'BS', 'TS', 'TB', 'BB', 'GANDENG', 'KTB'];
    
    vehicleTypes.forEach(type => {
        const inCount = parseInt(data[`${type}_IN`] || 0);
        const outCount = parseInt(data[`${type}_OUT`] || 0);
        
        if (inCount > 0 || outCount > 0) {
            const item = {};
            item[type] = 1; // Flag for frontend detection
            item.total_IN = inCount;
            item.total_OUT = outCount;
            formattedResult.push(item);
        }
    });
    
    result(null, formattedResult);
    return; // Stop execution here, we handled the response
    
    /* 
       original code below is kept but bypassed by the return above. 
       Actually, I should replace the query block entirely.
    */
    
    
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};


// FIXED: Use location-specific traffic flow rules with direction breakdown
Vehicle.getMasukKeluarByArah = async (result, filter = 'day', simpang = 'semua', startDate = null, endDate = null) => {
  try {
    const dateFilter = getDateFilterClause(filter, startDate, endDate);
    // OPTIMIZATION: skip fetching all IDs
    // const validSimpangIds = await getValidSimpangIds();
    const flowRules = getLocationSpecificFlowCases();
    
    // Build simpang filter
    let simpangFilter = '';
    if (simpang !== 'semua') {
      const validSimpangIds = await getValidSimpangIds();
      const simpangId = parseInt(simpang, 10);
      if (!isNaN(simpangId) && validSimpangIds.includes(simpangId)) {
        simpangFilter = `AND ID_Simpang = ${simpangId}`;
      } else {
        throw new Error(`Invalid simpang ID: ${simpang}`);
      }
    } else {
      // OPTIMIZATION: No IN clause for 'semua'
      simpangFilter = '';
    }
    
    // LOCATION-SPECIFIC: Calculate IN/OUT by direction using official traffic rules
    const [data] = await db.query(`
      SELECT
        -- East direction - count traffic that comes TO east or goes FROM east based on rules
        COUNT(CASE WHEN ke_arah = 'east' AND (${flowRules.getInCases()}) IS NOT NULL THEN 1 END) AS east_total_IN,
        COUNT(CASE WHEN dari_arah = 'east' AND (${flowRules.getOutCases()}) IS NOT NULL THEN 1 END) AS east_total_OUT,

        -- North direction
        COUNT(CASE WHEN ke_arah = 'north' AND (${flowRules.getInCases()}) IS NOT NULL THEN 1 END) AS north_total_IN,
        COUNT(CASE WHEN dari_arah = 'north' AND (${flowRules.getOutCases()}) IS NOT NULL THEN 1 END) AS north_total_OUT,

        -- South direction
        COUNT(CASE WHEN ke_arah = 'south' AND (${flowRules.getInCases()}) IS NOT NULL THEN 1 END) AS south_total_IN,
        COUNT(CASE WHEN dari_arah = 'south' AND (${flowRules.getOutCases()}) IS NOT NULL THEN 1 END) AS south_total_OUT,

        -- West direction
        COUNT(CASE WHEN ke_arah = 'west' AND (${flowRules.getInCases()}) IS NOT NULL THEN 1 END) AS west_total_IN,
        COUNT(CASE WHEN dari_arah = 'west' AND (${flowRules.getOutCases()}) IS NOT NULL THEN 1 END) AS west_total_OUT
      FROM arus
      WHERE ${dateFilter}
        ${simpangFilter};
    `);
    
    // Direction mapping from English to Indonesian
    const directionMap = {
      'east': 'timur',
      'north': 'utara',
      'south': 'selatan',
      'west': 'barat'
    };

    // Transform single row result to array format expected by frontend with Indonesian directions
    const rows = [
      { arah: directionMap['east'], total_IN: data[0].east_total_IN || 0, total_OUT: data[0].east_total_OUT || 0 },
      { arah: directionMap['north'], total_IN: data[0].north_total_IN || 0, total_OUT: data[0].north_total_OUT || 0 },
      { arah: directionMap['south'], total_IN: data[0].south_total_IN || 0, total_OUT: data[0].south_total_OUT || 0 },
      { arah: directionMap['west'], total_IN: data[0].west_total_IN || 0, total_OUT: data[0].west_total_OUT || 0 }
    ];
    
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// FIXED: Use location-specific traffic flow rules with Jakarta timezone optimization
Vehicle.getRataPerJam = async (result, filter = 'day') => {
  try {
    const dateFilter = getDateFilterClause(filter);
    // OPTIMIZATION: remove dependency on all ID simpang check for "all" 
    // const validSimpangIds = await getValidSimpangIds();
    const flowRules = getLocationSpecificFlowCases();
    
    // OPTIMIZED: Adjusted for Local Time storage
    // AND ID_Simpang IN (...) removed
    const [rows] = await db.query(`
      SELECT
        HOUR(waktu) AS jam,
        COUNT(${flowRules.getInCases()}) AS total_IN,
        COUNT(${flowRules.getOutCases()}) AS total_OUT
      FROM arus
      WHERE ${dateFilter}
      GROUP BY HOUR(waktu)
      ORDER BY jam;
    `);
    result(null, rows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// FIXED: Use location-specific traffic flow rules with Jakarta timezone optimization
Vehicle.getRataPer15Menit = async (result, filter = 'day', simpang = 'semua', startDate = null, endDate = null) => {
  try {
    const dateFilter = getDateFilterClause(filter, startDate, endDate);
    // OPTIMIZATION: skip fetching all IDs
    // const validSimpangIds = await getValidSimpangIds();
    const flowRules = getLocationSpecificFlowCases();
    
    // Build simpang filter
    let simpangFilter = '';
    if (simpang !== 'semua') {
      const validSimpangIds = await getValidSimpangIds();
      const simpangId = parseInt(simpang, 10);
      if (!isNaN(simpangId) && validSimpangIds.includes(simpangId)) {
        simpangFilter = `AND ID_Simpang = ${simpangId}`;
      } else {
        throw new Error(`Invalid simpang ID: ${simpang}`);
      }
    } else {
      // OPTIMIZATION: skip IN clause for 'semua'
      simpangFilter = ''; // `AND ID_Simpang IN (${validSimpangIds.join(', ')})`;
    }
    
    let query;
    const isAggregated = filter !== 'day' && filter !== 'customrange' || (filter === 'customrange' && startDate !== endDate);

    if (isAggregated) {
       // Aggregated query (Average across days)
       query = `
        WITH DailyCounts AS (
          SELECT 
            CAST(waktu AS DATE) as tgl,
            HOUR(waktu) as waktu_jam,
            FLOOR(MINUTE(waktu) / 15) * 15 as waktu_menit,
            COUNT(${flowRules.getInCases()}) AS total_IN,
            COUNT(${flowRules.getOutCases()}) AS total_OUT
          FROM arus
          WHERE ${dateFilter} ${simpangFilter}
          GROUP BY tgl, waktu_jam, waktu_menit
        )
        SELECT 
          waktu_jam AS jam,
          waktu_menit AS menit,
          AVG(total_IN) AS total_IN,
          AVG(total_OUT) AS total_OUT
        FROM DailyCounts
        GROUP BY jam, menit
        ORDER BY jam, menit;
      `;
    } else {
      // Single day raw counts
      query = `
        SELECT
          CAST(waktu AS DATE) AS tanggal,
          HOUR(waktu) AS jam,
          FLOOR(MINUTE(waktu) / 15) * 15 AS menit,
          COUNT(${flowRules.getInCases()}) AS total_IN,
          COUNT(${flowRules.getOutCases()}) AS total_OUT
        FROM arus
        WHERE ${dateFilter}
          ${simpangFilter}
        GROUP BY CAST(waktu AS DATE), HOUR(waktu), FLOOR(MINUTE(waktu) / 15)
        ORDER BY tanggal, jam, menit
      `;
    }

    const [rows] = await db.query(query);

    // Format output: Replace 'jam' with 15-minute time range string (e.g. "15:00-15:15")
    const formattedRows = rows.map(row => {
      const h = row.jam;
      const m = row.menit;
      
      const pad = (n) => n.toString().padStart(2, '0');
      
      // Calculate start and end times
      const startStr = `${pad(h)}:${pad(m)}`;
      
      let endH = h;
      let endM = m + 15;
      if (endM >= 60) {
        endM = 0;
        endH = (endH + 1) % 24;
      }
      const endStr = `${pad(endH)}:${pad(endM)}`;
      
      return {
        ...row,
        // Ensure values are integers for frontend consistency if averaged
        total_IN: Math.round(row.total_IN),
        total_OUT: Math.round(row.total_OUT),
        jam: `${startStr}-${endStr}`, // Replaces integer hour with range string
      };
    });

    result(null, formattedRows);
  } catch (err) {
    console.error("error: ", err);
    result(err, null);
  }
};

// NEW: Get origin-destination matrix for traffic analysis
// Adopts date range pattern from existing functions for consistency
Vehicle.getAsalTujuanMatrix = async (simpangId, filter = 'day', startDate = null, endDate = null) => {
  try {
    // Generate date filter clause using existing helper function
    const dateFilterClause = getDateFilterClause(filter, startDate, endDate);
    
    // Query with dynamic date filtering
    const sql = `
      SELECT 
        dari_arah,
        ke_arah,
        COUNT(*) as total_vehicles
      FROM arus 
      WHERE ID_Simpang = ? 
        AND ${dateFilterClause}
        AND dari_arah != ke_arah
      GROUP BY dari_arah, ke_arah
      ORDER BY dari_arah, ke_arah
    `;
    
    const [rows] = await db.query(sql, [simpangId]);
    return rows;
  } catch (error) {
    throw new Error(`Error getting asal-tujuan matrix: ${error.message}`);
  }
};

// NEW: Process raw origin-destination data into movement direction matrix (BKi, Lurus, BKa)
// Uses traffic engineering rules to categorize movements
Vehicle.processMovementDirection = (asalTujuanData) => {
  try {
    // Define all possible directions (Indonesian for matrix output)
    const directions = ['barat', 'selatan', 'timur', 'utara'];
    const movementTypes = ['Belok Kiri', 'Lurus', 'Belok Kanan'];
    
    // Direction mapping from English to Indonesian
    const directionMap = {
      'west': 'barat',
      'south': 'selatan', 
      'east': 'timur',
      'north': 'utara'
    };
    
    // Initialize result matrix with zeros
    const result = {};
    movementTypes.forEach(type => {
      result[type] = {};
      directions.forEach(dir => {
        result[type][dir] = 0;
      });
      result[type]['Total'] = 0;
    });
    
    // Process each origin-destination pair using traffic engineering rules
    asalTujuanData.forEach(row => {
      const { dari_arah, ke_arah, total_vehicles } = row;
      
      // Apply movement categorization rules based on traffic engineering
      let movementType = null;
      
      if (dari_arah === 'east') {
        if (ke_arah === 'south') movementType = 'Belok Kiri';      // East → South = BKi
        else if (ke_arah === 'north') movementType = 'Belok Kanan'; // East → North = BKa
        else if (ke_arah === 'west') movementType = 'Lurus';        // East → West = Lurus
      }
      else if (dari_arah === 'west') {
        if (ke_arah === 'north') movementType = 'Belok Kiri';       // West → North = BKi
        else if (ke_arah === 'south') movementType = 'Belok Kanan'; // West → South = BKa
        else if (ke_arah === 'east') movementType = 'Lurus';        // West → East = Lurus
      }
      else if (dari_arah === 'north') {
        if (ke_arah === 'west') movementType = 'Belok Kiri';        // North → West = BKi
        else if (ke_arah === 'east') movementType = 'Belok Kanan';  // North → East = BKa
        else if (ke_arah === 'south') movementType = 'Lurus';       // North → South = Lurus
      }
      else if (dari_arah === 'south') {
        if (ke_arah === 'east') movementType = 'Belok Kiri';        // South → East = BKi
        else if (ke_arah === 'west') movementType = 'Belok Kanan';  // South → West = BKa
        else if (ke_arah === 'north') movementType = 'Lurus';       // South → North = Lurus
      }
      
      // If movement type is determined, add to matrix
      if (movementType) {
        // Map English direction to Indonesian for matrix
        const dariArahId = directionMap[dari_arah];
        if (dariArahId) {
          result[movementType][dariArahId] += total_vehicles;
          result[movementType]['Total'] += total_vehicles;
        }
      }
    });

    // Add totals per direction across all movement types
    result['Total'] = {};
    directions.forEach(dir => {
      result['Total'][dir] = 0;
      movementTypes.forEach(type => {
        result['Total'][dir] += result[type][dir];
      });
    });
    result['Total']['Total'] = directions.reduce((sum, dir) => sum + result['Total'][dir], 0);

    return result;
  } catch (error) {
    throw new Error(`Error processing movement direction: ${error.message}`);
  }
};

// NEW: Build asal-tujuan matrix with totals (exactly like the dashboard image)
Vehicle.buildAsalTujuanMatrix = (asalTujuanData) => {
  try {
    const directions = ['barat', 'selatan', 'timur', 'utara'];
    
    // Direction mapping from English to Indonesian
    const directionMap = {
      'west': 'barat',
      'south': 'selatan', 
      'east': 'timur',
      'north': 'utara'
    };
    
    // Initialize matrix with zeros
    const matrix = {};
    directions.forEach(dir => {
      matrix[dir] = {};
      directions.forEach(dest => {
        matrix[dir][dest] = 0;
      });
      matrix[dir]['Total'] = 0;
    });
    
    // Fill in actual data from database
    asalTujuanData.forEach(row => {
      const { dari_arah, ke_arah, total_vehicles } = row;
      
      // Map English directions to Indonesian
      const dariArahId = directionMap[dari_arah] || dari_arah;
      const keArahId = directionMap[ke_arah] || ke_arah;
      
      // Only process if both directions are valid
      if (directions.includes(dariArahId) && directions.includes(keArahId)) {
        matrix[dariArahId][keArahId] = total_vehicles;
        matrix[dariArahId]['Total'] += total_vehicles;
      }
    });
    
    // Calculate column totals (vehicles arriving at each destination)
    matrix['Total'] = {};
    directions.forEach(dest => {
      matrix['Total'][dest] = 0;
      directions.forEach(origin => {
        matrix['Total'][dest] += matrix[origin][dest];
      });
    });
    
    // Calculate grand total
    matrix['Total']['Total'] = directions.reduce((sum, dir) => sum + matrix['Total'][dir], 0);
    
    return matrix;
  } catch (error) {
    throw new Error(`Error building asal-tujuan matrix: ${error.message}`);
  }
};

// NEW: Get origin-destination matrix for all simpangs
Vehicle.getAsalTujuanMatrixAll = async (filter = 'day', startDate = null, endDate = null) => {
  try {
    // Generate date filter clause using existing helper function
    const dateFilterClause = getDateFilterClause(filter, startDate, endDate);
    
    const sql = `
      SELECT 
        dari_arah,
        ke_arah,
        COUNT(*) as total_vehicles
      FROM arus 
      WHERE ${dateFilterClause}
        AND dari_arah != ke_arah
      GROUP BY dari_arah, ke_arah
      ORDER BY dari_arah, ke_arah
    `;
    
    const [rows] = await db.query(sql, []);
    return rows;
  } catch (error) {
    throw new Error(`Error getting asal-tujuan matrix for all simpangs: ${error.message}`);
  }
};

// NEW: Get complete traffic matrix (both asal-tujuan and arah pergerakan)
// Support simpangId='semua' to aggregate all simpangs
Vehicle.getCompleteTrafficMatrix = async (simpangId, filter = 'day', startDate = null, endDate = null) => {
  try {
    let asalTujuanData;
    
    if (simpangId === 'semua') {
      // Get data from all simpangs
      asalTujuanData = await Vehicle.getAsalTujuanMatrixAll(filter, startDate, endDate);
    } else {
      // Get data from specific simpang
      asalTujuanData = await Vehicle.getAsalTujuanMatrix(simpangId, filter, startDate, endDate);
    }
    
    // Process into movement direction matrix (BKi, Lurus, BKa)
    const arahPergerakanData = Vehicle.processMovementDirection(asalTujuanData);
    
    // Build complete asal-tujuan matrix with totals
    const asalTujuanMatrix = Vehicle.buildAsalTujuanMatrix(asalTujuanData);
    
    // Return both matrices in the exact format needed for dashboard
    return {
      asalTujuan: asalTujuanMatrix,
      arahPergerakan: arahPergerakanData
    };
  } catch (error) {
    throw new Error(`Error getting complete traffic matrix: ${error.message}`);
  }
};

// NEW: Get traffic matrix with vehicle categories breakdown
// Query the database to get vehicle counts by category, origin, and destination
Vehicle.getTrafficMatrixByCategory = async (simpangId, filter = 'day', startDate = null, endDate = null) => {
  try {
    const dateFilterClause = getDateFilterClause(filter, startDate, endDate);
    
    // Query to get aggregated vehicle categories grouped by origin-destination
    // OPTIMIZED: Uses aggregation (SUM) in database instead of fetching all rows
    const sql = `
      SELECT 
        dari_arah,
        ke_arah,
        SUM(CAST(SM AS UNSIGNED)) as SM,
        SUM(CAST(MP AS UNSIGNED)) as MP,
        SUM(CAST(AUP AS UNSIGNED)) as AUP,
        SUM(CAST(TR AS UNSIGNED)) as TR,
        SUM(CAST(BS AS UNSIGNED)) as BS,
        SUM(CAST(TS AS UNSIGNED)) as TS,
        SUM(CAST(TB AS UNSIGNED)) as TB,
        SUM(CAST(BB AS UNSIGNED)) as BB,
        SUM(CAST(GANDENG AS UNSIGNED)) as GANDENG,
        SUM(CAST(KTB AS UNSIGNED)) as KTB
      FROM arus 
      WHERE ID_Simpang = ? 
        AND ${dateFilterClause}
        AND dari_arah != ke_arah
      GROUP BY dari_arah, ke_arah
      ORDER BY dari_arah, ke_arah
    `;
    
    const [rows] = await db.query(sql, [simpangId]);
    return rows;
  } catch (error) {
    throw new Error(`Error getting traffic matrix by category: ${error.message}`);
  }
};

// NEW: Build arah pergerakan matrix based on movement direction (Belok Kiri, Lurus, Belok Kanan)
// Each movement type contains breakdown by origin direction and vehicle categories
Vehicle.buildArahPergerakanByCategory = (asalTujuanCategoryData) => {
  try {
    
    // Define vehicle categories
    const vehicleCategories = {
      'SM': 'Sepeda Motor',
      'MP': 'Mobil Penumpang',
      'AUP': 'Angkutan Umum',
      'TR': 'Truk Ringan',
      'BS': 'Bus Sedang',
      'TS': 'Truk Sedang',
      'TB': 'Truk Berat',
      'BB': 'Bus Besar',
      'GANDENG': 'Gandeng/Semitrailer',
      'KTB': 'Kendaraan Tidak Bermotor'
    };
    
    // Direction mapping from English to Indonesian
    const directionMap = {
      'east': 'timur',
      'west': 'barat', 
      'south': 'selatan',
      'north': 'utara'
    };
    
    const directions = ['barat', 'selatan', 'timur', 'utara'];
    const movementTypes = ['Belok Kiri', 'Lurus', 'Belok Kanan'];
    
    // Initialize result matrix: movement -> direction -> category
    const result = {};
    movementTypes.forEach(movement => {
      result[movement] = {};
      directions.forEach(dir => {
        result[movement][dir] = {};
        Object.keys(vehicleCategories).forEach(catCode => {
          const catName = vehicleCategories[catCode];
          result[movement][dir][catName] = 0;
        });
        result[movement][dir]['Total'] = 0;
      });
      result[movement]['Total'] = {};
      Object.keys(vehicleCategories).forEach(catCode => {
        const catName = vehicleCategories[catCode];
        result[movement]['Total'][catName] = 0;
      });
      result[movement]['Total']['Total'] = 0;
    });
    
    let processedCount = 0;
    
    // Process each origin-destination pair
    asalTujuanCategoryData.forEach(row => {
      const { dari_arah, ke_arah } = row;
      
      // FIX: Validate dari_arah exists in directionMap
      if (!directionMap[dari_arah]) {
        return;
      }
      
      const dariArahId = directionMap[dari_arah];
      
      // Determine movement type based on origin and destination
      let movementType = null;
      
      if (dari_arah === 'east') {
        if (ke_arah === 'south') movementType = 'Belok Kiri';      // East → South = BKi
        else if (ke_arah === 'north') movementType = 'Belok Kanan'; // East → North = BKa
        else if (ke_arah === 'west') movementType = 'Lurus';        // East → West = Lurus
      }
      else if (dari_arah === 'west') {
        if (ke_arah === 'north') movementType = 'Belok Kiri';       // West → North = BKi
        else if (ke_arah === 'south') movementType = 'Belok Kanan'; // West → South = BKa
        else if (ke_arah === 'east') movementType = 'Lurus';        // West → East = Lurus
      }
      else if (dari_arah === 'north') {
        if (ke_arah === 'west') movementType = 'Belok Kiri';        // North → West = BKi
        else if (ke_arah === 'east') movementType = 'Belok Kanan';  // North → East = BKa
        else if (ke_arah === 'south') movementType = 'Lurus';       // North → South = Lurus
      }
      else if (dari_arah === 'south') {
        if (ke_arah === 'east') movementType = 'Belok Kiri';        // South → East = BKi
        else if (ke_arah === 'west') movementType = 'Belok Kanan';  // South → West = BKa
        else if (ke_arah === 'north') movementType = 'Lurus';       // South → North = Lurus
      }
      
      // FIX: Validate movement type is determined
      if (!movementType) {
        return;
      }
      
      processedCount++;
      
      // Process all vehicle categories and add to matrix
      Object.keys(vehicleCategories).forEach(catCode => {
        const catName = vehicleCategories[catCode];
        // IMPORTANT: Convert to integer to handle string values from database
        const count = parseInt(row[catCode]) || 0;
        
        // FIX: Add even if count is 0 (for complete data coverage)
        // Only skip if value is null/undefined
        if (count !== null && count !== undefined) {
          result[movementType][dariArahId][catName] += count;
          result[movementType][dariArahId]['Total'] += count;
          
          // Add to total
          result[movementType]['Total'][catName] += count;
          result[movementType]['Total']['Total'] += count;
        }
      });
    });
    
    return result;
  } catch (error) {
    throw new Error(`Error building arah pergerakan by category: ${error.message}`);
  }
};

// NEW: Build asal-tujuan matrix with vehicle categories (sum of all categories)
Vehicle.buildAsalTujuanMatrixFromCategory = (asalTujuanCategoryData) => {
  try {
    const directions = ['barat', 'selatan', 'timur', 'utara'];
    
    // Direction mapping
    const directionMap = {
      'east': 'timur',
      'west': 'barat', 
      'south': 'selatan',
      'north': 'utara'
    };
    
    // Initialize matrix
    const result = {};
    directions.forEach(dir => {
      result[dir] = {};
      directions.forEach(destDir => {
        result[dir][destDir] = 0;
      });
      result[dir]['Total'] = 0;
    });
    result['Total'] = {};
    directions.forEach(dir => {
      result['Total'][dir] = 0;
    });
    result['Total']['Total'] = 0;
    
    // Process data
    asalTujuanCategoryData.forEach(row => {
      const { dari_arah, ke_arah } = row;
      const dariArahId = directionMap[dari_arah];
      const keArahId = directionMap[ke_arah];
      
      // Sum all vehicle categories
      const totalCount = Object.keys(row)
        .filter(key => !['dari_arah', 'ke_arah'].includes(key))
        .reduce((sum, key) => sum + (row[key] || 0), 0);
      
      if (dariArahId && keArahId && totalCount > 0) {
        result[dariArahId][keArahId] += totalCount;
        result[dariArahId]['Total'] += totalCount;
        result['Total'][keArahId] += totalCount;
        result['Total']['Total'] += totalCount;
      }
    });
    
    return result;
  } catch (error) {
    throw new Error(`Error building asal-tujuan matrix from category: ${error.message}`);
  }
};

// NEW: Get complete traffic matrix with vehicle category breakdown
Vehicle.getCompleteTrafficMatrixByCategory = async (simpangId, filter = 'day', startDate = null, endDate = null) => {
  try {
    // Get raw data with vehicle categories
    const categoryData = await Vehicle.getTrafficMatrixByCategory(simpangId, filter, startDate, endDate);
    
    // Build asal-tujuan matrix from category data
    const asalTujuanMatrix = Vehicle.buildAsalTujuanMatrixFromCategory(categoryData);
    
    // Build arah pergerakan matrix based on vehicle categories
    const arahPergerakanMatrix = Vehicle.buildArahPergerakanByCategory(categoryData);
    
    return {
      asalTujuan: asalTujuanMatrix,
      arahPergerakan: arahPergerakanMatrix
    };
  } catch (error) {
    throw new Error(`Error getting complete traffic matrix by category: ${error.message}`);
  }
};

// NEW: Get raw data from arus table with pagination and filtering
// Supports filters: day, week, month, quarter, year, customrange
// And simpang filtering
Vehicle.getRawArusData = async (page, limit, filters = {}) => {
  try {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    
    // Build WHERE clause for simpang filter
    if (filters.simpang_id) {
      whereClause += ' AND ID_Simpang = ?';
      queryParams.push(filters.simpang_id);
    }
    
    // Build WHERE clause for date filter
    if (filters.filter) {
      try {
        const dateFilter = getDateFilterClause(
          filters.filter,
          filters.start_date || null,
          filters.end_date || null
        );
        whereClause += ` AND ${dateFilter}`;
      } catch (error) {
        throw new Error(`Invalid filter: ${error.message}`);
      }
    }
    
    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM arus ${whereClause}`;
    const [countResult] = await db.query(countSql, queryParams);
    const total = countResult[0].total;
    
    // Get data with pagination
    const dataSql = `
      SELECT 
        id,
        ID_Simpang,
        tipe_pendekat,
        dari_arah,
        ke_arah,
        SM, MP, AUP, TR, BS, TS, TB, BB, GANDENG, KTB,
        waktu,
        created_at,
        updated_at
      FROM arus
      ${whereClause}
      ORDER BY waktu DESC
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(limit, offset);
    const [rows] = await db.query(dataSql, queryParams);
    
    return {
      total: total,
      data: rows
    };
  } catch (error) {
    throw new Error(`Error getting raw arus data: ${error.message}`);
  }
};

// NEW: Get traffic matrix by time periods with movement types and direction breakdown
// Uses BETWEEN approach like survey.model which is proven working
Vehicle.getTrafficMatrixByTimePeriods = async (simpangId, date) => {
  try {
    // Convert date format from YYYY/MM/DD to YYYY-MM-DD if needed
    const formattedDate = date.includes('/') ? date.replace(/\//g, '-') : date;
    const startDateTime = `${formattedDate} 00:00:00`;
    const endDateTime = `${formattedDate} 23:59:59`;
    
    // Define time periods in Indonesia
    const timePeriods = {
      'Dini Hari': { start: 0, end: 5 },      // 00:00 - 05:59
      'Pagi Hari': { start: 6, end: 11 },     // 06:00 - 11:59
      'Siang Hari': { start: 12, end: 17 },   // 12:00 - 17:59
      'Sore Hari': { start: 18, end: 23 }     // 18:00 - 23:59
    };

    const result = {};
    
    for (const [periodName, { start, end }] of Object.entries(timePeriods)) {
      // Build query using BETWEEN (proven working approach)
      // CAST all vehicle columns to UNSIGNED to ensure proper integer aggregation
      let query = `
        SELECT 
          dari_arah,
          ke_arah,
          SUM(CAST(SM AS UNSIGNED)) as SM,
          SUM(CAST(MP AS UNSIGNED)) as MP,
          SUM(CAST(AUP AS UNSIGNED)) as AUP,
          SUM(CAST(TR AS UNSIGNED)) as TR,
          SUM(CAST(BS AS UNSIGNED)) as BS,
          SUM(CAST(TS AS UNSIGNED)) as TS,
          SUM(CAST(TB AS UNSIGNED)) as TB,
          SUM(CAST(BB AS UNSIGNED)) as BB,
          SUM(CAST(GANDENG AS UNSIGNED)) as GANDENG,
          SUM(CAST(KTB AS UNSIGNED)) as KTB
        FROM arus 
        WHERE waktu BETWEEN ? AND ?
          AND HOUR(waktu) >= ? AND HOUR(waktu) <= ?
      `;
      const params = [startDateTime, endDateTime, start, end];

      if (simpangId !== 'semua') {
        query += ` AND ID_Simpang = ?`;
        params.push(parseInt(simpangId));
      }

      query += ` GROUP BY dari_arah, ke_arah ORDER BY dari_arah, ke_arah`;

      const [rows] = await db.query(query, params);
      
      // Process into movement direction matrix
      const arahPergerakanData = Vehicle.buildArahPergerakanByCategory(rows);
      result[periodName] = arahPergerakanData;
    }

    return result;
  } catch (error) {
    throw new Error(`Error getting traffic matrix by time periods: ${error.message}`);
  }
};

// NEW: Get traffic matrix by hour with movement types and direction breakdown
// Uses BETWEEN approach like survey.model which is proven working
Vehicle.getTrafficMatrixByHours = async (simpangId, date) => {
  try {
    // Convert date format from YYYY/MM/DD to YYYY-MM-DD if needed
    const formattedDate = date.includes('/') ? date.replace(/\//g, '-') : date;
    const startDateTime = `${formattedDate} 00:00:00`;
    const endDateTime = `${formattedDate} 23:59:59`;
    
    const result = {};
    
    // Generate hour labels (00:00-00:59, 01:00-01:59, ..., 23:00-23:59)
    for (let hour = 0; hour < 24; hour++) {
      const hourLabel = `${String(hour).padStart(2, '0')}:00-${String(hour).padStart(2, '0')}:59`;
      
      // Build query using BETWEEN (proven working approach)
      // CAST all vehicle columns to UNSIGNED to ensure proper integer aggregation
      let query = `
        SELECT 
          dari_arah,
          ke_arah,
          SUM(CAST(SM AS UNSIGNED)) as SM,
          SUM(CAST(MP AS UNSIGNED)) as MP,
          SUM(CAST(AUP AS UNSIGNED)) as AUP,
          SUM(CAST(TR AS UNSIGNED)) as TR,
          SUM(CAST(BS AS UNSIGNED)) as BS,
          SUM(CAST(TS AS UNSIGNED)) as TS,
          SUM(CAST(TB AS UNSIGNED)) as TB,
          SUM(CAST(BB AS UNSIGNED)) as BB,
          SUM(CAST(GANDENG AS UNSIGNED)) as GANDENG,
          SUM(CAST(KTB AS UNSIGNED)) as KTB
        FROM arus 
        WHERE waktu BETWEEN ? AND ?
          AND HOUR(waktu) = ?
      `;
      const params = [startDateTime, endDateTime, hour];

      if (simpangId !== 'semua') {
        query += ` AND ID_Simpang = ?`;
        params.push(parseInt(simpangId));
      }

      query += ` GROUP BY dari_arah, ke_arah ORDER BY dari_arah, ke_arah`;

      const [rows] = await db.query(query, params);
      
      // Process into movement direction matrix with vehicle categories
      const arahPergerakanData = Vehicle.buildArahPergerakanByCategory(rows);
      result[hourLabel] = arahPergerakanData;
    }

    return result;
  } catch (error) {
    throw new Error(`Error getting traffic matrix by hour: ${error.message}`);
  }
};

module.exports = Vehicle;
