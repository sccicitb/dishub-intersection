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

Intersection.getFlowByClassification = async (simpang_id, start_date, end_date) => {
    try {
        const isAll = simpang_id === 'semua';

        let sql = `
            SELECT 
                SUM(COALESCE(SM, 0)) as SM,
                SUM(COALESCE(MP, 0)) as MP,
                SUM(COALESCE(AUP, 0)) as AUP,
                SUM(COALESCE(TR, 0)) as TR,
                SUM(COALESCE(BS, 0)) as BS,
                SUM(COALESCE(TS, 0)) as TS,
                SUM(COALESCE(TB, 0)) as TB,
                SUM(COALESCE(BB, 0)) as BB,
                SUM(COALESCE(GANDENG, 0)) as GANDENG,
                SUM(COALESCE(KTB, 0)) as KTB
            FROM arus
            WHERE waktu BETWEEN ? AND ?
        `;

        let params = [start_date, end_date];

        if (!isAll) {
            sql += ` AND ID_Simpang = ?`;
            params.push(simpang_id);
        }

        const [rows] = await db.query(sql, params);
        console.log("Classification Query Result:", rows);
        console.log("Params yang dikirim ke SQL:", params);
        const data = rows[0] || {};

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

        return classifications.map(item => ({
            ...item,
            total_IN: item.count,
            total_OUT: item.count
        }));

    } catch (error) {
        console.error("Database Error:", error.message);
        throw error;
    }
};

// New: Get Total In/Out Flow
Intersection.getTotalFlow = async (simpang_id, startDate, endDate) => {
    try {
        let sql = `
            SELECT COUNT(*) as total_volume 
            FROM arus 
            WHERE waktu BETWEEN ? AND ?
        `;

        if (simpang_id && simpang_id !== 'semua') {
            sql += ` AND ID_Simpang = ?`;
            params.push(simpang_id);
        }

        const [rows] = await db.query(sql, [startDate, endDate]);
        const total = rows[0].total_volume || 0;

        return {
            total_IN: parseInt(total),
            total_OUT: parseInt(total)
        };

    } catch (error) {
        throw error;
    }
};
module.exports = Intersection;
