const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaIPendekat = require("../models/sa_i_pendekat.model.js");
const SaIFaseApil = require("../models/sa_i_fase_apil.model.js");

// Parse JSON aman
const safeJsonParse = (jsonString, defaultValue = ['Default Road']) => {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : 
           Array.isArray(jsonString) ? jsonString : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

// Buat survey SA-I lengkap
exports.createCompleteSurvey = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Content tidak boleh kosong!" });
  }

  const { surveyHeader, pendekat, fase } = req.body;
  const sql = require("../config/db.js");
  let connection;

  try {
    connection = await sql.getConnection();
    await connection.beginTransaction();

    // Insert header
    const headerData = {
      simpang_id: surveyHeader.simpangId || surveyHeader.simpang_id || 0,
      tanggal: surveyHeader.tanggal,
      perihal: surveyHeader.perihal,
      kabupaten_kota: surveyHeader.kabupatenKota || surveyHeader.kabupaten_kota || 'Default City',
      lokasi: surveyHeader.lokasi || 'Default Location',
      ruas_jalan_mayor: Array.isArray(surveyHeader.ruasJalanMayor) ? JSON.stringify(surveyHeader.ruasJalanMayor) : JSON.stringify(['Default Road']),
      ruas_jalan_minor: Array.isArray(surveyHeader.ruasJalanMinor) ? JSON.stringify(surveyHeader.ruasJalanMinor) : JSON.stringify(['Default Road']),
      ukuran_kota: surveyHeader.ukuranKota || surveyHeader.ukuran_kota || '0',
      periode: surveyHeader.periode || 'Pertama'
    };

    const [headerResult] = await connection.query("INSERT INTO sa_survey_headers SET ?", headerData);
    const headerId = headerResult.insertId;

    // Insert pendekat
    if (pendekat && Array.isArray(pendekat)) {
      for (const item of pendekat) {
        await connection.query("INSERT INTO sa_i_pendekat SET ?", {
          survey_id: headerId,
          kode_pendekat: item.kodePendekat,
          tipe_lingkungan_jalan: item.tipeLingkunganJalan,
          kelas_hambatan_samping: item.kelasHambatanSamping,
          median: item.median,
          kelandaian_pendekat: item.kelandaianPendekat,
          bkjt: item.bkjt,
          jarak_ke_kendaraan_parkir: item.jarakKeKendaraanParkir,
          lebar_awal_lajur: item.lebarAwalLajur,
          lebar_garis_henti: item.lebarGarisHenti,
          lebar_lajur_bki: item.lebarLajurBki,
          lebar_lajur_keluar: item.lebarLajurKeluar
        });
      }
    }

    // Insert fase APIL
    if (fase && typeof fase === 'object') {
      const directionMap = { 'utara': 'U', 'selatan': 'S', 'timur': 'T', 'barat': 'B' };
      for (const direction of Object.keys(directionMap)) {
        if (fase[direction]) {
          await connection.query("INSERT INTO sa_i_fase_apil SET ?", {
            survey_id: headerId,
            pendekatan: directionMap[direction],
            tipe_pendekat_terlindung: fase[direction].tipe_pendekat?.terlindung || false,
            tipe_pendekat_terlawan: fase[direction].tipe_pendekat?.terlawan || false,
            arah_bki: fase[direction].arah?.bki || false,
            arah_bkijt: fase[direction].arah?.bkijt || false,
            arah_lurus: fase[direction].arah?.lurus || false,
            arah_bka: fase[direction].arah?.bka || false,
            pemisahan_lurus_bka: fase[direction].pemisahan_lurus_bka || false,
            fase_1: fase[direction].fase?.fase_1 || false,
            fase_2: fase[direction].fase?.fase_2 || false,
            fase_3: fase[direction].fase?.fase_3 || false,
            fase_4: fase[direction].fase?.fase_4 || false
          });
        }
      }
    }

    await connection.commit();
    connection.release();
    res.send({ headerId, message: "SA-I tersimpan" });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({ message: error.message || "Error SA-I" });
  }
};

// Ambil survey SA-I lengkap
exports.getCompleteSurvey = async (req, res) => {
  const headerId = req.params.surveyId;
  const sql = require("../config/db.js");
  
  try {
    const [headerRows] = await sql.query("SELECT * FROM sa_survey_headers WHERE id = ?", [headerId]);
    if (headerRows.length === 0) {
      return res.status(404).send({ message: `Survey ${headerId} tidak ditemukan` });
    }

    const header = headerRows[0];
    const [pendekatRows] = await sql.query("SELECT * FROM sa_i_pendekat WHERE survey_id = ?", [headerId]);
    const [faseRows] = await sql.query("SELECT * FROM sa_i_fase_apil WHERE survey_id = ?", [headerId]);

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

    const pendekat = pendekatRows.map(item => ({
      kodePendekat: item.kode_pendekat,
      tipeLingkunganJalan: item.tipe_lingkungan_jalan,
      kelasHambatanSamping: item.kelas_hambatan_samping,
      median: item.median,
      kelandaianPendekat: item.kelandaian_pendekat,
      bkjt: item.bkjt,
      jarakKeKendaraanParkir: item.jarak_ke_kendaraan_parkir,
      lebarAwalLajur: item.lebar_awal_lajur,
      lebarGarisHenti: item.lebar_garis_henti,
      lebarLajurBki: item.lebar_lajur_bki,
      lebarLajurKeluar: item.lebar_lajur_keluar
    }));

    const directionMap = { 'U': 'utara', 'S': 'selatan', 'T': 'timur', 'B': 'barat' };
    const fase = {};
    faseRows.forEach(item => {
      const direction = directionMap[item.pendekatan];
      if (direction) {
        fase[direction] = {
          tipe_pendekat: { terlindung: item.tipe_pendekat_terlindung, terlawan: item.tipe_pendekat_terlawan },
          arah: { bki: item.arah_bki, bkijt: item.arah_bkijt, lurus: item.arah_lurus, bka: item.arah_bka },
          pemisahan_lurus_bka: item.pemisahan_lurus_bka,
          fase: { fase_1: item.fase_1, fase_2: item.fase_2, fase_3: item.fase_3, fase_4: item.fase_4 }
        };
      }
    });

    res.send({ success: true, data: { surveyHeader, pendekat, fase } });

  } catch (error) {
    res.status(500).send({ message: error.message || "Error ambil SA-I" });
  }
};

// Update survey SA-I
exports.updateCompleteSurvey = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Content tidak boleh kosong!" });
  }

  const headerId = req.params.surveyId;
  const { surveyHeader, pendekat, fase } = req.body;
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
    await connection.query("DELETE FROM sa_i_pendekat WHERE survey_id = ?", [headerId]);
    await connection.query("DELETE FROM sa_i_fase_apil WHERE survey_id = ?", [headerId]);

    if (pendekat && Array.isArray(pendekat)) {
      for (const item of pendekat) {
        await connection.query("INSERT INTO sa_i_pendekat SET ?", {
          survey_id: headerId,
          kode_pendekat: item.kodePendekat,
          tipe_lingkungan_jalan: item.tipeLingkunganJalan,
          kelas_hambatan_samping: item.kelasHambatanSamping,
          median: item.median,
          kelandaian_pendekat: item.kelandaianPendekat,
          bkjt: item.bkjt,
          jarak_ke_kendaraan_parkir: item.jarakKeKendaraanParkir,
          lebar_awal_lajur: item.lebarAwalLajur,
          lebar_garis_henti: item.lebarGarisHenti,
          lebar_lajur_bki: item.lebarLajurBki,
          lebar_lajur_keluar: item.lebarLajurKeluar
        });
      }
    }

    if (fase && typeof fase === 'object') {
      const directionMap = { 'utara': 'U', 'selatan': 'S', 'timur': 'T', 'barat': 'B' };
      for (const direction of Object.keys(directionMap)) {
        if (fase[direction]) {
          await connection.query("INSERT INTO sa_i_fase_apil SET ?", {
            survey_id: headerId,
            pendekatan: directionMap[direction],
            tipe_pendekat_terlindung: fase[direction].tipe_pendekat?.terlindung || false,
            tipe_pendekat_terlawan: fase[direction].tipe_pendekat?.terlawan || false,
            arah_bki: fase[direction].arah?.bki || false,
            arah_bkijt: fase[direction].arah?.bkijt || false,
            arah_lurus: fase[direction].arah?.lurus || false,
            arah_bka: fase[direction].arah?.bka || false,
            pemisahan_lurus_bka: fase[direction].pemisahan_lurus_bka || false,
            fase_1: fase[direction].fase?.fase_1 || false,
            fase_2: fase[direction].fase?.fase_2 || false,
            fase_3: fase[direction].fase?.fase_3 || false,
            fase_4: fase[direction].fase?.fase_4 || false
          });
        }
      }
    }

    await connection.commit();
    connection.release();
    res.send({ success: true, message: "SA-I updated" });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({ message: error.message || "Error update SA-I" });
  }
};
