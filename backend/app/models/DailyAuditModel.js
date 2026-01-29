const db = require('../config/db');

const DailyAuditModel = {
  getByMonthAgregateDay: async (year, month, simpangId) => {
    const monthStr = month.toString().padStart(2, '0');
    // Rentang manual agar tidak pakai fungsi DATE/YEAR di WHERE
    const startDate = `${year}-${monthStr}-01 00:00:00`;
    // Asumsi max 31 hari, SQL engine akan otomatis handle jika tanggalnya lewat
    // Untuk amannya, kita bisa hitung end date di JS
    const lastDay = new Date(year, month, 0).getDate(); 
    const endDate = `${year}-${monthStr}-${lastDay} 23:59:59`;
    
    let query = `
      SELECT 
        WEEKDAY(waktu) as index_hari,
        MAX(DAYNAME(waktu)) as nama_hari,
        COUNT(DISTINCT DATE(waktu)) as jumlah_hari_kejadian,
        SUM(COALESCE(SM,0)+COALESCE(MP,0)+COALESCE(AUP,0)+COALESCE(TR,0)+COALESCE(BS,0)+COALESCE(TS,0)+COALESCE(TB,0)+COALESCE(BB,0)+COALESCE(GANDENG,0)+COALESCE(KTB,0)) AS total_lalin,
        SUM(CASE 
            WHEN (ke_arah IS NOT NULL AND ke_arah != '') 
            THEN (COALESCE(SM,0)+COALESCE(MP,0)+COALESCE(AUP,0)+COALESCE(TR,0)+COALESCE(BS,0)+COALESCE(TS,0)+COALESCE(TB,0)+COALESCE(BB,0)+COALESCE(GANDENG,0)+COALESCE(KTB,0)) 
            ELSE 0 
        END) AS volume_terdefinisi,
        SUM(CASE 
            WHEN (ke_arah IS NULL OR ke_arah = '') 
            THEN (COALESCE(SM,0)+COALESCE(MP,0)+COALESCE(AUP,0)+COALESCE(TR,0)+COALESCE(BS,0)+COALESCE(TS,0)+COALESCE(TB,0)+COALESCE(BB,0)+COALESCE(GANDENG,0)+COALESCE(KTB,0)) 
            ELSE 0 
        END) AS volume_null
      FROM arus 
      WHERE waktu >= ? AND waktu <= ?
    `;

    const params = [startDate, endDate];

    if (simpangId && simpangId !== 'semua' && simpangId !== 0 && simpangId !== '0') {
      query += ` AND simpang_id = ?`;
      params.push(simpangId);
    }

    query += ` GROUP BY WEEKDAY(waktu) ORDER BY WEEKDAY(waktu) ASC`;

    try {
      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  },
    
  getByMonth: async (year, month, simpangId) => {
     const monthStr = month.toString().padStart(2, '0');
     const yearStr = year.toString();
     // Optimasi string matching LIKE 'YYYY-MM%' biasanya lebih cepat dari YEAR() AND MONTH() jika kolom waktu terindeks default (primary key usually indexed)
     const likePattern = `${yearStr}-${monthStr}%`;

    let query = `
      SELECT 
        DATE(waktu) as tanggal,
        DAYNAME(waktu) as nama_hari,
        WEEKDAY(waktu) as index_hari,
        SUM(COALESCE(SM,0)+COALESCE(MP,0)+COALESCE(AUP,0)+COALESCE(TR,0)+COALESCE(BS,0)+COALESCE(TS,0)+COALESCE(TB,0)+COALESCE(BB,0)+COALESCE(GANDENG,0)+COALESCE(KTB,0)) AS total_lalin
        -- (Tambahkan kolom lain sesuai kebutuhan)
      FROM arus 
      -- Opsi lain selain range: LIKE (kadang lebih cepat tergantung engine)
      WHERE CAST(waktu AS CHAR) LIKE ?
    `;

    const params = [likePattern];

    if (simpangId && simpangId !== 'semua' && simpangId !== 0 && simpangId !== '0') {
      query += ` AND simpang_id = ?`;
      params.push(simpangId);
    }

    query += ` GROUP BY DATE(waktu) ORDER BY DATE(waktu) ASC`;
     
    try {
      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
       throw error;
    }
  }
};
module.exports = DailyAuditModel;