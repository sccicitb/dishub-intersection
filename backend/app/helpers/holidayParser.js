const fs = require("fs");
const xlsx = require("xlsx");
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
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
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
