const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaIPendekat = require("../models/sa_i_pendekat.model.js");
const SaIFaseApil = require("../models/sa_i_fase_apil.model.js");

// Helper function to safely parse JSON
const safeJsonParse = (jsonString, defaultValue = ['Default Road']) => {
  try {
    if (typeof jsonString === 'string') {
      return JSON.parse(jsonString);
    } else if (Array.isArray(jsonString)) {
      return jsonString;
    } else {
      return defaultValue;
    }
  } catch (error) {
    console.warn('JSON parse error:', error.message, 'for value:', jsonString);
    return defaultValue;
  }
};

// =====================================================
// SA-I COMPLETE SURVEY OPERATIONS (Phase 2 - 3 APIs)
// =====================================================

// Create a complete SA-I survey in a single transaction
exports.createCompleteSurvey = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const { surveyHeader, pendekat, fase } = req.body;

  // Start database transaction
  const sql = require("../config/db.js");
  
  let connection;
  try {
    connection = await sql.getConnection();
    
    await connection.beginTransaction();

    // 1. Create main survey header record
    const headerData = {
      tanggal: surveyHeader.tanggal,
      perihal: surveyHeader.perihal,
      kabupaten_kota: surveyHeader.kabupatenKota || surveyHeader.kabupaten_kota || 'Default City',
      lokasi: surveyHeader.lokasi || 'Default Location',
      ruas_jalan_mayor: Array.isArray(surveyHeader.ruasJalanMayor) 
        ? JSON.stringify(surveyHeader.ruasJalanMayor) 
        : JSON.stringify(['Default Road']),
      ruas_jalan_minor: Array.isArray(surveyHeader.ruasJalanMinor) 
        ? JSON.stringify(surveyHeader.ruasJalanMinor) 
        : JSON.stringify(['Default Road']),
      ukuran_kota: surveyHeader.ukuranKota || surveyHeader.ukuran_kota || '0',
      periode: surveyHeader.periode || 'Pertama'
    };

    const [headerResult] = await connection.query("INSERT INTO sa_survey_headers SET ?", headerData);
    const headerId = headerResult.insertId;

    // 2. Create pendekat records
    if (pendekat && Array.isArray(pendekat)) {
      for (const pendekatItem of pendekat) {
        const pendekatData = {
          survey_id: headerId,
          kode_pendekat: pendekatItem.kodePendekat,
          tipe_lingkungan_jalan: pendekatItem.tipeLingkunganJalan,
          kelas_hambatan_samping: pendekatItem.kelasHambatanSamping,
          median: pendekatItem.median,
          kelandaian_pendekat: pendekatItem.kelandaianPendekat,
          bkjt: pendekatItem.bkjt,
          jarak_ke_kendaraan_parkir: pendekatItem.jarakKeKendaraanParkir,
          lebar_awal_lajur: pendekatItem.lebarAwalLajur,
          lebar_garis_henti: pendekatItem.lebarGarisHenti,
          lebar_lajur_bki: pendekatItem.lebarLajurBki,
          lebar_lajur_keluar: pendekatItem.lebarLajurKeluar
        };

        await connection.query("INSERT INTO sa_i_pendekat SET ?", pendekatData);
      }
    }

    // 3. Create fase APIL records
    if (fase && typeof fase === 'object') {
      const directions = ['utara', 'selatan', 'timur', 'barat'];
      const directionMap = { 'utara': 'U', 'selatan': 'S', 'timur': 'T', 'barat': 'B' };

      for (const direction of directions) {
        if (fase[direction]) {
          const faseData = {
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
          };

          await connection.query("INSERT INTO sa_i_fase_apil SET ?", faseData);
        }
      }
    }

    // Commit transaction
    await connection.commit();
    
    connection.release();
    res.send({
      headerId: headerId,
      message: "SA-I Survey created successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({
      message: error.message || "Some error occurred while creating the SA-I survey."
    });
  }
};

// Get complete SA-I survey with all related data
exports.getCompleteSurvey = async (req, res) => {
  const headerId = req.params.surveyId;
  const sql = require("../config/db.js");
  
  try {
    // First get the main header data
    const [headerRows] = await sql.query("SELECT * FROM sa_survey_headers WHERE id = ?", [headerId]);
    
    if (headerRows.length === 0) {
      return res.status(404).send({
        message: `Survey header with id ${headerId} not found.`
      });
    }

    const header = headerRows[0];

    // Get pendekat data
    const [pendekatRows] = await sql.query("SELECT * FROM sa_i_pendekat WHERE survey_id = ?", [headerId]);
    
    // Get fase APIL data
    const [faseRows] = await sql.query("SELECT * FROM sa_i_fase_apil WHERE survey_id = ?", [headerId]);

    // Transform header data to match expected format
    const surveyHeader = {
      id: header.id,
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

    // Transform fase data to expected format
    const fase = {};
    const directionMap = { 'U': 'utara', 'S': 'selatan', 'T': 'timur', 'B': 'barat' };
    
    faseRows.forEach(item => {
      const direction = directionMap[item.pendekatan];
      if (direction) {
        fase[direction] = {
          tipe_pendekat: {
            terlindung: item.tipe_pendekat_terlindung,
            terlawan: item.tipe_pendekat_terlawan
          },
          arah: {
            bki: item.arah_bki,
            bkijt: item.arah_bkijt,
            lurus: item.arah_lurus,
            bka: item.arah_bka
          },
          pemisahan_lurus_bka: item.pemisahan_lurus_bka,
          fase: {
            fase_1: item.fase_1,
            fase_2: item.fase_2,
            fase_3: item.fase_3,
            fase_4: item.fase_4
          }
        };
      }
    });

    res.send({
      success: true,
      data: {
        surveyHeader,
        pendekat,
        fase
      }
    });

  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving the SA-I survey."
    });
  }
};

// Update a complete SA-I survey
exports.updateCompleteSurvey = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const headerId = req.params.surveyId;
  const { surveyHeader, pendekat, fase } = req.body;

  // Start database transaction
  const sql = require("../config/db.js");
  
  let connection;
  try {
    connection = await sql.getConnection();
    
    await connection.beginTransaction();

    // 1. Update main header record
    if (surveyHeader) {
      const headerData = {
        tanggal: surveyHeader.tanggal,
        perihal: surveyHeader.perihal,
        kabupaten_kota: surveyHeader.kabupatenKota || surveyHeader.kabupaten_kota,
        lokasi: surveyHeader.lokasi,
        ruas_jalan_mayor: Array.isArray(surveyHeader.ruasJalanMayor) 
          ? JSON.stringify(surveyHeader.ruasJalanMayor) 
          : surveyHeader.ruasJalanMayor,
        ruas_jalan_minor: Array.isArray(surveyHeader.ruasJalanMinor) 
          ? JSON.stringify(surveyHeader.ruasJalanMinor) 
          : surveyHeader.ruasJalanMinor,
        ukuran_kota: surveyHeader.ukuranKota || surveyHeader.ukuran_kota,
        periode: surveyHeader.periode
      };

      await connection.query("UPDATE sa_survey_headers SET ? WHERE id = ?", [headerData, headerId]);
    }

    // 2. Delete existing pendekat and fase records
    await connection.query("DELETE FROM sa_i_pendekat WHERE survey_id = ?", [headerId]);
    await connection.query("DELETE FROM sa_i_fase_apil WHERE survey_id = ?", [headerId]);

    // 3. Create new pendekat records
    if (pendekat && Array.isArray(pendekat)) {
      for (const pendekatItem of pendekat) {
        const pendekatData = {
          survey_id: headerId,
          kode_pendekat: pendekatItem.kodePendekat,
          tipe_lingkungan_jalan: pendekatItem.tipeLingkunganJalan,
          kelas_hambatan_samping: pendekatItem.kelasHambatanSamping,
          median: pendekatItem.median,
          kelandaian_pendekat: pendekatItem.kelandaianPendekat,
          bkjt: pendekatItem.bkjt,
          jarak_ke_kendaraan_parkir: pendekatItem.jarakKeKendaraanParkir,
          lebar_awal_lajur: pendekatItem.lebarAwalLajur,
          lebar_garis_henti: pendekatItem.lebarGarisHenti,
          lebar_lajur_bki: pendekatItem.lebarLajurBki,
          lebar_lajur_keluar: pendekatItem.lebarLajurKeluar
        };

        await connection.query("INSERT INTO sa_i_pendekat SET ?", pendekatData);
      }
    }

    // 4. Create new fase APIL records
    if (fase && typeof fase === 'object') {
      const directions = ['utara', 'selatan', 'timur', 'barat'];
      const directionMap = { 'utara': 'U', 'selatan': 'S', 'timur': 'T', 'barat': 'B' };

      for (const direction of directions) {
        if (fase[direction]) {
          const faseData = {
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
          };

          await connection.query("INSERT INTO sa_i_fase_apil SET ?", faseData);
        }
      }
    }

    // Commit transaction
    await connection.commit();
    
    connection.release();
    res.send({
      success: true,
      message: "SA-I Survey updated successfully"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).send({
      message: error.message || "Some error occurred while updating the SA-I survey."
    });
  }
}; 