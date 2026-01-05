import * as XLSX from 'xlsx';
import { vehicles } from '@/lib/apiAccess';

/**
 * Get display name untuk filter type
 */
const getFilterDisplayName = (filterType) => {
  const filterNames = {
    'day': 'Hari Ini',
    'week': 'Minggu Ini',
    'month': 'Bulan Ini',
    'quarter': 'Quarter Ini',
    'year': 'Tahun Ini',
    'customrange': 'Custom Range'
  };
  return filterNames[filterType] || filterType;
};

export const exportSurveyDataToExcel = async (startDate, endDate, simpangId, fileName = 'survey_data.xlsx', filterType = 'customrange', simpangName = '') => {
  try {
    console.log('📥 Starting export with params:', { startDate, endDate, simpangId, fileName, filterType, simpangName });
    
    // Fetch data dari ketiga API
    const [arahData, tipeData, masukKeluarData] = await Promise.all([
      vehicles.getByArah('customrange', simpangId, startDate, endDate),
      vehicles.getByTipe('customrange', simpangId, startDate, endDate),
      vehicles.getAll('customrange', simpangId, startDate, endDate),
    ]);

    // Siapkan data untuk setiap sheet - handle nested data structure
    const arahSheetData = formatArahData(arahData?.data?.data || []);
    const tipeSheetData = formatTipeData(tipeData?.data?.data || []);
    const masukKeluarSheetData = formatMasukKeluarData(masukKeluarData?.data?.data || []);

    // Buat sheet Info dengan periode filter
    const infoSheetData = [
      { 'Informasi': 'Laporan Data Lalu Lintas' },
      { 'Informasi': '' },
      { 'Informasi': 'Periode Filter', 'Nilai': filterType === 'customrange' ? 'Custom Range' : getFilterDisplayName(filterType) },
      { 'Informasi': 'Tanggal Mulai', 'Nilai': startDate },
      { 'Informasi': 'Tanggal Akhir', 'Nilai': endDate },
      { 'Informasi': 'Lokasi (Simpang)', 'Nilai': simpangName || simpangId },
      { 'Informasi': 'Waktu Export', 'Nilai': new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) },
    ];

    // Validasi minimal ada data di salah satu sheet
    if (arahSheetData.length === 0 && tipeSheetData.length === 0 && masukKeluarSheetData.length === 0) {
      console.warn('⚠️ All sheets are empty - proceeding anyway');
    }

    // Buat workbook dengan multiple sheets
    const workbook = XLSX.utils.book_new();

    // Tambah sheet 0: Info
    const infoSheet = XLSX.utils.json_to_sheet(infoSheetData);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Info');
    setColumnWidths(infoSheet);

    // Tambah sheet 1: Masuk/Keluar Arah
    const arahSheet = XLSX.utils.json_to_sheet(arahSheetData.length > 0 ? arahSheetData : [{ 'Arah': 'Tidak ada data', 'Masuk (IN)': 0, 'Keluar (OUT)': 0, 'Total': 0 }]);
    XLSX.utils.book_append_sheet(workbook, arahSheet, 'Masuk Keluar Arah');

    // Tambah sheet 2: Tipe Kendaraan
    const tipeSheet = XLSX.utils.json_to_sheet(tipeSheetData.length > 0 ? tipeSheetData : [{ 'Tipe Kendaraan': 'Tidak ada data', 'Masuk (IN)': 0, 'Keluar (OUT)': 0, 'Total': 0 }]);
    XLSX.utils.book_append_sheet(workbook, tipeSheet, 'Tipe Kendaraan');

    // Tambah sheet 3: Chart Masuk/Keluar
    const masukKeluarSheet = XLSX.utils.json_to_sheet(masukKeluarSheetData.length > 0 ? masukKeluarSheetData : [{ 'Jam/Waktu': 'Tidak ada data', 'Masuk (IN)': 0, 'Keluar (OUT)': 0, 'Total': 0 }]);
    XLSX.utils.book_append_sheet(workbook, masukKeluarSheet, 'Masuk Keluar');

    // Set column width untuk semua sheet
    setColumnWidths(arahSheet);
    setColumnWidths(tipeSheet);
    setColumnWidths(masukKeluarSheet);

    // Download file
    XLSX.writeFile(workbook, fileName);
    
    console.log('✅ Export successful:', fileName);
    return { success: true, message: 'Export berhasil' };
  } catch (error) {
    console.error('❌ Error exporting to Excel:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    return { success: false, message: 'Gagal export Excel: ' + error.message, error };
  }
};

/**
 * Format data Masuk/Keluar Arah
 */
const formatArahData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];

  return data.map(item => ({
    'Arah': item.arah || '-',
    'Masuk (IN)': item.total_IN || 0,
    'Keluar (OUT)': item.total_OUT || 0,
    'Total': (parseInt(item.total_IN || 0) + parseInt(item.total_OUT || 0)).toString(),
  }));
};

/**
 * Format data Tipe Kendaraan
 * Struktur data: setiap item punya field tipe kendaraan (0 atau 1) dan total_IN, total_OUT
 * Jika field = 1, berarti tipe itu ada di row itu dengan IN/OUT sesuai total_IN/total_OUT
 */
const formatTipeData = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('⚠️ Tipe data is empty or not array:', data);
    return [];
  }

  // Mapping tipe kendaraan
  const vehicleTypeMap = {
    'SM': 'Sepeda Motor',
    'MP': 'Mobil Penumpang',
    'AUP': 'Angkutan Umum',
    'TR': 'Truk',
    'BS': 'Bus',
    'TS': 'Truk Sedang',
    'TB': 'Truk Besar',
    'BB': 'Bus Besar',
    'GANDENG': 'Truk Gandeng',
    'KTB': 'Kendaraan Tidak Bermotor'
  };

  const formattedData = [];

  // Iterate setiap item
  data.forEach(item => {
    // Cari field mana yang bernilai 1 (itu adalah tipe kendaraan di row ini)
    for (const [key, value] of Object.entries(item)) {
      if (value === 1 && vehicleTypeMap[key]) {
        // Tipe kendaraan ditemukan, ambil IN dan OUT dari item
        const totalIn = parseInt(item.total_IN) || 0;
        const totalOut = parseInt(item.total_OUT) || 0;
        const total = totalIn + totalOut;

        formattedData.push({
          'Tipe Kendaraan': vehicleTypeMap[key],
          'Masuk (IN)': totalIn,
          'Keluar (OUT)': totalOut,
          'Total': total,
        });

        console.log('✅ Tipe found:', { 
          type: vehicleTypeMap[key], 
          IN: totalIn, 
          OUT: totalOut, 
          total 
        });
        break; // Hanya satu tipe per item
      }
    }
  });

  console.log('📊 Total tipe kendaraan di-process:', formattedData.length);

  return formattedData;
};

/**
 * Format data Masuk/Keluar
 */
const formatMasukKeluarData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];

  return data.map(item => ({
    'Jam/Waktu': item.jam || item.time || item.periode || '-',
    'Masuk (IN)': item.total_IN || item.IN || 0,
    'Keluar (OUT)': item.total_OUT || item.OUT || 0,
    'Total': (parseInt(item.total_IN || item.IN || 0) + parseInt(item.total_OUT || item.OUT || 0)).toString(),
  }));
};

/**
 * Set column width otomatis
 */
const setColumnWidths = (sheet) => {
  if (!sheet['!cols']) {
    sheet['!cols'] = [];
  }

  // Set default width
  const defaultWidth = 15;
  const cols = Object.keys(sheet).filter(key => key.match(/^[A-Z]+1$/));
  cols.forEach((col, idx) => {
    if (!sheet['!cols'][idx]) {
      sheet['!cols'][idx] = { wch: defaultWidth };
    }
  });
};
