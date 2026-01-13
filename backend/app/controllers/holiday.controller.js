const Holiday = require("../models/holiday.model");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const csv = require("csv-parser");
const { parseHolidayFile } = require("../helpers/holidayParser");
const { formatTanggalIndo } = require("../helpers/formatTanggal");


// Ambil semua data (tanpa pagination)
exports.getAll = (req, res) => {
  Holiday.getAll((err, data) => {
    if (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }

    const holidays = data.map(item => ({
        tanggal: formatTanggalIndo(item.date),
        events: item.event_type,
        keterangan: item.description
      }));      

    res.json({ holidays });
  });
};


// Ambil dengan pagination
exports.getPaginated = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  Holiday.getPaginated(page, limit, (err, data) => {
    if (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }

    // Ambil total count untuk pagination
    Holiday.countAll((err2, total) => {
      if (err2) {
        return res.status(500).json({ status: "error", message: err2.message });
      }

      const holidays = data.map(item => ({
        id: item.id,
        tanggal: formatTanggalIndo(item.date),
        events: item.event_type,
        keterangan: item.description
      }));

      res.json({
        total,
        page,
        limit,
        holidays
      });
    });
  });
};


// Tambah data
exports.create = (req, res) => {
  const { date, event_type, description } = req.body;
  Holiday.create({ date, event_type, description }, (err, data) => {
    if (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }
    res.status(201).json({ status: "ok", data });
  });
};

// Update data
exports.update = (req, res) => {
  const id = req.params.id;
  const { date, event_type, description } = req.body;

  Holiday.update(id, { date, event_type, description }, (err, data) => {
    if (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }
    res.json({ status: "ok", data });
  });
};

// Hapus data
exports.remove = (req, res) => {
  const id = req.params.id;
  Holiday.delete(id, (err, data) => {
    if (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }
    res.json({ status: "ok", data });
  });
};

// Import file
exports.importData = async (req, res) => {
  const mode = req.body.mode || "append";
  const file = req.file;

  if (!file) {
    return res.status(400).json({ status: "error", message: "No file uploaded." });
  }

  try {
    const ext = path.extname(file.originalname);
    const rows = await parseHolidayFile(file.path, ext);

    if (mode === "replace") {
      Holiday.replaceAll(rows, (err, data) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "ok", mode, ...data });
      });
    } else {
      Holiday.appendOrUpdate(rows, (err, data) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "ok", mode, ...data });
      });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
