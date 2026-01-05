import * as XLSX from 'xlsx';

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
    console.log('📥 Starting Pergerakan export with params:', { dateInput, simpangName, fileName });
    console.log('📊 Data to export:', { vehicleData, dataKMLength: dataKM?.length });

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
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Info
    const infoSheet = XLSX.utils.json_to_sheet(infoSheetData);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Info');
    setColumnWidths(infoSheet);

    // Sheet 2: Pergerakan
    const pergerakanSheet = XLSX.utils.json_to_sheet(pergerakanSheetData.length > 0 ? pergerakanSheetData : [{ 'Periode': 'Tidak ada data' }]);
    XLSX.utils.book_append_sheet(workbook, pergerakanSheet, 'Pergerakan');
    setColumnWidths(pergerakanSheet);

    // Sheet 3: Keluar-Masuk
    const keluarMasukSheet = XLSX.utils.json_to_sheet(keluarMasukSheetData.length > 0 ? keluarMasukSheetData : [{ 'Periode': 'Tidak ada data' }]);
    XLSX.utils.book_append_sheet(workbook, keluarMasukSheet, 'Keluar-Masuk');
    setColumnWidths(keluarMasukSheet);

    // Download
    XLSX.writeFile(workbook, fileName);

    console.log('✅ Export successful:', fileName);
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

  console.log('📊 Pergerakan formatted:', formattedData.length, 'rows');
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

  console.log('📊 Keluar-Masuk formatted:', formattedData.length, 'rows');
  return formattedData;
};

/**
 * Add multi-level headers untuk Pergerakan sheet
 * Level 1: Periode, Waktu, Timur, Barat, Utara, Selatan
 * Level 2: Kendaraan Bermotor, Kend. Tak Bermotor, Total
 * Level 3: SM, MP, KS/AUP
 */
const addPergerakanHeaders = (sheet, hasData) => {
  if (!hasData) return;

  // Insert 3 rows di atas data untuk headers
  const newSheet = {};

  // Row 1: Direction headers (Periode, Waktu, Timur, Barat, Utara, Selatan)
  const row1 = {
    'A1': { t: 's', v: 'Periode' },
    'B1': { t: 's', v: 'Waktu\nInterval\n15 menit' },
    'C1': { t: 's', v: 'Timur' },
    'H1': { t: 's', v: 'Barat' },
    'M1': { t: 's', v: 'Utara' },
    'R1': { t: 's', v: 'Selatan' }
  };

  // Row 2: Kendaraan Bermotor, Kend. Tak Bermotor, Total groups
  const row2 = {
    'C2': { t: 's', v: 'Kendaraan Bermotor' },
    'F2': { t: 's', v: 'Kend. Tak\nBermotor' },
    'G2': { t: 's', v: 'Total' },
    'H2': { t: 's', v: 'Kendaraan Bermotor' },
    'K2': { t: 's', v: 'Kend. Tak\nBermotor' },
    'L2': { t: 's', v: 'Total' },
    'M2': { t: 's', v: 'Kendaraan Bermotor' },
    'P2': { t: 's', v: 'Kend. Tak\nBermotor' },
    'Q2': { t: 's', v: 'Total' },
    'R2': { t: 's', v: 'Kendaraan Bermotor' },
    'U2': { t: 's', v: 'Kend. Tak\nBermotor' },
    'V2': { t: 's', v: 'Total' }
  };

  // Row 3: Vehicle types (SM, MP, KS/AUP, KTB - repeated 4 times)
  const row3 = {};
  const vehicleTypes = ['SM', 'MP', 'KS/AUP', 'KTB'];
  const directionCols = [
    { start: 'C', offset: 0 },
    { start: 'H', offset: 0 },
    { start: 'M', offset: 0 },
    { start: 'R', offset: 0 }
  ];

  directionCols.forEach((dir, idx) => {
    vehicleTypes.forEach((type, typeIdx) => {
      const colCode = String.fromCharCode(dir.start.charCodeAt(0) + typeIdx);
      row3[`${colCode}3`] = { t: 's', v: type };
    });
  });

  // Merge cells
  const merges = [
    // Periode & Waktu rowspan
    { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } }, // Periode (A1:A3)
    { s: { r: 0, c: 1 }, e: { r: 2, c: 1 } }, // Waktu (B1:B3)
    // Direction colspans
    { s: { r: 0, c: 2 }, e: { r: 0, c: 6 } }, // Timur (C1:G1)
    { s: { r: 0, c: 7 }, e: { r: 0, c: 11 } }, // Barat (H1:L1)
    { s: { r: 0, c: 12 }, e: { r: 0, c: 16 } }, // Utara (M1:Q1)
    { s: { r: 0, c: 17 }, e: { r: 0, c: 21 } }, // Selatan (R1:V1)
    // Kendaraan Bermotor colspans
    { s: { r: 1, c: 2 }, e: { r: 1, c: 4 } }, // Timur KB (C2:E2)
    { s: { r: 1, c: 7 }, e: { r: 1, c: 9 } }, // Barat KB (H2:J2)
    { s: { r: 1, c: 12 }, e: { r: 1, c: 14 } }, // Utara KB (M2:O2)
    { s: { r: 1, c: 17 }, e: { r: 1, c: 19 } }, // Selatan KB (R2:T2)
    // KTB & Total rowspan
    { s: { r: 1, c: 5 }, e: { r: 2, c: 5 } }, // Timur KTB (F2:F3)
    { s: { r: 1, c: 6 }, e: { r: 2, c: 6 } }, // Timur Total (G2:G3)
    { s: { r: 1, c: 10 }, e: { r: 2, c: 10 } }, // Barat KTB (K2:K3)
    { s: { r: 1, c: 11 }, e: { r: 2, c: 11 } }, // Barat Total (L2:L3)
    { s: { r: 1, c: 15 }, e: { r: 2, c: 15 } }, // Utara KTB (P2:P3)
    { s: { r: 1, c: 16 }, e: { r: 2, c: 16 } }, // Utara Total (Q2:Q3)
    { s: { r: 1, c: 20 }, e: { r: 2, c: 20 } }, // Selatan KTB (U2:U3)
    { s: { r: 1, c: 21 }, e: { r: 2, c: 21 } }, // Selatan Total (V2:V3)
  ];

  // Copy existing data dan add headers
  Object.keys(sheet).forEach(key => {
    if (key.startsWith('!')) return; // Skip sheet metadata
    const match = key.match(/([A-Z]+)(\d+)/);
    if (match) {
      const col = match[1];
      const row = parseInt(match[2]);
      const newRow = row + 3; // Shift data down 3 rows
      const newKey = `${col}${newRow}`;
      newSheet[newKey] = sheet[key];
    }
  });

  // Add header cells
  Object.assign(newSheet, row1, row2, row3);

  // Copy sheet metadata
  if (sheet['!cols']) newSheet['!cols'] = sheet['!cols'];
  if (sheet['!rows']) newSheet['!rows'] = sheet['!rows'];

  // Add merges
  newSheet['!merges'] = merges;

  // Replace sheet contents
  Object.keys(sheet).forEach(key => delete sheet[key]);
  Object.assign(sheet, newSheet);
};

/**
 * Set column width otomatis
 */
const setColumnWidths = (sheet) => {
  if (!sheet['!cols']) {
    sheet['!cols'] = [];
  }

  const defaultWidth = 15;
  const cols = Object.keys(sheet).filter(key => key.match(/^[A-Z]+1$/));
  cols.forEach((col, idx) => {
    if (!sheet['!cols'][idx]) {
      sheet['!cols'][idx] = { wch: defaultWidth };
    }
  });
};
