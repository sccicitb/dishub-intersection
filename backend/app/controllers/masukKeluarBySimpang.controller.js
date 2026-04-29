const MasukKeluarBySimpang = require("../models/masukKeluarBySimpang.model");

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/;
const isTimeoutError = (error) => {
  const code = error?.code || "";
  const message = error?.message || "";
  return code === "PROTOCOL_SEQUENCE_TIMEOUT" || code === "ER_QUERY_TIMEOUT" || message.toLowerCase().includes("timeout");
};

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
    const rawSimpangId = req.query.simpang_id;
    const rawStartDate = req.query.start_date || req.query.startDate;
    const rawEndDate = req.query.end_date || req.query.endDate;

    const isAll = rawSimpangId === "semua" || rawSimpangId === "all";
    const simpangId = isAll ? null : Number.parseInt(rawSimpangId, 10);
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

    const data = await MasukKeluarBySimpang.findByFilter(simpangId, startDate, endDate, isAll);

    const totalMasuk = data.reduce((sum, item) => sum + Number(item.Kendaraan_Masuk || 0), 0);
    const totalKeluar = data.reduce((sum, item) => sum + Number(item.Kendaraan_Keluar || 0), 0);

    const totalPerArahMap = data.reduce((acc, curr) => {
      const arah = curr.Direction_To;

      if (!acc[arah]) {
        acc[arah] = {
          ID_Simpang: "TOTAL",
          Nama_Simpang: "SEMUA SIMPANG",
          Direction_To: arah,
          Kendaraan_Masuk: 0,
          Kendaraan_Keluar: 0,
          Update_Terakhir: curr.Update_Terakhir
        };
      }

      acc[arah].Kendaraan_Masuk += Number(curr.Kendaraan_Masuk || 0);
      acc[arah].Kendaraan_Keluar += Number(curr.Kendaraan_Keluar || 0);

      if (new Date(curr.Update_Terakhir) > new Date(acc[arah].Update_Terakhir)) {
        acc[arah].Update_Terakhir = curr.Update_Terakhir;
      }

      return acc;
    }, {});

    const summaryPerArah = Object.values(totalPerArahMap);

    return res.json({
      status: "ok",
      filters: {
        simpang_id: isAll ? "semua" : simpangId,
        start_date: startDate,
        end_date: endDate
      },
      total_rows: data.length,
      overall_summary: {
        total_kendaraan_masuk: totalMasuk,
        total_kendaraan_keluar: totalKeluar,
        grand_total: totalMasuk + totalKeluar
      },
      summary_per_arah: summaryPerArah,
      data: data
    });
  } catch (error) {
    if (isTimeoutError(error)) {
      return res.status(408).json({
        status: "error",
        message: "Request timeout - query took too long"
      });
    }
    return res.status(500).json({
      status: "error",
      message: error.message || "Terjadi kesalahan saat mengambil data masuk/keluar kendaraan."
    });
  }
};
