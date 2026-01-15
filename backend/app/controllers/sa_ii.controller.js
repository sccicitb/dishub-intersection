const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaIIVehicleData = require("../models/sa_ii_vehicle_data.model.js");

// Parse JSON aman
const safeJsonParse = (jsonString, defaultValue = ['Default Road']) => {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : 
           Array.isArray(jsonString) ? jsonString : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

// Buat survey SA-II lengkap
exports.createCompleteSurvey = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Content tidak boleh kosong!" });
  }

  const { surveyHeader, ekuivalensi, surveyData } = req.body;
  const sql = require("../config/db.js");
  let connection;

  try {
    connection = await sql.getConnection();
    await connection.beginTransaction();

    const headerId = surveyHeader.id;

    // Insert equivalences
    if (ekuivalensi) {
      const eq = ekuivalensi;
      for (const type of ['terlindung', 'terlawan']) {
        await connection.query("INSERT INTO sa_ii_equivalences SET ?", {
          survey_id: headerId,
          type,
          mp: parseFloat(eq[type]?.mp || 0),
          ks: parseFloat(eq[type]?.ks || 0),
          sm: parseFloat(eq[type]?.sm || 0)
        });
      }
    }

    // Insert vehicle data
    if (surveyData && Array.isArray(surveyData)) {
      for (const directionData of surveyData) {
        const direction = directionData.direction;

        if (Array.isArray(directionData.rows)) {
          for (const row of directionData.rows) {
            await connection.query("INSERT INTO sa_ii_vehicle_data SET ?", {
              survey_id: headerId,
              direction,
              record_type: "row",
              movement_type: row.type || null,
              mp_kendjam: row.mp?.kendjam || 0,
              mp_terlindung: row.mp?.terlindung || 0,
              mp_terlawan: row.mp?.terlawan || 0,
              ks_kendjam: row.ks?.kendjam || 0,
              ks_terlindung: row.ks?.terlindung || 0,
              ks_terlawan: row.ks?.terlawan || 0,
              sm_kendjam: row.sm?.kendjam || 0,
              sm_terlindung: row.sm?.terlindung || 0,
              sm_terlawan: row.sm?.terlawan || 0,
              sm_smp_terlindung: row.sm?.smpTerlindung || 0,
              sm_smp_terlawan: row.sm?.smpTerlawan || 0,
              total_kendjam: row.total?.kendjam || 0,
              total_terlindung: row.total?.terlindung || 0,
              total_terlawan: row.total?.terlawan || 0,
              total_smp_terlindung: row.total?.smpTerlindung || 0,
              total_smp_terlawan: row.total?.smpTerlawan || 0,
              ktb_count: row.ktb?.count || 0,
              ktb_ratio: row.ktb?.rasio || 0,
              rktb_value: row.rktb || 0
            });
          }
        }

        if (directionData.subtotal) {
          const sub = directionData.subtotal;
          await connection.query("INSERT INTO sa_ii_vehicle_data SET ?", {
            survey_id: headerId,
            direction,
            record_type: "subtotal",
            movement_type: null,
            mp_kendjam: sub.mp?.kendjam || 0,
            mp_terlindung: sub.mp?.terlindung || 0,
            mp_terlawan: sub.mp?.terlawan || 0,
            ks_kendjam: sub.ks?.kendjam || 0,
            ks_terlindung: sub.ks?.terlindung || 0,
            ks_terlawan: sub.ks?.terlawan || 0,
            sm_kendjam: sub.sm?.kendjam || 0,
            sm_terlindung: sub.sm?.terlindung || 0,
            sm_terlawan: sub.sm?.terlawan || 0,
            sm_smp_terlindung: sub.sm?.smpTerlindung || 0,
            sm_smp_terlawan: sub.sm?.smpTerlawan || 0,
            total_kendjam: sub.total?.kendjam || 0,
            total_terlindung: sub.total?.terlindung || 0,
            total_terlawan: sub.total?.terlawan || 0,
            total_smp_terlindung: sub.total?.smpTerlindung || 0,
            total_smp_terlawan: sub.total?.smpTerlawan || 0,
            ktb_total: sub.ktb || 0,
            rktb_total: sub.rktb || 0
          });
        }
      }
    }

    await connection.commit();
    connection.release();
    res.send({ headerId, message: "SA-II tersimpan" });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({ message: error.message || "Error SA-II" });
  }
};

// Ambil survey SA-II
exports.getCompleteSurvey = async (req, res) => {
  const headerId = req.params.surveyId;
  const sql = require("../config/db.js");

  try {
    const [headerRows] = await sql.query("SELECT * FROM sa_survey_headers WHERE id = ?", [headerId]);
    if (headerRows.length === 0) {
      return res.status(404).send({ message: `Survey ${headerId} tidak ditemukan` });
    }

    const header = headerRows[0];
    const surveyHeader = {
      id: header.id,
      simpangId: header.simpang_id,
      tanggal: header.tanggal,
      kabupatenKota: header.kabupaten_kota,
      lokasi: header.lokasi,
      ruasJalanMayor: safeJsonParse(header.ruas_jalan_mayor),
      ruasJalanMinor: safeJsonParse(header.ruas_jalan_minor),
      ukuranKota: header.ukuran_kota,
      perihal: header.perihal,
      periode: header.periode,
      createdAt: header.created_at,
      updatedAt: header.updated_at
    };

    // Ambil equivalences
    const [equivRows] = await sql.query("SELECT * FROM sa_ii_equivalences WHERE survey_id = ?", [headerId]);
    const ekuivalensi = {};
    equivRows.forEach(item => {
      ekuivalensi[item.type] = {
        mp: parseFloat(item.mp),
        ks: parseFloat(item.ks),
        sm: parseFloat(item.sm)
      };
    });

    // Ambil vehicle data
    const [vehicleRows] = await sql.query("SELECT * FROM sa_ii_vehicle_data WHERE survey_id = ?", [headerId]);
    const surveyDataMap = {};
    vehicleRows.forEach(item => {
      if (!surveyDataMap[item.direction]) {
        surveyDataMap[item.direction] = { rows: [], subtotal: null };
      }

      if (item.record_type === 'row') {
        surveyDataMap[item.direction].rows.push({
          type: item.movement_type,
          mp: { kendjam: item.mp_kendjam, terlindung: item.mp_terlindung, terlawan: item.mp_terlawan },
          ks: { kendjam: item.ks_kendjam, terlindung: item.ks_terlindung, terlawan: item.ks_terlawan },
          sm: { kendjam: item.sm_kendjam, terlindung: item.sm_terlindung, terlawan: item.sm_terlawan, smpTerlindung: parseFloat(item.sm_smp_terlindung), smpTerlawan: parseFloat(item.sm_smp_terlawan) },
          total: { kendjam: item.total_kendjam, terlindung: item.total_terlindung, terlawan: item.total_terlawan, smpTerlindung: parseFloat(item.total_smp_terlindung), smpTerlawan: parseFloat(item.total_smp_terlawan) },
          ktb: { count: item.ktb_count, rasio: parseFloat(item.ktb_ratio) },
          rktb: parseFloat(item.rktb_value)
        });
      } else if (item.record_type === 'subtotal') {
        surveyDataMap[item.direction].subtotal = {
          mp: { kendjam: item.mp_kendjam, terlindung: item.mp_terlindung, terlawan: item.mp_terlawan },
          ks: { kendjam: item.ks_kendjam, terlindung: item.ks_terlindung, terlawan: item.ks_terlawan },
          sm: { kendjam: item.sm_kendjam, terlindung: item.sm_terlindung, terlawan: item.sm_terlawan, smpTerlindung: parseFloat(item.sm_smp_terlindung), smpTerlawan: parseFloat(item.sm_smp_terlawan) },
          total: { kendjam: item.total_kendjam, terlindung: item.total_terlindung, terlawan: item.total_terlawan, smpTerlindung: parseFloat(item.total_smp_terlindung), smpTerlawan: parseFloat(item.total_smp_terlawan) },
          ktb: item.ktb_total,
          rktb: parseFloat(item.rktb_total)
        };
      }
    });

    const surveyData = Object.keys(surveyDataMap).map(direction => ({
      direction,
      rows: surveyDataMap[direction].rows,
      subtotal: surveyDataMap[direction].subtotal
    }));

    res.send({ success: true, data: { surveyHeader, ekuivalensi, surveyData } });

  } catch (error) {
    res.status(500).send({ message: error.message || "Error ambil SA-II" });
  }
};

// Update survey SA-II
exports.updateCompleteSurvey = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Content tidak boleh kosong!" });
  }

  const headerId = req.params.surveyId;
  const { surveyHeader, ekuivalensi, surveyData } = req.body;
  const sql = require("../config/db.js");
  let connection;

  try {
    connection = await sql.getConnection();
    await connection.beginTransaction();

    // Update header
    if (surveyHeader) {
      const headerData = {
        simpang_id: surveyHeader.simpangId || surveyHeader.simpang_id || 0,
        tanggal: surveyHeader.tanggal,
        perihal: surveyHeader.perihal,
        kabupaten_kota: surveyHeader.kabupatenKota || surveyHeader.kabupaten_kota,
        lokasi: surveyHeader.lokasi,
        ruas_jalan_mayor: Array.isArray(surveyHeader.ruasJalanMayor) ? JSON.stringify(surveyHeader.ruasJalanMayor) : surveyHeader.ruasJalanMayor,
        ruas_jalan_minor: Array.isArray(surveyHeader.ruasJalanMinor) ? JSON.stringify(surveyHeader.ruasJalanMinor) : surveyHeader.ruasJalanMinor,
        ukuran_kota: surveyHeader.ukuranKota || surveyHeader.ukuran_kota,
        periode: surveyHeader.periode
      };
      await connection.query("UPDATE sa_survey_headers SET ? WHERE id = ?", [headerData, headerId]);
    }

    // Delete dan insert ulang
    await connection.query("DELETE FROM sa_ii_vehicle_data WHERE survey_id = ?", [headerId]);
    await connection.query("DELETE FROM sa_ii_equivalences WHERE survey_id = ?", [headerId]);

    if (ekuivalensi) {
      const eq = ekuivalensi;
      for (const type of ['terlindung', 'terlawan']) {
        await connection.query("INSERT INTO sa_ii_equivalences SET ?", {
          survey_id: headerId,
          type,
          mp: parseFloat(eq[type]?.mp || 0),
          ks: parseFloat(eq[type]?.ks || 0),
          sm: parseFloat(eq[type]?.sm || 0)
        });
      }
    }

    if (surveyData && Array.isArray(surveyData)) {
      for (const directionData of surveyData) {
        const direction = directionData.direction;

        if (Array.isArray(directionData.rows)) {
          for (const row of directionData.rows) {
            await connection.query("INSERT INTO sa_ii_vehicle_data SET ?", {
              survey_id: headerId,
              direction,
              record_type: "row",
              movement_type: row.type || null,
              mp_kendjam: row.mp?.kendjam || 0,
              mp_terlindung: row.mp?.terlindung || 0,
              mp_terlawan: row.mp?.terlawan || 0,
              ks_kendjam: row.ks?.kendjam || 0,
              ks_terlindung: row.ks?.terlindung || 0,
              ks_terlawan: row.ks?.terlawan || 0,
              sm_kendjam: row.sm?.kendjam || 0,
              sm_terlindung: row.sm?.terlindung || 0,
              sm_terlawan: row.sm?.terlawan || 0,
              sm_smp_terlindung: row.sm?.smpTerlindung || 0,
              sm_smp_terlawan: row.sm?.smpTerlawan || 0,
              total_kendjam: row.total?.kendjam || 0,
              total_terlindung: row.total?.terlindung || 0,
              total_terlawan: row.total?.terlawan || 0,
              total_smp_terlindung: row.total?.smpTerlindung || 0,
              total_smp_terlawan: row.total?.smpTerlawan || 0,
              ktb_count: row.ktb?.count || 0,
              ktb_ratio: row.ktb?.rasio || 0,
              rktb_value: row.rktb || 0
            });
          }
        }

        if (directionData.subtotal) {
          const sub = directionData.subtotal;
          await connection.query("INSERT INTO sa_ii_vehicle_data SET ?", {
            survey_id: headerId,
            direction,
            record_type: "subtotal",
            movement_type: null,
            mp_kendjam: sub.mp?.kendjam || 0,
            mp_terlindung: sub.mp?.terlindung || 0,
            mp_terlawan: sub.mp?.terlawan || 0,
            ks_kendjam: sub.ks?.kendjam || 0,
            ks_terlindung: sub.ks?.terlindung || 0,
            ks_terlawan: sub.ks?.terlawan || 0,
            sm_kendjam: sub.sm?.kendjam || 0,
            sm_terlindung: sub.sm?.terlindung || 0,
            sm_terlawan: sub.sm?.terlawan || 0,
            sm_smp_terlindung: sub.sm?.smpTerlindung || 0,
            sm_smp_terlawan: sub.sm?.smpTerlawan || 0,
            total_kendjam: sub.total?.kendjam || 0,
            total_terlindung: sub.total?.terlindung || 0,
            total_terlawan: sub.total?.terlawan || 0,
            total_smp_terlindung: sub.total?.smpTerlindung || 0,
            total_smp_terlawan: sub.total?.smpTerlawan || 0,
            ktb_total: sub.ktb || 0,
            rktb_total: sub.rktb || 0
          });
        }
      }
    }

    await connection.commit();
    connection.release();
    res.send({ success: true, message: "SA-II updated" });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({ message: error.message || "Error update SA-II" });
  }
};

// Ambil arus kendaraan agregat
exports.getArusKendaraan = async (req, res) => {
  const surveyId = req.params.surveyId;
  try {
    const survey = await SaIIVehicleData.validateSurveyExists(surveyId);
    if (!survey) {
      return res.status(404).send({ success: false, message: `Survey ${surveyId} tidak ditemukan` });
    }

    const surveyHeader = await SaSurveyHeader.findById(surveyId);
    if (!surveyHeader) {
      return res.status(404).send({ success: false, message: `Survey header ${surveyId} tidak ditemukan` });
    }

    const simpangId = surveyHeader.simpang_id;
    if (!simpangId || simpangId === 0) {
      return res.status(400).send({ success: false, message: `Simpang ID tidak valid` });
    }

    const arusData = await SaIIVehicleData.getArusAggregatedData(simpangId);
    if (arusData.length === 0) {
      return res.status(404).send({ success: false, message: `Tidak ada data kendaraan` });
    }

    res.send({ success: true, data: arusData });

  } catch (error) {
    res.status(500).send({ success: false, message: error.message || "Error ambil arus" });
  }
};

exports.getEMPConfigurations = async (req, res) => {
  try {
    const sql = require("../config/db.js");
    const [rows] = await sql.query("SELECT * FROM emp_configuration");
    res.send({ success: true, data: rows });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message || "Error ambil konfigurasi EMP" });
  }
};

exports.checkAvailableDirections = async (req, res) => {
  const simpangId = req.params.simpangId;
  try {
    const directions = await SaIIVehicleData.getAvailableDirections(simpangId);
    res.send({ success: true, data: directions });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message || "Error ambil arah" });
  }
};
