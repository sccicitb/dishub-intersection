import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaDownload } from "react-icons/fa6";

export const exportVehicleDataToExcel = (vehicleData, fileName, classification) => {
  // Membuat workbook dan worksheet baru
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);
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
  XLSX.utils.sheet_add_aoa(worksheet, headers, { origin: 'A1' });

  // Set lebar kolom
  const colWidths = [15, 15, 15, 8, 8, 8, 8, 8, 8, 8, 8, 8, 15, 8, 15];
  worksheet['!cols'] = colWidths.map(width => ({ width }));


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

      XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${rowIndex + 1}` });

      // Menambahkan warna latar belakang untuk status kamera
      const cell = XLSX.utils.encode_cell({ r: rowIndex, c: 1 });
      if (!worksheet[cell]) worksheet[cell] = { t: 's', v: '' };

      if (slot.status === 1) {
        // Status aktif (hijau)
        worksheet[cell].s = { fill: { fgColor: { rgb: "90EE90" } } }; // Hijau muda
      } else {
        // Status nonaktif (merah)
        worksheet[cell].s = { fill: { fgColor: { rgb: "FF7F7F" } } }; // Merah muda
      }

      rowIndex++;
    });

    // Menambahkan merger untuk kolom periode
    if (periodData.timeSlots.length > 1) {
      merges.push({
        s: { r: periodRowStartIndex[periodData.period], c: 0 },
        e: { r: rowIndex - 1, c: 0 }
      });
    }

    // Menambahkan baris pemisah setelah periode "Siang" (index 2)
    if (periodIndex === 2) {
      const dividerRow = Array(12).fill('');
      dividerRow[0] = 'Lalu Lintas Jam-Jaman Rata-Rata 4 x VR (omit teringgi) (kend/jam)';

      XLSX.utils.sheet_add_aoa(worksheet, [dividerRow], { origin: `A${rowIndex + 1}` });

      // Menambahkan merger dan styling untuk baris pemisah
      merges.push({
        s: { r: rowIndex, c: 0 },
        e: { r: rowIndex, c: 12 }
      });

      // Styling untuk baris pemisah
      for (let i = 0; i <= 14; i++) {
        const cell = XLSX.utils.encode_cell({ r: rowIndex, c: i });
        if (!worksheet[cell]) worksheet[cell] = { t: 's', v: '' };
        worksheet[cell].s = {
          font: { bold: true },
          alignment: { horizontal: 'center' },
          fill: { fgColor: { rgb: "D3D3D3" } } // Light gray
        };
      }

      rowIndex++;
    }
  });

  // Tambahkan merges ke worksheet
  worksheet['!merges'] = merges;

  // Styling global
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cell]) continue;

      if (!worksheet[cell].s) worksheet[cell].s = {};

      // Tambahkan border ke semua sel
      worksheet[cell].s.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Styling untuk header
      if (R < 3) {
        worksheet[cell].s.font = { bold: true };
        worksheet[cell].s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
        worksheet[cell].s.fill = { fgColor: { rgb: "D3D3D3" } }; // Light gray
      } else {
        worksheet[cell].s.alignment = { horizontal: 'center' };
      }
    }
  }

  // Finalisasi dan ekspor
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Kendaraan');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const file = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });
  saveAs(file, `${fileName}.xlsx`);
};


export const exportYearVehicleDataToExcel = (yearlyData, fileName) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  // Header untuk Yearly Data
  const headers = [
    ['Tahun', 'Kendaraan Bermotor (kend/hari)', '', '', '', '', '', '', '', '', 'Kend. Tak Bermotor', 'Total Kendaraan'],
    ['', 'SM', 'MP', '', 'TR', 'KS', '', 'BB', 'TB', '', 'KTB', ''],
    ['', '', 'MP', 'AUP', '', 'BS', 'TS', '', '', 'Gandeng / Semitrailer', '', '']
  ];

  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } }, // Tahun
    { s: { r: 0, c: 1 }, e: { r: 0, c: 9 } }, // Kendaraan Bermotor header
    { s: { r: 1, c: 1 }, e: { r: 2, c: 1 } }, // SM
    { s: { r: 1, c: 2 }, e: { r: 1, c: 3 } }, // MP
    { s: { r: 1, c: 4 }, e: { r: 2, c: 4 } }, // TR
    { s: { r: 1, c: 5 }, e: { r: 1, c: 6 } }, // KS
    { s: { r: 1, c: 7 }, e: { r: 2, c: 7 } }, // BB
    { s: { r: 1, c: 8 }, e: { r: 1, c: 9 } }, // TB
    { s: { r: 0, c: 10 }, e: { r: 2, c: 10 } }, // KTB
    { s: { r: 0, c: 11 }, e: { r: 2, c: 11 } }, // Total
  ];

  XLSX.utils.sheet_add_aoa(worksheet, headers, { origin: 'A1' });

  // Set lebar kolom
  const colWidths = [12, 10, 10, 10, 10, 10, 10, 10, 10, 15, 15, 15];
  worksheet['!cols'] = colWidths.map(width => ({ width }));

  // Tambahkan data yearly
  let rowIndex = 3;
  if (yearlyData?.yearlyData) {
    yearlyData.yearlyData.forEach((yearData, index) => {
      const rowData = [
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
      ];

      XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${rowIndex + 1}` });
      rowIndex++;
    });
  }

  // Tambahkan baris pemisah
  const dividerRow = Array(12).fill('');
  dividerRow[0] = 'Lalu Lintas Harian Rata-Rata Tahunan (kend/hari)';

  XLSX.utils.sheet_add_aoa(worksheet, [dividerRow], { origin: `A${rowIndex + 1}` });

  merges.push({
    s: { r: rowIndex, c: 0 },
    e: { r: rowIndex, c: 11 }
  });

  // Styling untuk baris pemisah
  for (let i = 0; i <= 11; i++) {
    const cell = XLSX.utils.encode_cell({ r: rowIndex, c: i });
    if (!worksheet[cell]) worksheet[cell] = { t: 's', v: '' };
    worksheet[cell].s = {
      font: { bold: true },
      alignment: { horizontal: 'center' },
      fill: { fgColor: { rgb: "D3D3D3" } }
    };
  }

  rowIndex++;

  // Tambahkan data LHRT
  if (yearlyData?.lhrtData) {
    yearlyData.lhrtData.forEach((lhrtData, index) => {
      const rowData = [
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
      ];

      XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${rowIndex + 1}` });
      rowIndex++;
    });
  }

  worksheet['!merges'] = merges;

  // Styling global
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cell]) continue;

      if (!worksheet[cell].s) worksheet[cell].s = {};

      // Tambahkan border ke semua sel
      worksheet[cell].s.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Styling untuk header
      if (R < 3) {
        worksheet[cell].s.font = { bold: true };
        worksheet[cell].s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
        worksheet[cell].s.fill = { fgColor: { rgb: "D3D3D3" } };
      } else {
        worksheet[cell].s.alignment = { horizontal: 'center' };
      }
    }
  }

  // Finalisasi dan ekspor
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Tahunan');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const file = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });
  saveAs(file, `${fileName}.xlsx`);
};

export const exportHourVehicleDataToExcel = (hourlyData, fileName, classification) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);
  const classificationOptions = ['PKJI 2023 Luar Kota', 'PKJI 2023 Dalam Kota', 'Tipikal'];

  let headers = [];
  let merges = [];

  if (classification === classificationOptions[0]) {
    headers = [
      ['Jam', 'Status Camera', 'Kendaraan Bermotor (Lih. kend/jam)', '', '', '', '', '', '', '', '', 'Kend. Tak Bermotor', '', 'Total (Lih. kend/jam)'],
      ['', '', 'SM', 'MP', '', '', 'TR', 'BS', 'TS', 'BB', 'TB', 'Gandeng / Semitrailer', 'KTB', ''],
      ['', '', '', 'MP', 'AUP', 'TR', '', '', '', '', '', '', '', '']
    ];
    merges = [
      { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 2, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 0, c: 11 } },
      { s: { r: 0, c: 12 }, e: { r: 0, c: 12 } },
      { s: { r: 1, c: 3 }, e: { r: 1, c: 5 } },
      { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } },
      { s: { r: 1, c: 6 }, e: { r: 2, c: 6 } },
      { s: { r: 1, c: 7 }, e: { r: 2, c: 7 } },
      { s: { r: 1, c: 8 }, e: { r: 2, c: 8 } },
      { s: { r: 1, c: 9 }, e: { r: 2, c: 9 } },
      { s: { r: 1, c: 10 }, e: { r: 2, c: 10 } },
      { s: { r: 1, c: 11 }, e: { r: 2, c: 11 } },
      { s: { r: 1, c: 12 }, e: { r: 2, c: 12 } },
    ];
  } else if (classification === classificationOptions[1]) {
    headers = [
      ['Jam', 'Status Camera', 'Kendaraan Bermotor (Lih. kend/jam)', '', '', '', '', '', '', '', '', '', 'Kend. Tak Bermotor'],
      ['', '', 'SM', 'MP', '', '', 'KS', '', '', '', '', '', 'KTB'],
      ['', '', '', 'MP', 'AUP', 'TR', 'BS', 'TS', 'BB', 'TB', 'Gandeng / Semitrailer', '']
    ];
    merges = [
      { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 2, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 0, c: 11 } },
      { s: { r: 1, c: 12 }, e: { r: 2, c: 12 } },
      { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } },
      { s: { r: 1, c: 3 }, e: { r: 1, c: 5 } },
      { s: { r: 1, c: 6 }, e: { r: 1, c: 10 } },
    ];
  } else if (classification === classificationOptions[2]) {
    headers = [
      ['Jam', 'Status Camera', 'Kendaraan Bermotor (Lih. kend/jam)', '', '', '', '', '', '', '', '', '', 'Kend. Tak Bermotor'],
      ['', '', 'SM', 'MP', '', '', 'Bus', '', 'Truk', '', '', 'KTB'],
      ['', '', '', 'MP', 'AUP', 'TR', 'BS', 'BB', 'TS', 'TB', 'Gandeng / Semitrailer', '']
    ];
    merges = [
      { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 2, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 0, c: 11 } },
      { s: { r: 1, c: 12 }, e: { r: 2, c: 12 } },
      { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } },
      { s: { r: 1, c: 3 }, e: { r: 1, c: 5 } },
      { s: { r: 1, c: 6 }, e: { r: 1, c: 7 } },
      { s: { r: 1, c: 8 }, e: { r: 1, c: 10 } },
    ];
  }

  XLSX.utils.sheet_add_aoa(worksheet, headers, { origin: 'A1' });

  const colWidths = [12, 15, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 15, 8];
  worksheet['!cols'] = colWidths.map(width => ({ width }));

  let rowIndex = 3;

  if (hourlyData && Array.isArray(hourlyData)) {
    hourlyData.forEach((hourData, index) => {
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

      XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${rowIndex + 1}` });

      // Warna status camera
      const cell = XLSX.utils.encode_cell({ r: rowIndex, c: 1 });
      if (!worksheet[cell]) worksheet[cell] = { t: 's', v: '' };

      if (hourData.status === 1) {
        worksheet[cell].s = { fill: { fgColor: { rgb: "90EE90" } } };
      } else {
        worksheet[cell].s = { fill: { fgColor: { rgb: "FF7F7F" } } };
      }

      rowIndex++;
    });
  }

  worksheet['!merges'] = merges;

  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cell]) continue;

      if (!worksheet[cell].s) worksheet[cell].s = {};

      worksheet[cell].s.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };

      if (R < 3) {
        worksheet[cell].s.font = { bold: true };
        worksheet[cell].s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
        worksheet[cell].s.fill = { fgColor: { rgb: "D3D3D3" } };
      } else {
        worksheet[cell].s.alignment = { horizontal: 'center' };
      }
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Per Jam');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const file = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });
  saveAs(file, `${fileName}.xlsx`);
};

export const ExportButton = ({
  vehicleData,
  fileName = 'VehicleData',
  className = "btn btn-md bg-green-500 text-white rounded-lg flex items-center gap-2",
  classification
}) => {
  const handleExport = () => {
    exportVehicleDataToExcel(vehicleData, fileName, classification);
  };

  return (
    <button onClick={handleExport} className={className} classification={classification} >
      <FaDownload />
      Export Excel
    </button>
  );
};

export const ExportYearButton = ({
  yearlyData,
  fileName = 'YearlyData',
  className = "btn btn-md bg-green-500 text-white rounded-lg flex items-center gap-2"
}) => {
  const handleExport = () => {
    exportYearVehicleDataToExcel(yearlyData, fileName);
  };

  return (
    <button onClick={handleExport} className={className}>
      <FaDownload />
      Export Excel
    </button>
  );
};

export const ExportHourButton = ({
  hourlyData,
  fileName = 'HourlyData',
  className = "btn btn-md bg-green-500 text-white rounded-lg flex items-center gap-2",
  classification
}) => {
  const handleExport = () => {
    exportHourVehicleDataToExcel(hourlyData, fileName, classification);
  };

  return (
    <button onClick={handleExport} className={className}>
      <FaDownload />
      Export Excel
    </button>
  );
};

export const exportMonthVehicleDataToExcel = (monthlyData, fileName) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  // Header untuk Monthly Data
  const headers = [
    ['Waktu', 'Jumlah hari kerja dalam satu bulan (hari)', 'Kendaraan Bermotor', '', '', '', '', '', '', '', 'Kend. Tak Bermotor', 'Total Kendaraan'],
    ['', '', 'SM', 'MP', '', 'TR', 'KS', '', 'BB', 'TB', '', 'KTB', ''],
    ['', '', '', 'MP', 'AUP', '', 'BS', 'TS', '', '', 'Gandeng / Semitrailer', '', '']
  ];

  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } }, // Waktu
    { s: { r: 0, c: 1 }, e: { r: 2, c: 1 } }, // Jumlah hari kerja
    { s: { r: 0, c: 2 }, e: { r: 0, c: 10 } }, // Kendaraan Bermotor header
    { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } }, // SM
    { s: { r: 1, c: 3 }, e: { r: 1, c: 4 } }, // MP
    { s: { r: 1, c: 5 }, e: { r: 2, c: 5 } }, // TR
    { s: { r: 1, c: 6 }, e: { r: 1, c: 7 } }, // KS
    { s: { r: 1, c: 8 }, e: { r: 2, c: 8 } }, // BB
    { s: { r: 1, c: 9 }, e: { r: 1, c: 10 } }, // TB
    { s: { r: 0, c: 11 }, e: { r: 2, c: 11 } }, // KTB
    { s: { r: 0, c: 12 }, e: { r: 2, c: 12 } }, // Total
  ];

  XLSX.utils.sheet_add_aoa(worksheet, headers, { origin: 'A1' });

  // Set lebar kolom
  const colWidths = [15, 20, 10, 10, 10, 10, 10, 10, 10, 10, 15, 15, 15];
  worksheet['!cols'] = colWidths.map(width => ({ width }));

  // Tambahkan data monthly
  let rowIndex = 3;
  if (monthlyData?.dailyData) {
    monthlyData.dailyData.forEach((monthData, index) => {
      const monthlyTotal = monthData.monthlyTotal || {};
      const rowData = [
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
      ];

      XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${rowIndex + 1}` });
      rowIndex++;
    });
  }

  worksheet['!merges'] = merges;

  // Styling global
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cell]) continue;

      if (!worksheet[cell].s) worksheet[cell].s = {};

      // Tambahkan border ke semua sel
      worksheet[cell].s.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Styling untuk header
      if (R < 3) {
        worksheet[cell].s.font = { bold: true };
        worksheet[cell].s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
        worksheet[cell].s.fill = { fgColor: { rgb: "D3D3D3" } };
      } else {
        worksheet[cell].s.alignment = { horizontal: 'center' };
      }
    }
  }

  // Finalisasi dan ekspor
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Bulanan');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const file = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });
  saveAs(file, `${fileName}.xlsx`);
};

export const ExportMonthButton = ({
  monthlyData,
  fileName = 'MonthlyData',
  className = "btn btn-md bg-green-500 text-white rounded-lg flex items-center gap-2"
}) => {
  const handleExport = () => {
    exportMonthVehicleDataToExcel(monthlyData, fileName);
  };

  return (
    <button onClick={handleExport} className={className}>
      <FaDownload />
      Export Excel
    </button>
  );
};

export const exportDayVehicleDataToExcel = (dailyData, fileName, type = 'dailyMonth') => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  // Header untuk Daily Data
  const headers = [
    ['Pekan', 'Tanggal', 'Kendaraan Bermotor', '', '', '', '', '', '', '', 'Kend. Tak Bermotor', 'Total Kendaraan'],
    ['', '', 'SM', 'MP', '', 'TR', 'KS', '', 'BB', 'TB', '', 'KTB', ''],
    ['', '', '', 'MP', 'AUP', '', 'BS', 'TS', '', '', 'Gandeng / Semitrailer', '', '']
  ];

  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } }, // Pekan
    { s: { r: 0, c: 1 }, e: { r: 2, c: 1 } }, // Tanggal
    { s: { r: 0, c: 2 }, e: { r: 0, c: 10 } }, // Kendaraan Bermotor header
    { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } }, // SM
    { s: { r: 1, c: 3 }, e: { r: 1, c: 4 } }, // MP
    { s: { r: 1, c: 5 }, e: { r: 2, c: 5 } }, // TR
    { s: { r: 1, c: 6 }, e: { r: 1, c: 7 } }, // KS
    { s: { r: 1, c: 8 }, e: { r: 2, c: 8 } }, // BB
    { s: { r: 1, c: 9 }, e: { r: 1, c: 10 } }, // TB
    { s: { r: 0, c: 11 }, e: { r: 2, c: 11 } }, // KTB
    { s: { r: 0, c: 12 }, e: { r: 2, c: 12 } }, // Total
  ];

  XLSX.utils.sheet_add_aoa(worksheet, headers, { origin: 'A1' });

  // Set lebar kolom
  const colWidths = [15, 15, 10, 10, 10, 10, 10, 10, 10, 10, 15, 15, 15];
  worksheet['!cols'] = colWidths.map(width => ({ width }));

  // Helper function untuk format tanggal
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

  // Tambahkan data daily
  let rowIndex = 3;
  let allDays = [];

  if (type === 'dailyMonth') {
    // Untuk dailyMonth, structure adalah { dailyData: [{ month, year, workDays, days: [] }, ...] }
    if (dailyData?.dailyData && Array.isArray(dailyData.dailyData)) {
      // Iterate through all months and extract days
      dailyData.dailyData.forEach((monthData) => {
        if (monthData.days && Array.isArray(monthData.days)) {
          monthData.days.forEach((dayData) => {
            const rowData = [
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
            ];

            XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${rowIndex + 1}` });
            rowIndex++;
          });
        }
      });
    } else if (Array.isArray(dailyData)) {
      // Fallback: jika dailyData adalah array langsung
      dailyData.forEach((dayData) => {
        const rowData = [
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
        ];

        XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${rowIndex + 1}` });
        rowIndex++;
      });
    }
  } else if (type === 'dailyRange') {
    // Untuk dailyRange, structure adalah { dailyData: [{ date, sm, mp, ... }, ...] }
    if (dailyData?.dailyData && Array.isArray(dailyData.dailyData)) {
      dailyData.dailyData.forEach((dayData) => {
        const rowData = [
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
        ];

        XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${rowIndex + 1}` });
        rowIndex++;
      });
    }
  }

  worksheet['!merges'] = merges;

  // Styling global
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cell]) continue;

      if (!worksheet[cell].s) worksheet[cell].s = {};

      // Tambahkan border ke semua sel
      worksheet[cell].s.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Styling untuk header
      if (R < 3) {
        worksheet[cell].s.font = { bold: true };
        worksheet[cell].s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
        worksheet[cell].s.fill = { fgColor: { rgb: "D3D3D3" } };
      } else {
        worksheet[cell].s.alignment = { horizontal: 'center' };
      }
    }
  }

  // Finalisasi dan ekspor
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Harian');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const file = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });
  saveAs(file, `${fileName}.xlsx`);
};

export const ExportDayButton = ({
  dailyData,
  fileName = 'DailyData',
  className = "btn btn-md bg-green-500 text-white rounded-lg flex items-center gap-2",
  type = 'dailyMonth'
}) => {
  const handleExport = () => {
    exportDayVehicleDataToExcel(dailyData, fileName, type);
  };

  return (
    <button onClick={handleExport} className={className}>
      <FaDownload />
      Export Excel
    </button>
  );
};
