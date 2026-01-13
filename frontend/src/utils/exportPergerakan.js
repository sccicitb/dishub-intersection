import ExcelJS from 'exceljs';

/**
 * Export survei pergerakan data ke Excel dengan 2 tabel utama
 * @param {object} vehicleData - Data dari DirectionTable (timur, barat, utara, selatan)
 * @param {array} dataKM - Data dari KeluarMasukTable (Keluar-Masuk Simpang)
 * @param {string} dateInput - Tanggal survey (YYYY-MM-DD)
 * @param {string} simpangName - Nama simpang
 * @param {string} fileName - Nama file Excel
 */
export const exportPergerakanToExcel = async (vehicleData, dataKM, dateInput, simpangName, fileName = 'survei-pergerakan.xlsx') => {
  try {



    // Buat sheet Info
    const infoSheetData = [
      { 'Informasi': 'Laporan Survei Pergerakan' },
      { 'Informasi': '' },
      { 'Informasi': 'Tanggal Survey', 'Nilai': dateInput },
      { 'Informasi': 'Lokasi (Simpang)', 'Nilai': simpangName },
      { 'Informasi': 'Waktu Export', 'Nilai': new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) },
    ];

    // Format data Pergerakan (Direction Table)
    const pergerakanSheetData = formatPergerakanData(vehicleData);

    // Format data Keluar-Masuk
    const keluarMasukSheetData = formatKeluarMasukData(dataKM || []);

    // Buat workbook
    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Info
    const infoSheet = workbook.addWorksheet('Info');
    addDataToWorksheet(infoSheet, infoSheetData);

    // Sheet 2: Pergerakan
    const pergerakanSheet = workbook.addWorksheet('Pergerakan');
    addDataToWorksheet(pergerakanSheet, pergerakanSheetData.length > 0 ? pergerakanSheetData : [{ 'Periode': 'Tidak ada data' }]);

    // Sheet 3: Keluar-Masuk
    const keluarMasukSheet = workbook.addWorksheet('Keluar-Masuk');
    addDataToWorksheet(keluarMasukSheet, keluarMasukSheetData.length > 0 ? keluarMasukSheetData : [{ 'Periode': 'Tidak ada data' }]);

    // Download
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
    return { success: false, message: 'Gagal export Excel: ' + error.message, error };
  }
};

/**
 * Format data Pergerakan (DirectionTable)
 * Matches exact table structure from pergerakanTable.js component
 * vehicleData structure: { timur: [], barat: [], utara: [], selatan: [] }
 * Each direction array has: [{ period, timeSlots: [{ time, data: { sm, mp, ks, ktb, total } }] }]
 * Columns: Periode | Waktu | Timur(SM|MP|KS/AUP|KTB|Total) | Barat(SM|MP|KS/AUP|KTB|Total) | Utara(SM|MP|KS/AUP|KTB|Total) | Selatan(SM|MP|KS/AUP|KTB|Total)
 */
const formatPergerakanData = (vehicleData) => {
  if (!vehicleData || typeof vehicleData !== 'object') {
    console.warn('⚠️ vehicleData is invalid:', vehicleData);
    return [];
  }

  const formattedData = [];
  const directions = ['timur', 'barat', 'utara', 'selatan'];

  // Get reference data untuk mengetahui periods dan timeSlots
  let referenceData = null;
  for (const direction of directions) {
    if (vehicleData[direction] && Array.isArray(vehicleData[direction]) && vehicleData[direction].length > 0) {
      referenceData = vehicleData[direction];
      break;
    }
  }

  if (!referenceData) {
    console.warn('⚠️ No reference data found in directions');
    return [];
  }

  // Iterate setiap period
  referenceData.forEach((periodData, periodIdx) => {
    if (!periodData || !Array.isArray(periodData.timeSlots)) return;

    const timeSlots = periodData.timeSlots;

    // Process each timeSlot
    timeSlots.forEach((slot, slotIdx) => {
      const rowData = {
        'Periode': slotIdx === 0 ? (periodData.period || `Periode ${periodIdx + 1}`) : '',
        'Waktu': slot.time || '-'
      };

      // Untuk setiap arah, ambil data kendaraan
      directions.forEach(direction => {
        const directionArray = vehicleData[direction];
        let slotData = { sm: 0, mp: 0, ks: 0, ktb: 0, total: 0 };

        // Extract data untuk arah ini, periode ini, timeSlot ini
        if (directionArray && 
            Array.isArray(directionArray) && 
            directionArray[periodIdx] && 
            directionArray[periodIdx].timeSlots && 
            directionArray[periodIdx].timeSlots[slotIdx]) {
          const data = directionArray[periodIdx].timeSlots[slotIdx].data || {};
          slotData = {
            sm: Number(data.sm) || 0,
            mp: Number(data.mp) || 0,
            ks: Number(data.ks || data.aup) || 0,
            ktb: Number(data.ktb) || 0,
            total: Number(data.total) || 0
          };
        }

        // Add columns untuk arah ini (5 columns: SM, MP, KS/AUP, KTB, Total)
        const directionName = direction.charAt(0).toUpperCase() + direction.slice(1);
        rowData[`${directionName} SM`] = slotData.sm;
        rowData[`${directionName} MP`] = slotData.mp;
        rowData[`${directionName} KS/AUP`] = slotData.ks;
        rowData[`${directionName} KTB`] = slotData.ktb;
        rowData[`${directionName} Total`] = slotData.total;
      });

      formattedData.push(rowData);
    });

    // Blank row separator between periods
    if (periodIdx < referenceData.length - 1) {
      const separatorRow = {
        'Periode': '',
        'Waktu': ''
      };
      directions.forEach(direction => {
        const directionName = direction.charAt(0).toUpperCase() + direction.slice(1);
        separatorRow[`${directionName} SM`] = '';
        separatorRow[`${directionName} MP`] = '';
        separatorRow[`${directionName} KS/AUP`] = '';
        separatorRow[`${directionName} KTB`] = '';
        separatorRow[`${directionName} Total`] = '';
      });
      formattedData.push(separatorRow);
    }
  });


  return formattedData;
  return formattedData;
};

/**
 * Format data Keluar-Masuk (KeluarMasukTable)
 * Matches exact table structure from keluarMasukTable.js component
 * Structure: array of periods dengan timeSlots
 * Columns: Periode | Waktu | Masuk(SM|MP|KS|KTB|Total) | Keluar(SM|MP|KS|KTB|Total)
 */
const formatKeluarMasukData = (dataKM) => {
  if (!Array.isArray(dataKM) || dataKM.length === 0) {
    console.warn('⚠️ dataKM is empty or not array');
    return [];
  }

  const formattedData = [];

  // Iterate setiap period
  dataKM.forEach((period, periodIdx) => {
    if (!period) return;

    const timeSlots = Array.isArray(period.timeSlots) ? period.timeSlots : [];

    // Jika ada timeSlots, buat row untuk setiap timeSlot dengan periode di baris pertama
    if (timeSlots.length > 0) {
      timeSlots.forEach((slot, slotIdx) => {
        const masuk = slot.masukSimpang || {};
        const keluar = slot.keluarSimpang || {};

        // Hanya tampilkan periode di baris pertama timeSlot
        const periodeDisplay = slotIdx === 0 ? (period.period || 'PERIODE') : '';

        formattedData.push({
          'Periode': periodeDisplay,
          'Waktu': slot.time || '-',
          'Masuk SM': masuk.sm || 0,
          'Masuk MP': masuk.mp || 0,
          'Masuk KS': masuk.ks || 0,
          'Masuk KTB': masuk.ktb || 0,
          'Masuk Total': masuk.total || 0,
          'Keluar SM': keluar.sm || 0,
          'Keluar MP': keluar.mp || 0,
          'Keluar KS': keluar.ks || 0,
          'Keluar KTB': keluar.ktb || 0,
          'Keluar Total': keluar.total || 0
        });
      });
    } else {
      // Jika tidak ada timeSlots, tampilkan periode dengan empty data
      formattedData.push({
        'Periode': period.period || 'PERIODE',
        'Waktu': 'Tidak ada data',
        'Masuk SM': 0,
        'Masuk MP': 0,
        'Masuk KS': 0,
        'Masuk KTB': 0,
        'Masuk Total': 0,
        'Keluar SM': 0,
        'Keluar MP': 0,
        'Keluar KS': 0,
        'Keluar KTB': 0,
        'Keluar Total': 0
      });
    }
  });

  // Blank row separator
  if (formattedData.length > 0) {
    formattedData.push({
      'Periode': '',
      'Waktu': '',
      'Masuk SM': '',
      'Masuk MP': '',
      'Masuk KS': '',
      'Masuk KTB': '',
      'Masuk Total': '',
      'Keluar SM': '',
      'Keluar MP': '',
      'Keluar KS': '',
      'Keluar KTB': '',
      'Keluar Total': ''
    });
  }


  return formattedData;
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
