const db = require("../config/db");

const TrafficVolume = {};

TrafficVolume.getVolumeByMinute = async (startDate, endDate) => {
  try {
    const query = `
      SELECT 
        DATE_FORMAT(waktu, '%Y-%m-%d %H:%i:00') AS Menit,
        
        -- Volume dengan KEDUA arah terdefinisi (data lengkap, paling valid)
        SUM(CASE 
            WHEN (ke_arah IS NOT NULL AND ke_arah != '' AND dari_arah IS NOT NULL AND dari_arah != '') 
            THEN (SM+MP+AUP+TR+BS+TS+TB+BB+GANDENG+KTB) 
            ELSE 0 
        END) AS Volume_Arah_Lengkap,
        
        -- Volume dengan SALAH SATU arah terdefinisi (data parsial, masih berguna)
        SUM(CASE 
            WHEN ((ke_arah IS NOT NULL AND ke_arah != '') OR (dari_arah IS NOT NULL AND dari_arah != ''))
                 AND NOT (ke_arah IS NOT NULL AND ke_arah != '' AND dari_arah IS NOT NULL AND dari_arah != '')
            THEN (SM+MP+AUP+TR+BS+TS+TB+BB+GANDENG+KTB) 
            ELSE 0 
        END) AS Volume_Arah_Parsial,
        
        -- Volume dengan minimal 1 arah terdefinisi (lengkap + parsial)
        SUM(CASE 
            WHEN (ke_arah IS NOT NULL AND ke_arah != '') OR (dari_arah IS NOT NULL AND dari_arah != '')
            THEN (SM+MP+AUP+TR+BS+TS+TB+BB+GANDENG+KTB) 
            ELSE 0 
        END) AS Volume_Arah_Terdefinisi,
        
        -- Volume dengan KEDUA arah NULL (data invalid dari engine deteksi)
        SUM(CASE 
            WHEN (ke_arah IS NULL OR ke_arah = '') AND (dari_arah IS NULL OR dari_arah = '')
            THEN (SM+MP+AUP+TR+BS+TS+TB+BB+GANDENG+KTB) 
            ELSE 0 
        END) AS Volume_Arah_NULL,
        
        -- Total per menit (semua kendaraan terdeteksi)
        SUM(SM+MP+AUP+TR+BS+TS+TB+BB+GANDENG+KTB) AS Total_Lalin_Per_Menit
      FROM arus
      WHERE 
        waktu >= ? 
        AND waktu <= ?
      GROUP BY Menit
      ORDER BY Menit ASC;
    `;

    const [rows] = await db.query(query, [startDate, endDate]);
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports = TrafficVolume;
