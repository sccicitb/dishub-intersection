import * as XLSX from 'xlsx';

export const exportTrafficMatrixByCategory = async (data, simpangId, dateRange) => {
  if (!data || !data.arahPergerakan) {
    alert('No data to export');
    return;
  }

  const wb = XLSX.utils.book_new();

  // Vehicle categories
  const vehicleCategories = [
    'Sepeda Motor',
    'Mobil Penumpang',
    'Angkutan Umum',
    'Truk Ringan',
    'Bus Sedang',
    'Truk Sedang',
    'Truk Berat',
    'Bus Besar',
    'Gandeng/Semitrailer',
    'Kendaraan Tidak Bermotor',
  ];

  const directionNames = ['barat', 'selatan', 'timur', 'utara'];
  const movements = Object.keys(data.arahPergerakan);

  // ===== SHEET 1: INFO =====
  const infoData = [
    ['Traffic Matrix by Category'],
    ['Simpang ID', data.simpang_id],
    ['Tanggal Mulai', data.date_range.start_date],
    ['Tanggal Selesai', data.date_range.end_date],
    ['Tanggal Export', new Date().toLocaleString('id-ID')],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Info');

  // ===== SHEET 2: MATRIX TABLE =====
  const tableData = [];

  // Header row 1: Movement names
  const headerRow1 = ['Jenis Kendaraan'];
  movements.forEach((movement) => {
    headerRow1.push(movement);
    // Add empty cells for direction columns
    for (let i = 1; i < directionNames.length; i++) {
      headerRow1.push('');
    }
    headerRow1.push('Total');
  });
  tableData.push(headerRow1);

  // Header row 2: Direction abbreviations
  const headerRow2 = [''];
  movements.forEach(() => {
    directionNames.forEach((dir) => {
      const abbr = dir === 'barat' ? 'B' : dir === 'selatan' ? 'S' : dir === 'timur' ? 'T' : 'U';
      headerRow2.push(abbr);
    });
    headerRow2.push('Total');
  });
  tableData.push(headerRow2);

  // Data rows
  vehicleCategories.forEach((category) => {
    const row = [category];
    movements.forEach((movement) => {
      directionNames.forEach((direction) => {
        const value = data.arahPergerakan[movement]?.[direction]?.[category] || 0;
        row.push(value);
      });
      const total = data.arahPergerakan[movement]?.Total?.[category] || 0;
      row.push(total);
    });
    tableData.push(row);
  });

  // Total row
  const totalRow = ['Total'];
  movements.forEach((movement) => {
    directionNames.forEach((direction) => {
      const value = data.arahPergerakan[movement]?.[direction]?.Total || 0;
      totalRow.push(value);
    });
    const total = data.arahPergerakan[movement]?.Total?.Total || 0;
    totalRow.push(total);
  });
  tableData.push(totalRow);

  const wsTable = XLSX.utils.aoa_to_sheet(tableData);

  // Apply column widths
  const colWidths = [{ wch: 20 }]; // First column
  for (let i = 0; i < movements.length; i++) {
    for (let j = 0; j < directionNames.length + 1; j++) {
      colWidths.push({ wch: 12 });
    }
  }
  wsTable['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, wsTable, 'Traffic Matrix');

  // ===== SHEET 3: SUMMARY BY MOVEMENT =====
  const summaryData = [['Movement Summary']];
  summaryData.push(['Movement', 'Barat', 'Selatan', 'Timur', 'Utara', 'Total']);

  movements.forEach((movement) => {
    const row = [movement];
    let movementTotal = 0;
    directionNames.forEach((direction) => {
      const value = data.arahPergerakan[movement]?.[direction]?.Total || 0;
      row.push(value);
      movementTotal += value;
    });
    row.push(movementTotal);
    summaryData.push(row);
  });

  // Grand total row
  const grandTotalRow = ['GRAND TOTAL'];
  let grandTotal = 0;
  directionNames.forEach((direction) => {
    let directionTotal = 0;
    movements.forEach((movement) => {
      const value = data.arahPergerakan[movement]?.[direction]?.Total || 0;
      directionTotal += value;
    });
    grandTotalRow.push(directionTotal);
    grandTotal += directionTotal;
  });
  grandTotalRow.push(grandTotal);
  summaryData.push(grandTotalRow);

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // ===== SHEET 4: SUMMARY BY DIRECTION =====
  const directionSummaryData = [['Direction Summary']];
  directionSummaryData.push(['Direction', 'Belok Kiri', 'Lurus', 'Belok Kanan', 'Total']);

  directionNames.forEach((direction) => {
    const row = [direction.charAt(0).toUpperCase() + direction.slice(1)];
    let directionTotal = 0;
    movements.forEach((movement) => {
      const value = data.arahPergerakan[movement]?.[direction]?.Total || 0;
      row.push(value);
      directionTotal += value;
    });
    row.push(directionTotal);
    directionSummaryData.push(row);
  });

  const wsDirectionSummary = XLSX.utils.aoa_to_sheet(directionSummaryData);
  wsDirectionSummary['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsDirectionSummary, 'Direction Summary');

  // Save file
  const fileName = `Traffic_Matrix_Simpang${simpangId}_${dateRange.start_date}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
