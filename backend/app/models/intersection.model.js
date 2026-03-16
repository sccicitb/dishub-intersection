const db = require("../config/db");

const Intersection = {};

// Helper: Date Filter Clause
const getDateFilterClause = (filter, startDate = null, endDate = null) => {
  let dateFilter = '';
  switch (filter) {
    case 'day':
      dateFilter = 'DATE(waktu) = CURRENT_DATE()';
      break;
    case 'week':
      dateFilter = 'YEARWEEK(waktu, 1) = YEARWEEK(CURRENT_DATE(), 1)';
      break;
    case 'month':
      dateFilter = 'MONTH(waktu) = MONTH(CURRENT_DATE()) AND YEAR(waktu) = YEAR(CURRENT_DATE())';
      break;
    case 'year':
      dateFilter = 'YEAR(waktu) = YEAR(CURRENT_DATE())';
      break;
    case 'customrange':
      if (startDate && endDate) {
        dateFilter = `DATE(waktu) BETWEEN '${startDate}' AND '${endDate}'`;
      } else {
        throw new Error("Start date and end date are required for custom range.");
      }
      break;
    default:
      dateFilter = 'DATE(waktu) = CURRENT_DATE()';
  }
  return dateFilter;
};

// Helper: Direction Mapping
const directionMap = {
  'north': 'Utara',
  'south': 'Selatan',
  'east': 'Timur',
  'west': 'Barat'
};

// Helper: Invert Direction Mapping for DB Query
const dbDirectionMap = {
    'Utara': 'north',
    'Selatan': 'south',
    'Timur': 'east',
    'Barat': 'west'
};

Intersection.getFlowByDirection = async (simpangId, filter, startDate, endDate) => {
    try {
        const dateClause = getDateFilterClause(filter, startDate, endDate);
        
        // Simpang specific filter
        // If simpangId is provided, filter by it.
        const simpangClause = simpangId && simpangId !== 'semua' ? `AND ID_Simpang = ${db.escape(simpangId)}` : '';

        // Query to get aggregated counts for each cardinal direction
        // IN: Kendaraan datang DARI arah X (dari_arah = X) -> Masuk ke Simpang
        // OUT: Kendaraan pergi KE arah X (ke_arah = X) -> Keluar dari Simpang
        
        // Note: Logic IN/OUT Intersection
        // IN (Masuk Simpang) = Kendaraan yang datang DARI arah tersebut.
        // OUT (Keluar Simpang) = Kendaraan yang menuju KE arah tersebut.
        
        const sql = `
            SELECT 
                SUM(CASE WHEN dari_arah = 'north' THEN 1 ELSE 0 END) AS in_north,
                SUM(CASE WHEN ke_arah = 'north' THEN 1 ELSE 0 END) AS out_north,
                
                SUM(CASE WHEN dari_arah = 'south' THEN 1 ELSE 0 END) AS in_south,
                SUM(CASE WHEN ke_arah = 'south' THEN 1 ELSE 0 END) AS out_south,
                
                SUM(CASE WHEN dari_arah = 'east' THEN 1 ELSE 0 END) AS in_east,
                SUM(CASE WHEN ke_arah = 'east' THEN 1 ELSE 0 END) AS out_east,
                
                SUM(CASE WHEN dari_arah = 'west' THEN 1 ELSE 0 END) AS in_west,
                SUM(CASE WHEN ke_arah = 'west' THEN 1 ELSE 0 END) AS out_west
            FROM arus
            WHERE ${dateClause} ${simpangClause}
        `;

        const [rows] = await db.query(sql);
        const data = rows[0];

        // Format result array
        const result = [
            {
                arah: 'Utara',
                total_IN: parseInt(data.in_north || 0),
                total_OUT: parseInt(data.out_north || 0)
            },
            {
                arah: 'Selatan',
                total_IN: parseInt(data.in_south || 0),
                total_OUT: parseInt(data.out_south || 0)
            },
            {
                arah: 'Timur',
                total_IN: parseInt(data.in_east || 0),
                total_OUT: parseInt(data.out_east || 0)
            },
            {
                arah: 'Barat',
                total_IN: parseInt(data.in_west || 0),
                total_OUT: parseInt(data.out_west || 0)
            }
        ];

        return result;

    } catch (error) {
        throw error;
    }
};

// New: Get Total In/Out Flow
Intersection.getTotalFlow = async (simpangId, filter, startDate, endDate) => {
    try {
        const dateClause = getDateFilterClause(filter, startDate, endDate);
        const simpangClause = simpangId && simpangId !== 'semua' ? `AND ID_Simpang = ${db.escape(simpangId)}` : '';

        // Total IN = COUNT(*) because every record is an entry event.
        // Total OUT = COUNT(*) because every record is an exit event (unless ke_arah is null, but we assume valid flow).
        // To be safe, we count non-null directions, but usually COUNT(*) is sufficient for total volume.
        
        const sql = `
            SELECT COUNT(*) as total_volume 
            FROM arus 
            WHERE ${dateClause} ${simpangClause}
        `;

        const [rows] = await db.query(sql);
        const total = rows[0].total_volume || 0;

        return {
            total_IN: parseInt(total),
            total_OUT: parseInt(total) // Assuming balanced flow for total intersection events
        };

    } catch (error) {
        throw error;
    }
};

// New: Get Flow by Classification
Intersection.getFlowByClassification = async (simpangId, filter, startDate, endDate) => {
    try {
        const dateClause = getDateFilterClause(filter, startDate, endDate);
        const simpangClause = simpangId && simpangId !== 'semua' ? `AND ID_Simpang = ${db.escape(simpangId)}` : '';

        // Classification columns from arus table
        // We sum the occurrences. Since row usually represents 1 vehicle of a specific type (e.g. SM=1, others=0),
        // summing the column gives the count for that type.
        
        const sql = `
            SELECT 
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
            WHERE ${dateClause} ${simpangClause}
        `;

        const [rows] = await db.query(sql);
        const data = rows[0];
        
        // Map codes to readable names (Optional, can be done in frontend)
        const classifications = [
            { code: 'SM', name: 'Sepeda Motor', count: parseInt(data.SM || 0) },
            { code: 'MP', name: 'Mobil Penumpang', count: parseInt(data.MP || 0) },
            { code: 'AUP', name: 'Angkutan Umum Penumpang', count: parseInt(data.AUP || 0) },
            { code: 'TR', name: 'Truk Ringan', count: parseInt(data.TR || 0) },
            { code: 'BS', name: 'Bus Sedang', count: parseInt(data.BS || 0) },
            { code: 'TS', name: 'Truk Sedang', count: parseInt(data.TS || 0) },
            { code: 'TB', name: 'Truk Besar', count: parseInt(data.TB || 0) },
            { code: 'BB', name: 'Bus Besar', count: parseInt(data.BB || 0) },
            { code: 'GANDENG', name: 'Truk Gandeng', count: parseInt(data.GANDENG || 0) },
            { code: 'KTB', name: 'Kendaraan Tidak Bermotor', count: parseInt(data.KTB || 0) }
        ];
        
        // Return format: Array of objects with IN/OUT (which are same for total intersection flow context)
        return classifications.map(item => ({
            ...item,
            total_IN: item.count,
            total_OUT: item.count
        }));

    } catch (error) {
        throw error;
    }
};

module.exports = Intersection;
