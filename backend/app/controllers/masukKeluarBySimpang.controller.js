const MasukKeluarBySimpang = require("../models/masukKeluarBySimpang.model");

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/;

const normalizeDateTime = (value, isEnd = false) => {
  if (!value) {
    return null;
  }

  if (DATE_ONLY_REGEX.test(value)) {
    return `${value} ${isEnd ? "23:59:59" : "00:00:00"}`;
  }

  if (DATETIME_REGEX.test(value)) {
    return value.length === 16 ? `${value}:00` : value;
  }

  return value;
};

const isValidDateTime = (value) => !Number.isNaN(new Date(value).getTime());

exports.getMasukKeluarBySimpang = async (req, res) => {
  try {
    const simpangId = Number.parseInt(req.query.simpang_id, 10);
    const rawStartDate = req.query.start_date || req.query.startDate;
    const rawEndDate = req.query.end_date || req.query.endDate;

    if (!req.query.simpang_id || Number.isNaN(simpangId)) {
      return res.status(400).json({
        status: "error",
        message: "Parameter simpang_id wajib berupa angka."
      });
    }

    if (!rawStartDate || !rawEndDate) {
      return res.status(400).json({
        status: "error",
        message: "Parameter start_date dan end_date wajib diisi."
      });
    }

    const startDate = normalizeDateTime(rawStartDate, false);
    const endDate = normalizeDateTime(rawEndDate, true);

    if (!isValidDateTime(startDate) || !isValidDateTime(endDate)) {
      return res.status(400).json({
        status: "error",
        message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD atau YYYY-MM-DD HH:mm:ss."
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        status: "error",
        message: "start_date tidak boleh lebih besar dari end_date."
      });
    }

    const data = await MasukKeluarBySimpang.findByFilter(simpangId, startDate, endDate);

    return res.json({
      status: "ok",
      filters: {
        simpang_id: simpangId,
        start_date: startDate,
        end_date: endDate
      },
      total_rows: data.length,
      data
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Terjadi kesalahan saat mengambil data masuk/keluar kendaraan."
    });
  }
};
