const db = require('../config/db');

const WeeklyAuditModel = {
  getByWeekday: async (year, weekday, simpangId) => {
    // Optimasi Logic: Gunakan string comparison untuk tanggal, lebih cepat daripada YEAR() function
    const startDate = `${year}-01-01 00:00:00`;
    const endDate = `${year}-12-31 23:59:59`;

    let query = `
      SELECT 
        MONTH(waktu) as bulan,
        COUNT(DISTINCT DATE(waktu)) as days_count,
        SUM(CASE 
            WHEN (ke_arah IS NOT NULL AND ke_arah != '') 
            THEN (COALESCE(SM,0)+COALESCE(MP,0)+COALESCE(AUP,0)+COALESCE(TR,0)+COALESCE(BS,0)+COALESCE(TS,0)+COALESCE(TB,0)+COALESCE(BB,0)+COALESCE(GANDENG,0)+COALESCE(KTB,0)) 
            ELSE 0 
        END) AS volume_terdefinisi,
        SUM(COALESCE(SM,0)+COALESCE(MP,0)+COALESCE(AUP,0)+COALESCE(TR,0)+COALESCE(BS,0)+COALESCE(TS,0)+COALESCE(TB,0)+COALESCE(BB,0)+COALESCE(GANDENG,0)+COALESCE(KTB,0)) AS total_volume
      FROM arus 
      WHERE waktu >= ? AND waktu <= ? 
      AND WEEKDAY(waktu) = ?
    `;

    const params = [startDate, endDate, weekday];

    if (simpangId && simpangId !== 'semua' && simpangId !== 0 && simpangId !== '0') {
      query += ` AND simpang_id = ?`;
      params.push(simpangId);
    }

    query += ` GROUP BY MONTH(waktu) ORDER BY MONTH(waktu) ASC`;

    try {
      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }
};
module.exports = WeeklyAuditModel;