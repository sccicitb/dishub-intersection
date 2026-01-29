const db = require("../config/db");

const TrafficAudit = function(data) {};

TrafficAudit.getVolumeByDirectionStatus = async (year, simpangId, result) => {
  try {
    let query = `
      SELECT 
        YEAR(waktu) AS Tahun,
        MONTH(waktu) AS Bulan,
        -- Volume arah yang jelas (Valid Direction)
        SUM(CASE 
            WHEN (ke_arah IS NOT NULL AND ke_arah != '') 
            THEN (SM+MP+AUP+TR+BS+TS+TB+BB+GANDENG+KTB) 
            ELSE 0 
        END) AS Volume_Arah_Terdefinisi,
        
        -- Volume arah yang NULL atau KOSONG (Undefined Direction)
        SUM(CASE 
            WHEN (ke_arah IS NULL OR ke_arah = '') 
            THEN (SM+MP+AUP+TR+BS+TS+TB+BB+GANDENG+KTB) 
            ELSE 0 
        END) AS Volume_Arah_NULL,
        
        -- Total Gabungan
        SUM(SM+MP+AUP+TR+BS+TS+TB+BB+GANDENG+KTB) AS Total_Volume_Bulanan
      FROM arus
      WHERE waktu IS NOT NULL 
    `;

    const queryParams = [];

    // Filter by Year (Required/Default)
    if (year) {
      query += ` AND YEAR(waktu) = ?`;
      queryParams.push(year);
    }

    // Filter by Simpang (Optional)
    if (simpangId && simpangId !== 'semua') {
      query += ` AND ID_Simpang = ?`;
      queryParams.push(simpangId);
    }

    // Grouping and Ordering
    query += `
      GROUP BY YEAR(waktu), MONTH(waktu)
      ORDER BY MONTH(waktu) ASC;
    `;

    const [rows] = await db.query(query, queryParams);
    result(null, rows);

  } catch (err) {
    console.error("Error in TrafficAudit.getVolumeByDirectionStatus: ", err);
    result(err, null);
  }
};

module.exports = TrafficAudit;
