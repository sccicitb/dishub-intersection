const TrafficAudit = require("../models/trafficAudit.model.js");

exports.getVolumeByDirectionStatus = (req, res) => {
  const year = req.query.year || new Date().getFullYear(); // Default to current year if not provided
  const simpang_id = req.query.simpang_id || 'semua'; // Default to 'semua'

  TrafficAudit.getVolumeByDirectionStatus(year, simpang_id, (err, data) => {
    if (err) {
      res.status(500).send({
        status: "error",
        message: err.message || "Some error occurred while retrieving traffic volume audit data."
      });
    } else {
      // Best Practice: Normalized Row-based data
      // This is flexible for BOTH Tables and Charts
      
      const normalizedData = [];
      const dataMap = {};
      
      // Map existing data for quick lookup
      if (data && data.length > 0) {
        data.forEach(row => {
          dataMap[row.Bulan] = row;
        });
      }

      // Variables for Yearly Stats & Seasonal Factor
      let grandTotalVolumeTerdefinisi = 0;
      let grandTotalDays = 0;

      // Generate rows for all 12 months (ensure continuity)
      for (let m = 1; m <= 12; m++) {
        const row = dataMap[m];
        
        const volTerdefinisi = row ? (parseInt(row.Volume_Arah_Terdefinisi) || 0) : 0;
        const volNull = row ? (parseInt(row.Volume_Arah_NULL) || 0) : 0;
        const volTotal = row ? (parseInt(row.Total_Volume_Bulanan) || 0) : 0;

        const daysInMonth = new Date(year, m, 0).getDate();
        
        // Accumulate totals for AADT calculation
        grandTotalVolumeTerdefinisi += volTerdefinisi;
        grandTotalDays += daysInMonth; // Will sum to 365/366

        // Calculate average per day (volume terdefinisi / days in month)
        const rataRataHarian = daysInMonth > 0 ? (volTerdefinisi / daysInMonth).toFixed(2) : 0;

        normalizedData.push({
          bulan: m,
          bulan_label: getMonthName(m), // Helper Month Name
          days_count: daysInMonth, // Info useful for frontend
          volume_terdefinisi: volTerdefinisi,
          rata_rata_harian: parseFloat(rataRataHarian), // Average per day based on valid direction volume
          volume_null: volNull,
          total_volume: volTotal,
          // Calculate percentage of valid data for Audit purpose
          persentase_valid: volTotal > 0 
            ? ((row.Volume_Arah_Terdefinisi / row.Total_Volume_Bulanan) * 100).toFixed(2) 
            : "0.00"
        });
      }

      // Calculate Yearly Average Daily Traffic (AADT)
      const yearlyAverageDaily = grandTotalDays > 0 ? (grandTotalVolumeTerdefinisi / grandTotalDays) : 0;

      // Second Pass: Add Seasonal Factor (Faktor Musiman)
      const finalData = normalizedData.map(item => ({
        ...item,
        // Faktor Musiman = Rata-rata Harian Bulan / Rata-rata Harian Setahun
        faktor_musiman: yearlyAverageDaily > 0 
          ? (item.rata_rata_harian / yearlyAverageDaily).toFixed(3) 
          : "0.000"
      }));
      
      res.send({
        status: "success",
        year: year,
        simpang_id: simpang_id,
        yearly_stats: {
          total_volume_terdefinisi: grandTotalVolumeTerdefinisi,
          total_days: grandTotalDays,
          yearly_average_daily: parseFloat(yearlyAverageDaily.toFixed(2))
        },
        data: finalData
      });
    }
  });
};

// Helper function for month names
function getMonthName(monthIndex) {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return months[monthIndex - 1];
}
