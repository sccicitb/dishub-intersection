const fs = require("fs");
const ExcelJS = require("exceljs");
const csv = require("csv-parser");
const path = require("path");

function normalizeDate(input) {
  const date = new Date(input);
  if (isNaN(date)) return null;
  return date.toISOString().split("T")[0];
}

function processRows(rows) {
  return rows.map((row) => ({
    date: normalizeDate(row.tanggal || row.date),
    event_type: row.events || row.event_type,
    description: row.keterangan || row.description,
  })).filter(e => e.date && e.event_type && e.description);
}

async function parseHolidayFile(filePath, ext) {
  ext = ext.toLowerCase();

  if (ext === ".json") {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const rows = raw.holidays || raw;
    return processRows(rows);
  }

  if (ext === ".xlsx" || ext === ".xls") {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    const rows = [];
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const header = worksheet.getRow(1).getCell(colNumber).value;
        rowData[header] = cell.value;
      });
      rows.push(rowData);
    });
    
    return processRows(rows);
  }

  if (ext === ".csv") {
    return new Promise((resolve, reject) => {
      const rows = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", () => resolve(processRows(rows)))
        .on("error", reject);
    });
  }

  throw new Error("Unsupported file type");
}

module.exports = { parseHolidayFile };
