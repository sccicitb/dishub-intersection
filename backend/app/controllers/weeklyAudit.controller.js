const WeeklyAuditModel = require('../models/weeklyAudit.model.js');

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

const WeeklyAuditController = {
  getAuditByWeekday: async (req, res) => {
    try {
      const { year, simpang_id, weekday } = req.query;
      
      if (weekday === undefined || weekday === null) {
        return res.status(400).json({ status: 'error', message: 'Parameter weekday diperlukan (0-6)' });
      }

      const selectedYear = parseInt(year) || new Date().getFullYear();
      const selectedWeekday = parseInt(weekday); 

      const rawData = await WeeklyAuditModel.getByWeekday(selectedYear, selectedWeekday, simpang_id);

      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];

      // Reset accumulator tahunan
      let totalAnnualVolume = 0;
      let totalAnnualRealDays = 0; // Total hari real setahun

      const monthlyData = months.map((monthName, index) => {
        const monthIndex = index + 1;
        const found = rawData.find(d => d.bulan === monthIndex);
        
        // HITUNG REAL DAYS COUNT
        const days_count_real = countRealWeekdays(selectedYear, monthIndex, selectedWeekday);

        const days_count_data = found ? found.days_count : 0;
        const volume_terdefinisi = found ? parseFloat(found.volume_terdefinisi) : 0;
        
        totalAnnualVolume += volume_terdefinisi;
        totalAnnualRealDays += days_count_real;

        // Rata-rata Lalin (LHR Bulan)
        // Gunakan days_count_real untuk pembagi jika ingin LHR teoretis, atau days_count_data untuk LHR aktual survei
        // Biasanya LHR (ADT) menggunakan jumlah hari survei (data), tapi untuk normalisasi bisa pakai real.
        // Di sini saya pakai days_count_data agar tidak kecil nilainya jika data cuma sebagian hari.
        const rata_rata_harian = days_count_data > 0 ? (volume_terdefinisi / days_count_data) : 0;

        return {
          bulan: monthIndex,
          bulan_label: monthName,
          days_count_data: days_count_data,
          days_count_real: days_count_real, // Field Baru
          volume_terdefinisi,
          rata_rata_harian 
        };
      });

      // Hitung AADT (Tahunan)
      // Opsi A: Total Volume / Total Hari Survei
       const totalDaysData = monthlyData.reduce((acc, curr) => acc + curr.days_count_data, 0);
       const yearly_average_daily = totalDaysData > 0 ? (totalAnnualVolume / totalDaysData) : 0;

      // Hitung Faktor Musiman
      const finalData = monthlyData.map(row => {
        let faktor_musiman = 0;
        if (yearly_average_daily > 0 && row.rata_rata_harian > 0) {
          faktor_musiman = row.rata_rata_harian / yearly_average_daily;
        }

        return {
          ...row,
          faktor_musiman: faktor_musiman.toFixed(3)
        };
      });

      res.json({
        status: 'success',
        filter: {
          year: selectedYear,
          weekday: selectedWeekday,
          simpang_id: simpang_id || 'semua'
        },
        yearly_stats: {
          total_days_data: totalDaysData,
          total_days_real: totalAnnualRealDays,
          total_volume_terdefinisi: totalAnnualVolume,
          yearly_average_daily: yearly_average_daily
        },
        data: finalData
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }
};

module.exports = WeeklyAuditController;