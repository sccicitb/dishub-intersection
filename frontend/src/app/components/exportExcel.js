// utils/exportToExcel.ts
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaDownload } from "react-icons/fa6";

export const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });
  const file = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(file, `${fileName}.xlsx`);
};

export const ExportButton = () => {
  const sampleData = [
    { name: 'John Doe', age: 30 },
    { name: 'Jane Smith', age: 28 },
  ];

  const handleExport = () => {
    exportToExcel(sampleData, 'UserData');
  };

  return (
    <button onClick={handleExport} className="btn btn-sm btn-success w-full text-white rounded">
      <FaDownload />
      Export Excel
    </button>
  );
};
