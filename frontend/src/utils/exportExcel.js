import ExcelJS from 'exceljs';
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

    
    // Fetch data dari API
    const [arahData, tipeData, masukKeluarData, rawData] = await Promise.all([
      vehicles.getByArah('customrange', simpangId, startDate, endDate),
      vehicles.getByTipe('customrange', simpangId, startDate, endDate),
      vehicles.getAll('customrange', simpangId, startDate, endDate),
      vehicles.getRawData('customrange', simpangId, startDate, endDate, 1, 500),
    ]);

    // Siapkan data untuk setiap sheet - handle nested data structure
    const arahSheetData = formatArahData(arahData?.data?.data || []);
    const tipeSheetData = formatTipeData(tipeData?.data?.data || []);
    const masukKeluarSheetData = formatMasukKeluarData(masukKeluarData?.data?.data || []);
    const rawDataSheetData = formatRawData(rawData?.data?.data || []);

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
    if (arahSheetData.length === 0 && tipeSheetData.length === 0 && masukKeluarSheetData.length === 0 && rawDataSheetData.length === 0) {
      console.warn('⚠️ All sheets are empty - proceeding anyway');
    }

    // Buat workbook dengan multiple sheets
    const workbook = new ExcelJS.Workbook();

    // Tambah sheet 0: Info
    const infoSheet = workbook.addWorksheet('Info');
    addDataToWorksheet(infoSheet, infoSheetData);

    // Tambah sheet 1: Masuk/Keluar Arah
    const arahSheet = workbook.addWorksheet('Masuk Keluar Arah');
    addDataToWorksheet(arahSheet, arahSheetData.length > 0 ? arahSheetData : [{ 'Arah': 'Tidak ada data', 'Masuk (IN)': 0, 'Keluar (OUT)': 0, 'Total': 0 }]);

    // Tambah sheet 2: Tipe Kendaraan
    const tipeSheet = workbook.addWorksheet('Tipe Kendaraan');
    addDataToWorksheet(tipeSheet, tipeSheetData.length > 0 ? tipeSheetData : [{ 'Tipe Kendaraan': 'Tidak ada data', 'Masuk (IN)': 0, 'Keluar (OUT)': 0, 'Total': 0 }]);

    // Tambah sheet 3: Chart Masuk/Keluar
    const masukKeluarSheet = workbook.addWorksheet('Masuk Keluar');
    addDataToWorksheet(masukKeluarSheet, masukKeluarSheetData.length > 0 ? masukKeluarSheetData : [{ 'Jam/Waktu': 'Tidak ada data', 'Masuk (IN)': 0, 'Keluar (OUT)': 0, 'Total': 0 }]);

    // Tambah sheet 4: Raw Data
    const rawDataSheet = workbook.addWorksheet('Data Raw');
    addDataToWorksheet(rawDataSheet, rawDataSheetData.length > 0 ? rawDataSheetData : [{ 'Data': 'Tidak ada data' }]);

    // Download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    

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
 * Format data raw dari API
 */
const formatRawData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];

  return data.map(item => ({
    "ID_Simpang": item.ID_Simpang|| 5,
    "tipe_pendekat": item.tipe_pendekat|| "P",
    "dari_arah": item.dari_arah|| "south",
    "ke_arah": item.ke_arah|| null,
    "SM": item.SM|| 0,
    "MP": item.MP|| 0,
    "AUP": item.AUP|| 0,
    "TR": item.TR|| 0,
    "BS": item.BS|| 0,
    "TS": item.TS|| 0,
    "TB": item.TB|| 0,
    "BB": item.BB|| 0,
    "GANDENG": item.GANDENG|| 0,
    "KTB": item.KTB|| 0,
    "waktu": item.waktu|| "2026-01-06T09:38:31.000Z",
  }));
};

/**
 * Helper function to add data to worksheet from array of objects
 */
const addDataToWorksheet = (worksheet, data) => {
  if (!data || data.length === 0) return;
  
  // Get all unique headers from all objects
  const headersSet = new Set();
  data.forEach(row => {
    Object.keys(row).forEach(key => headersSet.add(key));
  });
  const headers = Array.from(headersSet);
  
  // Set columns
  worksheet.columns = headers.map(header => ({
    header: header,
    key: header,
    width: 20
  }));
  
  // Add rows
  data.forEach(row => {
    worksheet.addRow(row);
  });
};
