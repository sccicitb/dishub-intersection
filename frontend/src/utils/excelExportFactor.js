import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// --- HELPER STYLES ---
const applyHeaderStyle = (row, colorHex) => {
  row.height = 30;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorHex } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });
};

const applyBorderStr = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

// --- 1. EXPORT SEASONAL FACTOR ---
export const exportSeasonalFactor = async ({ data, yearlyStats, year, simpangId }) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Seasonal Factor');

  // Info Header
  worksheet.addRow(['Laporan Faktor Musiman (Seasonal Factor)']);
  worksheet.addRow(['Tahun', year]);
  worksheet.addRow(['Lokasi', simpangId === 'semua' ? 'Semua Simpang' : `Simpang ${simpangId}`]);
  worksheet.addRow([]);

  // Table Header
  const headerRow = worksheet.addRow([
    'Bulan', 
    'Jumlah hari dalam\nsatu bulan (hari)', 
    'Jumlah volume lalin dalam\nsatu bulan (kend/bln)', 
    'LHR (kend/hari)', 
    'Faktor Musiman (SF)'
  ]);
  
  applyHeaderStyle(headerRow, 'FF4F81BD'); // Blue

  // Data
  data.forEach((row) => {
    const r = worksheet.addRow([
      row.bulan_label,
      row.days_count,
      row.volume_terdefinisi,
      row.rata_rata_harian,
      parseFloat(row.faktor_musiman)
    ]);
    
    r.getCell(2).alignment = { horizontal: 'center' };
    r.getCell(3).numFmt = '#,##0';
    r.getCell(4).numFmt = '#,##0.00';
    r.getCell(5).numFmt = '0.000';
    r.getCell(5).font = { bold: true };
    r.eachCell(cell => cell.border = applyBorderStr);
  });

  // Footer
  if (yearlyStats) {
    const footerRow = worksheet.addRow([
      'RATA-RATA / TOTAL TAHUNAN',
      yearlyStats.total_days,
      yearlyStats.total_volume_terdefinisi,
      yearlyStats.yearly_average_daily,
      '-'
    ]);
    footerRow.font = { bold: true };
    footerRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
      cell.border = applyBorderStr;
    });
    footerRow.getCell(3).numFmt = '#,##0';
    footerRow.getCell(4).numFmt = '#,##0.00';
  }

  worksheet.columns = [{ width: 20 }, { width: 30 }, { width: 40 }, { width: 25 }, { width: 25 }];
  
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `SeasonalFactor_${year}_${simpangId}.xlsx`);
};

// --- 2. EXPORT WEEKLY FACTOR ---
export const exportWeeklyFactor = async ({ data, yearlyStats, year, simpangId, dayLabel }) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Weekly Factor');

  worksheet.addRow(['Laporan Faktor Musiman Harian']);
  worksheet.addRow(['Tahun', year]);
  worksheet.addRow(['Hari', dayLabel]);
  worksheet.addRow(['Lokasi', simpangId === 'semua' ? 'Semua Simpang' : `Simpang ${simpangId}`]);
  worksheet.addRow([]);

  const headerRow = worksheet.addRow([
    'Bulan', 
    `Hari ${dayLabel}\n(Data Survei)`, 
    `Hari ${dayLabel}\n(Kalender Real)`,
    'Total Volume\n(kend/bln)', 
    'Rata-rata Harian\n(kend/hari)', 
    'Faktor Musiman'
  ]);
  
  applyHeaderStyle(headerRow, 'FF4F81BD');

  data.forEach((row) => {
    const daysData = row.days_count_data !== undefined ? row.days_count_data : row.days_count;
    const daysReal = row.days_count_real || 0;

    const r = worksheet.addRow([
      row.bulan_label,
      daysData,
      daysReal,
      row.volume_terdefinisi,
      row.rata_rata_harian,
      parseFloat(row.faktor_musiman)
    ]);
    r.getCell(2).alignment = { horizontal: 'center' };
    r.getCell(3).alignment = { horizontal: 'center' };
    r.getCell(4).numFmt = '#,##0';
    r.getCell(5).numFmt = '#,##0.00';
    r.getCell(6).numFmt = '0.000';
    r.eachCell(cell => cell.border = applyBorderStr);
  });

  if (yearlyStats) {
    const footerRow = worksheet.addRow([
      'TOTAL / RATA-RATA',
      yearlyStats.total_days_data || yearlyStats.total_days,
      yearlyStats.total_days_real || '-',
      yearlyStats.total_volume_terdefinisi,
      yearlyStats.yearly_average_daily,
      '-'
    ]);
    footerRow.font = { bold: true };
    footerRow.eachCell(c => {
       c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
       c.border = applyBorderStr;
    });
    footerRow.getCell(4).numFmt = '#,##0';
    footerRow.getCell(5).numFmt = '#,##0.00';
  }

  worksheet.columns = [{ width: 20 }, { width: 15 }, { width: 15 }, { width: 25 }, { width: 25 }, { width: 20 }];
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `WeeklyFactor_${dayLabel}_${year}.xlsx`);
};

// --- 3. EXPORT DAILY VOLUME ---
export const exportDailyVolume = async ({ data, summary, year, monthLabel, simpangId }) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Daily Volume');

  worksheet.addRow(['Laporan Volume Harian (Agregat per Hari)']);
  worksheet.addRow(['Periode', `${monthLabel} ${year}`]);
  worksheet.addRow(['Lokasi', simpangId === 'semua' ? 'Semua Simpang' : `Simpang ${simpangId}`]);
  worksheet.addRow([]);

  const headerRow = worksheet.addRow([
    'Nama Hari',
    'Jumlah Hari\n(Data Survei)',
    'Jumlah Hari\n(Kalender Real)',
    'Total Volume Lalin\n(kend/bln)',
    `LHR ${monthLabel}\n(kend/hari)`,
    'Faktor Harian (DF)'
  ]);

  applyHeaderStyle(headerRow, 'FFED7D31'); // Orange

  // Hitung ulang logic MADT untuk keperluan loop di excel
  const totalDaysSurvei = data.reduce((acc, curr) => acc + (curr.jumlah_kejadian_data || curr.jumlah_kejadian || 0), 0);
  const totalDaysReal = data.reduce((acc, curr) => acc + (curr.days_count_real || 0), 0);
  const madt = (summary && totalDaysSurvei > 0) ? summary.total_lalin / totalDaysSurvei : 0;

  data.forEach((row) => {
    const daysData = row.jumlah_kejadian_data !== undefined ? row.jumlah_kejadian_data : row.jumlah_kejadian;
    const daysReal = row.days_count_real || 0;
    const lhrHari = daysData > 0 ? row.total_lalin / daysData : 0;
    const dailyFactor = madt > 0 ? lhrHari / madt : 0;

    const r = worksheet.addRow([
      row.nama_hari,
      daysData,
      daysReal,
      row.total_lalin,
      lhrHari,
      parseFloat(dailyFactor.toFixed(3))
    ]);

    r.getCell(2).alignment = { horizontal: 'center' };
    r.getCell(3).alignment = { horizontal: 'center' };
    r.getCell(4).numFmt = '#,##0';
    r.getCell(5).numFmt = '#,##0';
    r.getCell(6).numFmt = '0.000';
    r.eachCell(c => c.border = applyBorderStr);
  });

  if (summary) {
    const footerRow = worksheet.addRow([
      'TOTAL',
      totalDaysSurvei,
      totalDaysReal,
      summary.total_lalin,
      madt,
      '-'
    ]);
    footerRow.font = { bold: true };
    footerRow.eachCell(c => {
       c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
       c.border = applyBorderStr;
    });
    footerRow.getCell(4).numFmt = '#,##0';
    footerRow.getCell(5).numFmt = '#,##0';
  }

  worksheet.columns = [{ width: 20 }, { width: 15 }, { width: 15 }, { width: 25 }, { width: 25 }, { width: 20 }];
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `DailyVolume_${monthLabel}_${year}.xlsx`);
};