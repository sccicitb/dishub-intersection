import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaDownload } from "react-icons/fa6";

export const exportVehicleDataToExcel = (vehicleData, fileName) => {
  // Membuat workbook dan worksheet baru
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);
  
  const headers = [
    ['Periode', 'Status Camera', 'Waktu', 'Kendaraan Bermotor (Lih. kend/jam)', '', '', '', '', '', '', '', 'Kend. Tak Bermotor', '', 'Total (Lih. kend/jam)'],
    ['', '', 'Interval 15 menit', 'SM', 'MP', '', '', 'TR', 'BS', 'TS', 'BB', 'TB', 'Gandeng / Semitrailer', 'KTB', ''],
    ['', '', '', '', 'MP', 'AUP', 'TR', '', '', '', '', '', '', '', '']
  ];
  
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } }, // Periode
    { s: { r: 0, c: 1 }, e: { r: 2, c: 1 } }, // Status Camera
    { s: { r: 0, c: 2 }, e: { r: 2, c: 2 } }, // Waktu
    { s: { r: 0, c: 3 }, e: { r: 0, c: 10 } }, // Kendaraan Bermotor header
    { s: { r: 0, c: 11 }, e: { r: 0, c: 13 } }, // Kend. Tak Bermotor header
    { s: { r: 0, c: 14 }, e: { r: 2, c: 14 } }, // Total
    { s: { r: 1, c: 4 }, e: { r: 1, c: 6 } }, // MP
    { s: { r: 1, c: 3 }, e: { r: 2, c: 3 } }, // SM
    { s: { r: 1, c: 7 }, e: { r: 2, c: 7 } }, // TR
    { s: { r: 1, c: 8 }, e: { r: 2, c: 8 } }, // BS
    { s: { r: 1, c: 9 }, e: { r: 2, c: 9 } }, // TS
    { s: { r: 1, c: 10 }, e: { r: 2, c: 10 } }, // BB
    { s: { r: 1, c: 11 }, e: { r: 2, c: 11 } }, // TB
    { s: { r: 1, c: 12 }, e: { r: 2, c: 12 } }, // Gandeng/Semitrailer
    { s: { r: 1, c: 13 }, e: { r: 2, c: 13 } }, // KTB
  ];
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
      const rowData = [
        periodData.period,
        '',  // Status Camera (akan diisi dengan warna)
        slot.time,
        slot.data.sm,
        slot.data.mp,
        slot.data.aup,
        slot.data.trMp,
        slot.data.tr,
        slot.data.bs,
        slot.data.ts,
        slot.data.bb,
        slot.data.tb,
        slot.data.gandengSemitrailer,
        slot.data.ktb,
        slot.data.total
      ];
      
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
      const dividerRow = Array(15).fill('');
      dividerRow[0] = 'Lalu Lintas Jam-Jaman Rata-Rata 4 x VR (omit teringgi) (kend/jam)';
      
      XLSX.utils.sheet_add_aoa(worksheet, [dividerRow], { origin: `A${rowIndex + 1}` });
      
      // Menambahkan merger dan styling untuk baris pemisah
      merges.push({
        s: { r: rowIndex, c: 0 },
        e: { r: rowIndex, c: 14 }
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


export const ExportButton = ({ 
  vehicleData, 
  fileName = 'VehicleData',
  className = "btn btn-md bg-green-500 text-white rounded-lg flex items-center gap-2"
}) => {
  const handleExport = () => {
    exportVehicleDataToExcel(vehicleData, fileName);
  };
  
  return (
    <button onClick={handleExport} className={className}>
      <FaDownload />
      Export Excel
    </button>
  );
};