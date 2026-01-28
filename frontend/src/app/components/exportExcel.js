import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FaDownload } from "react-icons/fa6";

export const exportVehicleDataToExcel = async (vehicleData, fileName, classification) => {
  // Membuat workbook dan worksheet baru
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data Kendaraan');
  const classificationOptions = ['PKJI 2023 Luar Kota', 'PKJI 2023 Dalam Kota', 'Tipikal'];

  // Debug: log untuk memeriksa classification yang diterima



  let headers = [];
  let merges = [];

  if (classification === classificationOptions[0]) {

    headers = [
      ['Periode', 'Status Camera', 'Waktu', 'Kendaraan Bermotor (Lih. kend/jam)', '', '', '', '', '', '', '', 'Kend. Tak Bermotor', '', 'Total (Lih. kend/jam)'],
      ['', '', 'Interval 15 menit', 'SM', 'MP', '', '', 'TR', 'BS', 'TS', 'BB', 'TB', 'Gandeng / Semitrailer', 'KTB', ''],
      ['', '', '', '', 'MP', 'AUP', 'TR', '', '', '', '', '', '', '', '']
    ];
  } else if (classification === classificationOptions[1]) {

    headers = [
      ['Periode', 'Status Camera', 'Waktu', 'Kendaraan Bermotor (Lih. kend/jam)', '', '', '', '', '', '', '', '', 'Kend. Tak Bermotor'],
      ['', '', 'Interval', 'SM', 'MP', '', '', 'KS', '', '', '', '', 'KTB'],
      ['', '', '', '', 'MP', 'AUP', 'TR', 'BS', 'TS', 'BB', 'TB', 'Gandeng / Semitrailer', '']
    ];
  } else if (classification === classificationOptions[2]) {

    headers = [
      ['Periode', 'Status Camera', 'Waktu', 'Kendaraan Bermotor (Lih. kend/jam)', '', '', '', '', '', '', '', '', 'Kend. Tak Bermotor'],
      ['', '', 'Interval', 'SM', 'MP', '', '', 'Bus', '', 'Truk', '', '', 'KTB'],
      ['', '', '', '', 'MP', 'AUP', 'TR', 'BS', 'BB', 'TS', 'TB', 'Gandeng / Semitrailer', '']
    ];
  }
  console.log(headers)

  if (classification === classificationOptions[0]) {
    merges = [
      { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } }, // Periode
      { s: { r: 0, c: 1 }, e: { r: 2, c: 1 } }, // Status Camera
      { s: { r: 0, c: 2 }, e: { r: 2, c: 2 } }, // Waktu
      { s: { r: 0, c: 3 }, e: { r: 0, c: 11 } }, // Kendaraan Bermotor header
      { s: { r: 0, c: 12 }, e: { r: 0, c: 12 } }, // Kend. Tak Bermotor header
      // { s: { r: 0, c: 14 }, e: { r: 2, c: 14 } }, // Total
      { s: { r: 1, c: 4 }, e: { r: 1, c: 6 } }, // MP
      { s: { r: 1, c: 3 }, e: { r: 2, c: 3 } }, // SM
      { s: { r: 1, c: 7 }, e: { r: 2, c: 7 } }, // TR
      { s: { r: 1, c: 8 }, e: { r: 2, c: 8 } }, // BS
      { s: { r: 1, c: 9 }, e: { r: 2, c: 9 } }, // TS
      { s: { r: 1, c: 10 }, e: { r: 2, c: 10 } }, // BB
      { s: { r: 1, c: 11 }, e: { r: 2, c: 11 } }, // TB
      { s: { r: 1, c: 12 }, e: { r: 2, c: 12 } }, // Gandeng/Semitrailer
      { s: { r: 1, c: 13 }, e: { r: 2, c: 13 } }, // KTB
    ]
  } else if (classification === classificationOptions[1]) {
    merges = [
      { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } }, // Periode
      { s: { r: 0, c: 1 }, e: { r: 2, c: 1 } }, // Status Camera
      { s: { r: 0, c: 2 }, e: { r: 2, c: 2 } }, // Waktu
      { s: { r: 0, c: 3 }, e: { r: 0, c: 11 } }, // Kendaraan Bermotor header
      { s: { r: 1, c: 12 }, e: { r: 2, c: 12 } }, // KTB
      { s: { r: 1, c: 3 }, e: { r: 2, c: 3 } }, // SM
      { s: { r: 1, c: 4 }, e: { r: 1, c: 6 } }, // MP (row 1, col 4-6)
      { s: { r: 1, c: 7 }, e: { r: 1, c: 11 } }, // KS
      // Row 2 sub-headers untuk MP
      // { s: { r: 2, c: 4 }, e: { r: 2, c: 4 } }, // MP (tidak perlu merge, single cell)
      // { s: { r: 2, c: 5 }, e: { r: 2, c: 5 } }, // AUP (tidak perlu merge, single cell)
      // { s: { r: 2, c: 6 }, e: { r: 2, c: 6 } }, // TR (tidak perlu merge, single cell)
    ]
  } else if (classification === classificationOptions[2]) {
    merges = [
      { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } }, // Periode
      { s: { r: 0, c: 1 }, e: { r: 2, c: 1 } }, // Status Camera
      { s: { r: 0, c: 2 }, e: { r: 2, c: 2 } }, // Waktu
      { s: { r: 0, c: 3 }, e: { r: 0, c: 11 } }, // Kendaraan Bermotor header
      { s: { r: 1, c: 12 }, e: { r: 2, c: 12 } }, // KTB
      { s: { r: 1, c: 3 }, e: { r: 2, c: 3 } }, // SM
      { s: { r: 1, c: 4 }, e: { r: 1, c: 6 } }, // MP (row 1, col 4-6)
      { s: { r: 1, c: 7 }, e: { r: 1, c: 8 } }, // BUS
      { s: { r: 1, c: 9 }, e: { r: 1, c: 11 } }, // Truk
    ]
  } else {
    merges = []
  }
  
  // Add headers to worksheet
  headers.forEach((row, rowIdx) => {
    const excelRow = worksheet.getRow(rowIdx + 1);
    row.forEach((cell, colIdx) => {
      excelRow.getCell(colIdx + 1).value = cell;
    });
  });

  // Set lebar kolom
  const colWidths = [15, 15, 15, 8, 8, 8, 8, 8, 8, 8, 8, 8, 15, 8, 15];
  colWidths.forEach((width, idx) => {
    worksheet.getColumn(idx + 1).width = width;
  });


  // Mulai dari baris ke-4 (setelah header)
  let rowIndex = 3;
  let periodRowStartIndex = {};

  // Menambahkan data
  vehicleData.forEach((periodData, periodIndex) => {
    periodRowStartIndex[periodData.period] = rowIndex;

    periodData.timeSlots.forEach((slot, slotIndex) => {
      let rowData = []
      if (classification === classificationOptions[0]) {
        rowData = [
          periodData.period,
          slot.status ? 1 : 0,  // Status Camera (akan diisi dengan warna)
          slot.time,
          slot.data.sm,
          slot.data.mp,
          slot.data.aup,
          slot.data.tr,
          slot.data.bs,
          slot.data.ts,
          slot.data.bb,
          slot.data.tb,
          slot.data.gandengSemitrailer,
          slot.data.ktb,
          slot.data.total
        ]
      } else if (classification === classificationOptions[1]) {
        rowData = [
          periodData.period,
          slot.status ? 1 : 0,  // Status Camera (akan diisi dengan warna)
          slot.time,
          slot.data.sm,
          slot.data.mp,
          slot.data.aup,
          slot.data.tr,
          slot.data.bs,
          slot.data.ts,
          slot.data.bb,
          slot.data.tb,
          slot.data.gandengSemitrailer,
          slot.data.ktb
          // slot.data.total
        ]
      } else if (classification === classificationOptions[2]) {
        rowData = [
          periodData.period,
          slot.status ? 1 : 0,  // Status Camera (akan diisi dengan warna)
          slot.time,
          slot.data.sm,
          slot.data.mp,
          slot.data.aup,
          slot.data.tr,
          slot.data.bs,
          slot.data.bb,
          slot.data.ts,
          slot.data.tb,
          slot.data.gandengSemitrailer,
          slot.data.ktb
          // slot.data.total
        ]
      } else {
        rowData = []
      }


      // Hanya tampilkan nama periode pada baris pertama dari periode tersebut
      if (slotIndex > 0) {
        rowData[0] = '';
      }

      const excelRow = worksheet.getRow(rowIndex + 1);
      rowData.forEach((cell, colIdx) => {
        excelRow.getCell(colIdx + 1).value = cell;
      });

      // Menambahkan warna latar belakang untuk status kamera
      const statusCell = excelRow.getCell(2); // Column B (index 2)
      if (slot.status === 1) {
        // Status aktif (hijau)
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF90EE90' }
        };
      } else {
        // Status nonaktif (merah)
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF7F7F' }
        };
      }

      rowIndex++;
    });

    // Menambahkan merger untuk kolom periode
    if (periodData.timeSlots.length > 1) {
      worksheet.mergeCells(
        periodRowStartIndex[periodData.period] + 1,
        1,
        rowIndex,
        1
      );
    }

    // Menambahkan baris pemisah setelah periode "Siang" (index 2)
    // if (periodIndex === 2) {
    //   const dividerRow = Array(12).fill('');
    //   dividerRow[0] = 'Lalu Lintas Jam-Jaman Rata-Rata 4 x VR (omit teringgi) (kend/jam)';

    //   const excelRow = worksheet.getRow(rowIndex + 1);
    //   dividerRow.forEach((cell, colIdx) => {
    //     const excelCell = excelRow.getCell(colIdx + 1);
    //     excelCell.value = cell;
    //     excelCell.font = { bold: true };
    //     excelCell.alignment = { horizontal: 'center' };
    //     excelCell.fill = {
    //       type: 'pattern',
    //       pattern: 'solid',
    //       fgColor: { argb: 'FFD3D3D3' }
    //     };
    //   });

    //   // Menambahkan merger untuk baris pemisah
    //   worksheet.mergeCells(rowIndex + 1, 1, rowIndex + 1, 13);

    //   rowIndex++;
    // }
  });

  // Apply merges for headers
  merges.forEach(merge => {
    worksheet.mergeCells(
      merge.s.r + 1,
      merge.s.c + 1,
      merge.e.r + 1,
      merge.e.c + 1
    );
  });

  // Styling global - Apply borders and styling to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      // Add borders
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Styling untuk header (rows 1-3)
      if (rowNumber <= 3) {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        if (!cell.fill || !cell.fill.fgColor) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
          };
        }
      } else {
        if (!cell.alignment) {
          cell.alignment = { horizontal: 'center' };
        }
      }
    });
  });

  // Finalisasi dan ekspor
  const excelBuffer = await workbook.xlsx.writeBuffer();
  const file = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });
  saveAs(file, `${fileName}.xlsx`);
};


export const exportYearVehicleDataToExcel = async (yearlyData, fileName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data Tahunan');

  // Header untuk Yearly Data
  const headers = [
    ['Tahun', 'Kendaraan Bermotor (kend/hari)', '', '', '', '', '', '', '', '', 'Kend. Tak Bermotor', 'Total Kendaraan'],
    ['', 'SM', 'MP', '', 'TR', 'KS', '', 'BB', 'TB', '', 'KTB', ''],
    ['', '', 'MP', 'AUP', '', 'BS', 'TS', '', '', 'Gandeng / Semitrailer', '', '']
  ];

  // Add headers
  headers.forEach(row => worksheet.addRow(row));

  // Set column widths
  const colWidths = [12, 10, 10, 10, 10, 10, 10, 10, 10, 15, 15, 15];
  colWidths.forEach((width, idx) => {
    worksheet.getColumn(idx + 1).width = width;
  });

  // Merge cells for headers
  worksheet.mergeCells('A1:A3'); // Tahun
  worksheet.mergeCells('B1:J1'); // Kendaraan Bermotor
  worksheet.mergeCells('B2:B3'); // SM
  worksheet.mergeCells('C2:D2'); // MP
  worksheet.mergeCells('E2:E3'); // TR
  worksheet.mergeCells('F2:G2'); // KS
  worksheet.mergeCells('H2:H3'); // BB
  worksheet.mergeCells('I2:J2'); // TB
  worksheet.mergeCells('K1:K3'); // KTB
  worksheet.mergeCells('L1:L3'); // Total

  // Tambahkan data yearly
  if (yearlyData?.yearlyData) {
    yearlyData.yearlyData.forEach((yearData) => {
      worksheet.addRow([
        yearData.year,
        yearData.data.sm || 0,
        yearData.data.mp || 0,
        yearData.data.aup || 0,
        yearData.data.tr || 0,
        yearData.data.bs || 0,
        yearData.data.ts || 0,
        yearData.data.bb || 0,
        yearData.data.tb || 0,
        yearData.data.gandengSemitrailer || 0,
        yearData.data.ktb || 0,
        yearData.data.total || 0
      ]);
    });
  }

  // Tambahkan baris pemisah
  const dividerRow = worksheet.addRow(['Lalu Lintas Harian Rata-Rata Tahunan (kend/hari)', '', '', '', '', '', '', '', '', '', '', '']);
  worksheet.mergeCells(dividerRow.number, 1, dividerRow.number, 12);
  dividerRow.font = { bold: true };
  dividerRow.alignment = { horizontal: 'center' };
  dividerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };

  // Tambahkan data LHRT
  if (yearlyData?.lhrtData) {
    yearlyData.lhrtData.forEach((lhrtData) => {
      worksheet.addRow([
        lhrtData.period,
        lhrtData.data.sm || 0,
        lhrtData.data.mp || 0,
        lhrtData.data.aup || 0,
        lhrtData.data.tr || 0,
        lhrtData.data.bs || 0,
        lhrtData.data.ts || 0,
        lhrtData.data.bb || 0,
        lhrtData.data.tb || 0,
        lhrtData.data.gandengSemitrailer || 0,
        lhrtData.data.ktb || 0,
        lhrtData.data.total || 0
      ]);
    });
  }

  // Apply basic styling to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Header styling
      if (rowNumber <= 3) {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' }
        };
      }
    });
  });

  // Export file
  const buffer = await workbook.xlsx.writeBuffer();
  const file = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });
  saveAs(file, `${fileName}.xlsx`);
};

export const exportHourVehicleDataToExcel = async (hourlyData, fileName, classification) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data Per Jam');
  const classificationOptions = ['PKJI 2023 Luar Kota', 'PKJI 2023 Dalam Kota', 'Tipikal'];

  // Prepare headers based on classification
  let headers = [];
  if (classification === classificationOptions[0]) {
    headers = [
      ['Jam', 'Status Camera', 'Kendaraan Bermotor (Lih. kend/jam)', '', '', '', '', '', '', '', '', '', 'Kend. Tak Bermotor', 'Total'],
      ['', '', 'SM', 'MP', '', '', 'TR', 'BS', 'TS', 'BB', 'TB', 'Gandeng / Semitrailer', 'KTB', ''],
      ['', '', '', 'MP', 'AUP', 'TR', '', '', '', '', '', '', '', '']
    ];
  } else if (classification === classificationOptions[1]) {
    headers = [
      ['Jam', 'Status Camera', 'Kendaraan Bermotor (Lih. kend/jam)', '', '', '', '', '', '', '', '', '', 'Kend. Tak Bermotor'],
      ['', '', 'SM', 'MP', '', '', 'KS', '', '', '', '', '', 'KTB'],
      ['', '', '', 'MP', 'AUP', 'TR', 'BS', 'TS', 'BB', 'TB', 'Gandeng / Semitrailer', '']
    ];
  } else if (classification === classificationOptions[2]) {
    headers = [
      ['Jam', 'Status Camera', 'Kendaraan Bermotor (Lih. kend/jam)', '', '', '', '', '', '', '', '', '', 'Kend. Tak Bermotor'],
      ['', '', 'SM', 'MP', '', '', 'Bus', '', 'Truk', '', '', 'KTB'],
      ['', '', '', 'MP', 'AUP', 'TR', 'BS', 'BB', 'TS', 'TB', 'Gandeng / Semitrailer', '']
    ];
  }

  // Add headers
  headers.forEach(row => worksheet.addRow(row));

  // Set column widths
  const colWidths = [12, 15, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 15, 8];
  colWidths.forEach((width, idx) => {
    worksheet.getColumn(idx + 1).width = width;
  });

  // Add data
  if (hourlyData && Array.isArray(hourlyData)) {
    hourlyData.forEach((hourData) => {
      let rowData = [];
      if (classification === classificationOptions[0]) {
        rowData = [
          hourData.hour || hourData.time,
          hourData.status ? 1 : 0,
          hourData.data.sm || 0,
          hourData.data.mp || 0,
          hourData.data.aup || 0,
          hourData.data.tr || 0,
          hourData.data.bs || 0,
          hourData.data.ts || 0,
          hourData.data.bb || 0,
          hourData.data.tb || 0,
          hourData.data.gandengSemitrailer || 0,
          hourData.data.ktb || 0,
          hourData.data.total || 0
        ];
      } else if (classification === classificationOptions[1]) {
        rowData = [
          hourData.hour || hourData.time,
          hourData.status ? 1 : 0,
          hourData.data.sm || 0,
          hourData.data.mp || 0,
          hourData.data.aup || 0,
          hourData.data.tr || 0,
          hourData.data.bs || 0,
          hourData.data.ts || 0,
          hourData.data.bb || 0,
          hourData.data.tb || 0,
          hourData.data.gandengSemitrailer || 0,
          hourData.data.ktb || 0
        ];
      } else if (classification === classificationOptions[2]) {
        rowData = [
          hourData.hour || hourData.time,
          hourData.status ? 1 : 0,
          hourData.data.sm || 0,
          hourData.data.mp || 0,
          hourData.data.aup || 0,
          hourData.data.tr || 0,
          hourData.data.bs || 0,
          hourData.data.bb || 0,
          hourData.data.ts || 0,
          hourData.data.tb || 0,
          hourData.data.gandengSemitrailer || 0,
          hourData.data.ktb || 0
        ];
      }

      const excelRow = worksheet.addRow(rowData);
      
      // Add status camera coloring
      const statusCell = excelRow.getCell(2);
      if (hourData.status === 1) {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF90EE90' }
        };
      } else {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF7F7F' }
        };
      }
    });
  }

  // Apply styling
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      if (rowNumber <= 3) {
        cell.font = { bold: true };
        if (!cell.fill || !cell.fill.fgColor) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
          };
        }
      }
    });
  });

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const file = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });
  saveAs(file, `${fileName}.xlsx`);
};

export const ExportButton = ({
  vehicleData,
  fileName = 'VehicleData',
  classification
}) => {
  const handleExport = () => {
    exportVehicleDataToExcel(vehicleData, fileName, classification);
  };

  return (
    <button onClick={handleExport} className='rounded-sm text-sm font-semibold py-1.5 px-3 cursor-pointer hover:bg-green-600 bg-green-500 text-white flex items-center gap-2' classification={classification} >
      <FaDownload />
      Export Excel
    </button>
  );
};

export const ExportYearButton = ({
  yearlyData,
  fileName = 'YearlyData'
}) => {
  const handleExport = () => {
    exportYearVehicleDataToExcel(yearlyData, fileName);
  };

  return (
    <button onClick={handleExport} className='rounded-sm text-sm font-semibold py-1.5 px-3 cursor-pointer hover:bg-green-600 bg-green-500 text-white flex items-center gap-2'>
      <FaDownload />
      Export Excel
    </button>
  );
};

export const ExportHourButton = ({
  hourlyData,
  fileName = 'HourlyData',
  classification
}) => {
  const handleExport = () => {
    exportHourVehicleDataToExcel(hourlyData, fileName, classification);
  };

  return (
    <button onClick={handleExport} className='rounded-sm text-sm font-semibold py-1.5 px-3 cursor-pointer hover:bg-green-600 bg-green-500 text-white flex items-center gap-2'>
      <FaDownload />
      Export Excel
    </button>
  );
};

export const exportMonthVehicleDataToExcel = async (monthlyData, fileName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data Bulanan');

  // Header untuk Monthly Data
  const headers = [
    ['Waktu', 'Jumlah hari kerja dalam satu bulan (hari)', 'Kendaraan Bermotor', '', '', '', '', '', '', '', 'Kend. Tak Bermotor', 'Total Kendaraan'],
    ['', '', 'SM', 'MP', '', 'TR', 'KS', '', 'BB', 'TB', '', 'KTB', ''],
    ['', '', '', 'MP', 'AUP', '', 'BS', 'TS', '', '', 'Gandeng / Semitrailer', '', '']
  ];

  // Add headers
  headers.forEach(row => worksheet.addRow(row));

  // Set column widths
  const colWidths = [15, 20, 10, 10, 10, 10, 10, 10, 10, 10, 15, 15, 15];
  colWidths.forEach((width, idx) => {
    worksheet.getColumn(idx + 1).width = width;
  });

  // Merge cells
  worksheet.mergeCells('A1:A3'); // Waktu
  worksheet.mergeCells('B1:B3'); // Jumlah hari kerja
  worksheet.mergeCells('C1:K1'); // Kendaraan Bermotor header
  worksheet.mergeCells('C2:C3'); // SM
  worksheet.mergeCells('D2:E2'); // MP
  worksheet.mergeCells('F2:F3'); // TR
  worksheet.mergeCells('G2:H2'); // KS
  worksheet.mergeCells('I2:I3'); // BB
  worksheet.mergeCells('J2:K2'); // TB
  worksheet.mergeCells('L1:L3'); // KTB
  worksheet.mergeCells('M1:M3'); // Total

  // Add data
  if (monthlyData?.dailyData) {
    monthlyData.dailyData.forEach((monthData) => {
      const monthlyTotal = monthData.monthlyTotal || {};
      worksheet.addRow([
        monthData.month,
        monthData.workDays || 0,
        monthlyTotal.sm || 0,
        monthlyTotal.mp || 0,
        monthlyTotal.aup || 0,
        monthlyTotal.tr || 0,
        monthlyTotal.bs || 0,
        monthlyTotal.ts || 0,
        monthlyTotal.bb || 0,
        monthlyTotal.tb || 0,
        monthlyTotal.gandengSemitrailer || 0,
        monthlyTotal.ktb || 0,
        monthlyTotal.total || 0
      ]);
    });
  }

  // Apply styling
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      if (rowNumber <= 3) {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' }
        };
      }
    });
  });

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const file = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });
  saveAs(file, `${fileName}.xlsx`);
};

export const ExportMonthButton = ({
  monthlyData,
  fileName = 'MonthlyData'
}) => {
  const handleExport = () => {
    exportMonthVehicleDataToExcel(monthlyData, fileName);
  };

  return (
    <button onClick={handleExport} className='rounded-sm text-sm font-semibold py-1.5 px-3 cursor-pointer hover:bg-green-600 bg-green-500 text-white flex items-center gap-2'>
      <FaDownload />
      Export Excel
    </button>
  );
};

export const exportDayVehicleDataToExcel = async (dailyData, fileName, type = 'dailyMonth') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data Harian');

  // Header untuk Daily Data
  const headers = [
    ['Pekan', 'Tanggal', 'Kendaraan Bermotor', '', '', '', '', '', '', '', 'Kend. Tak Bermotor', 'Total Kendaraan'],
    ['', '', 'SM', 'MP', '', 'TR', 'KS', '', 'BB', 'TB', '', 'KTB', ''],
    ['', '', '', 'MP', 'AUP', '', 'BS', 'TS', '', '', 'Gandeng / Semitrailer', '', '']
  ];

  // Add headers
  headers.forEach(row => worksheet.addRow(row));

  // Set column widths
  const colWidths = [15, 15, 10, 10, 10, 10, 10, 10, 10, 10, 15, 15, 15];
  colWidths.forEach((width, idx) => {
    worksheet.getColumn(idx + 1).width = width;
  });

  // Merge cells
  worksheet.mergeCells('A1:A3'); // Pekan
  worksheet.mergeCells('B1:B3'); // Tanggal
  worksheet.mergeCells('C1:K1'); // Kendaraan Bermotor
  worksheet.mergeCells('C2:C3'); // SM
  worksheet.mergeCells('D2:E2'); // MP
  worksheet.mergeCells('F2:F3'); // TR
  worksheet.mergeCells('G2:H2'); // KS
  worksheet.mergeCells('I2:I3'); // BB
  worksheet.mergeCells('J2:K2'); // TB
  worksheet.mergeCells('L1:L3'); // KTB
  worksheet.mergeCells('M1:M3'); // Total

  // Helper functions
  const formatDateNoDays = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  const getWeekOfMonth = (dateString) => {
    const date = new Date(dateString);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const daysSinceFirstDayOfMonth = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
    return Math.floor(daysSinceFirstDayOfMonth / 7) + 1;
  };

  const isWeekend = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getWorkdayIndicator = (dateString) => {
    return isWeekend(dateString) ? 'Akhir Pekan' : 'Hari Kerja';
  };

  const getWeekAndDayInfo = (dateString) => {
    const weekNumber = getWeekOfMonth(dateString);
    const workdayType = getWorkdayIndicator(dateString);
    return `P(${weekNumber}) - ${workdayType}`;
  };

  // Add data
  if (type === 'dailyMonth') {
    if (dailyData?.dailyData && Array.isArray(dailyData.dailyData)) {
      dailyData.dailyData.forEach((monthData) => {
        if (monthData.days && Array.isArray(monthData.days)) {
          monthData.days.forEach((dayData) => {
            worksheet.addRow([
              getWeekAndDayInfo(dayData.date),
              formatDateNoDays(dayData.date),
              dayData.data?.sm || 0,
              dayData.data?.mp || 0,
              dayData.data?.aup || 0,
              dayData.data?.tr || 0,
              dayData.data?.bs || 0,
              dayData.data?.ts || 0,
              dayData.data?.bb || 0,
              dayData.data?.tb || 0,
              dayData.data?.gandengSemitrailer || 0,
              dayData.data?.ktb || 0,
              dayData.data?.total || 0
            ]);
          });
        }
      });
    } else if (Array.isArray(dailyData)) {
      dailyData.forEach((dayData) => {
        worksheet.addRow([
          getWeekAndDayInfo(dayData.date),
          formatDateNoDays(dayData.date),
          dayData.data?.sm || 0,
          dayData.data?.mp || 0,
          dayData.data?.aup || 0,
          dayData.data?.tr || 0,
          dayData.data?.bs || 0,
          dayData.data?.ts || 0,
          dayData.data?.bb || 0,
          dayData.data?.tb || 0,
          dayData.data?.gandengSemitrailer || 0,
          dayData.data?.ktb || 0,
          dayData.data?.total || 0
        ]);
      });
    }
  } else if (type === 'dailyRange') {
    if (dailyData?.dailyData && Array.isArray(dailyData.dailyData)) {
      dailyData.dailyData.forEach((dayData) => {
        worksheet.addRow([
          getWeekAndDayInfo(dayData.date),
          formatDateNoDays(dayData.date),
          dayData.sm || 0,
          dayData.mp || 0,
          dayData.aup || 0,
          dayData.tr || 0,
          dayData.bs || 0,
          dayData.ts || 0,
          dayData.bb || 0,
          dayData.tb || 0,
          dayData.gandengSemitrailer || 0,
          dayData.ktb || 0,
          dayData.total || 0
        ]);
      });
    }
  }

  // Apply styling
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      if (rowNumber <= 3) {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' }
        };
      }
    });
  });

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const file = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });
  saveAs(file, `${fileName}.xlsx`);
};

export const ExportDayButton = ({
  dailyData,
  fileName = 'DailyData',
  type = 'dailyMonth'
}) => {
  const handleExport = () => {
    exportDayVehicleDataToExcel(dailyData, fileName, type);
  };

  return (
    <button onClick={handleExport} className='rounded-sm text-sm font-semibold py-1.5 px-3 cursor-pointer hover:bg-green-600 bg-green-500 text-white flex items-center gap-2'>
      <FaDownload />
      Export Excel
    </button>
  );
};
