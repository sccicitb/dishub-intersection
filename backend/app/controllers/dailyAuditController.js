const DailyAuditModel = require('../models/DailyAuditModel');

// Helper: Menghitung jumlah hari spesifik (misal Senin) dalam satu bulan kalender
const countRealWeekdays = (year, month, weekdayIndex0To6) => {
  // weekdayIndex0To6: 0=Senin ... 6=Minggu
  // JS Date.getDay(): 0=Minggu, 1=Senin ... 6=Sabtu
  
  // Konversi 0(Senin) -> 1(Senin JS), 6(Minggu) -> 0(Minggu JS)
  const targetJsDay = weekdayIndex0To6 === 6 ? 0 : weekdayIndex0To6 + 1;
  
  let count = 0;
  // Mulai tanggal 1
  let date = new Date(year, month - 1, 1); 
  
  // Loop sampai bulan berubah
  while (date.getMonth() === month - 1) {
    if (date.getDay() === targetJsDay) {
      count++;
    }
    date.setDate(date.getDate() + 1);
  }
  return count;
};

const DailyAuditController = {
  getAuditByMonth: async (req, res) => {
    try {
      const { year, month, simpang_id } = req.query;
      
      if (!year || !month) {
        return res.status(400).json({ status: 'error', message: 'Parameter year dan month diperlukan' });
      }

      const selectedYear = parseInt(year);
      const selectedMonth = parseInt(month);
      
      const rawData = await DailyAuditModel.getByMonthAgregateDay(selectedYear, selectedMonth, simpang_id);

      const dayTemplate = [
        { id: 0, label: 'Senin' },
        { id: 1, label: 'Selasa' },
        { id: 2, label: 'Rabu' },
        { id: 3, label: 'Kamis' },
        { id: 4, label: 'Jumat' },
        { id: 5, label: 'Sabtu' },
        { id: 6, label: 'Minggu' }
      ];

      const finalData = dayTemplate.map(day => {
        const found = rawData.find(row => row.index_hari === day.id);
        
        // HITUNG JUMLAH HARI REAL DI KALENDER
        const days_count_real = countRealWeekdays(selectedYear, selectedMonth, day.id);

        if (found) {
          return {
            index_hari: day.id,
            nama_hari: day.label,
            jumlah_kejadian_data: found.jumlah_hari_kejadian, // Jumlah berdasarkan data yang masuk
            days_count_real: days_count_real,                 // Jumlah hari sebenarnya di kalender
            volume_terdefinisi: parseFloat(found.volume_terdefinisi),
            volume_null: parseFloat(found.volume_null),
            total_lalin: parseFloat(found.total_lalin),
            // Rata-rata sekarang bisa dibagi dengan real count agar lebih akurat secara statistik (opsional, tergantung kebutuhan bisnis)
            rata_rata_lalin: days_count_real > 0 ? (parseFloat(found.total_lalin) / days_count_real) : 0
          };
        } else {
          return {
            index_hari: day.id,
            nama_hari: day.label,
            jumlah_kejadian_data: 0,
            days_count_real: days_count_real, // Tetap muncul meski data 0
            volume_terdefinisi: 0,
            volume_null: 0,
            total_lalin: 0,
            rata_rata_lalin: 0
          };
        }
      });

      const grandTotal = finalData.reduce((acc, curr) => {
        return {
          volume_terdefinisi: acc.volume_terdefinisi + curr.volume_terdefinisi,
          volume_null: acc.volume_null + curr.volume_null,
          total_lalin: acc.total_lalin + curr.total_lalin
        };
      }, { volume_terdefinisi: 0, volume_null: 0, total_lalin: 0 });

      res.json({
        status: 'success',
        filter: {
          year: selectedYear,
          month: selectedMonth,
          simpang_id: simpang_id || 'semua'
        },
        data: finalData,
        summary: grandTotal
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }
};

module.exports = DailyAuditController;