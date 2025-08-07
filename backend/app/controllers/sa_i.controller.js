const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaIPendekat = require("../models/sa_i_pendekat.model.js");
const SaIFaseApil = require("../models/sa_i_fase_apil.model.js");

// =====================================================
// SA-I COMPLETE SURVEY OPERATIONS (Phase 2 - 3 APIs)
// =====================================================

// Create a complete SA-I survey in a single transaction
exports.createCompleteSurvey = (req, res) => {
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
  
  sql.getConnection((err, connection) => {
    if (err) {
      res.status(500).send({
        message: "Database connection error"
      });
      return;
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        connection.release();
        res.status(500).send({
          message: "Transaction start error"
        });
        return;
      }

      try {
        // 1. Create main survey record
        const surveyData = {
          simpang_id: surveyHeader.simpang_id,
          survey_type: 'SA-I',
          tanggal: surveyHeader.tanggal,
          perihal: surveyHeader.perihal,
          status: 'draft'
        };

        const surveyResult = await new Promise((resolve, reject) => {
          connection.query("INSERT INTO sa_surveys SET ?", surveyData, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        const surveyId = surveyResult.insertId;

        // 2. Create pendekat records
        if (pendekat && Array.isArray(pendekat)) {
          for (const pendekatItem of pendekat) {
            const pendekatData = {
              survey_id: surveyId,
              kode_pendekat: pendekatItem.kode_pendekat,
              tipe_lingkungan_jalan: pendekatItem.tipe_lingkungan_jalan,
              kelas_hambatan_samping: pendekatItem.kelas_hambatan_samping,
              median: pendekatItem.median,
              kelandaian_pendekat: pendekatItem.kelandaian_pendekat,
              bkjt: pendekatItem.bkjt,
              jarak_ke_kendaraan_parkir: pendekatItem.jarak_ke_kendaraan_parkir,
              lebar_awal_lajur: pendekatItem.lebar_awal_lajur,
              lebar_garis_henti: pendekatItem.lebar_garis_henti,
              lebar_lajur_bki: pendekatItem.lebar_lajur_bki,
              lebar_lajur_keluar: pendekatItem.lebar_lajur_keluar
            };

            await new Promise((resolve, reject) => {
              connection.query("INSERT INTO sa_i_pendekat SET ?", pendekatData, (err, result) => {
                if (err) reject(err);
                else resolve(result);
              });
            });
          }
        }

        // 3. Create fase APIL records
        if (fase && typeof fase === 'object') {
          const directions = ['utara', 'selatan', 'timur', 'barat'];
          const directionMap = { 'utara': 'U', 'selatan': 'S', 'timur': 'T', 'barat': 'B' };

          for (const direction of directions) {
            if (fase[direction]) {
              const faseData = {
                survey_id: surveyId,
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

              await new Promise((resolve, reject) => {
                connection.query("INSERT INTO sa_i_fase_apil SET ?", faseData, (err, result) => {
                  if (err) reject(err);
                  else resolve(result);
                });
              });
            }
          }
        }

        // Commit transaction
        connection.commit((err) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              res.status(500).send({
                message: "Transaction commit error"
              });
            });
            return;
          }

          connection.release();
          res.send({
            surveyId: surveyId,
            message: "SA-I Survey created successfully"
          });
        });

      } catch (error) {
        connection.rollback(() => {
          connection.release();
          res.status(500).send({
            message: "Error creating SA-I survey: " + error.message
          });
        });
      }
    });
  });
};

// Get complete SA-I survey with all related data
exports.getCompleteSurvey = (req, res) => {
  const surveyId = req.params.surveyId;
  
  // First get the main survey data
  SaSurvey.findById(surveyId, (err, survey) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Survey with id ${surveyId} not found.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving survey with id " + surveyId
        });
      }
      return;
    }

    // Get pendekat data
    SaIPendekat.findBySurveyId(surveyId, (err, pendekatData) => {
      if (err) {
        res.status(500).send({
          message: "Error retrieving pendekat data for survey " + surveyId
        });
        return;
      }

      // Get fase APIL data
      SaIFaseApil.findBySurveyId(surveyId, (err, faseData) => {
        if (err) {
          res.status(500).send({
            message: "Error retrieving fase data for survey " + surveyId
          });
          return;
        }

        // Transform data to match expected format
        const header = {
          simpang_id: survey.simpang_id,
          tanggal: survey.tanggal,
          perihal: survey.perihal
        };

        const pendekat = pendekatData.map(item => ({
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
        
        faseData.forEach(item => {
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

        // Combine all data into the expected format
        const completeSurvey = {
          header,
          pendekat,
          fase
        };

        res.send(completeSurvey);
      });
    });
  });
};

// Update a complete SA-I survey
exports.updateCompleteSurvey = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const surveyId = req.params.surveyId;
  const { header, pendekat, fase } = req.body;

  // Start database transaction
  const sql = require("../config/db.js");
  
  sql.getConnection((err, connection) => {
    if (err) {
      res.status(500).send({
        message: "Database connection error"
      });
      return;
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        connection.release();
        res.status(500).send({
          message: "Transaction start error"
        });
        return;
      }

      try {
        // 1. Update main survey record
        if (header) {
          const surveyData = {
            simpang_id: header.simpang_id,
            tanggal: header.tanggal,
            perihal: header.perihal
          };

          await new Promise((resolve, reject) => {
            connection.query("UPDATE sa_surveys SET ? WHERE id = ?", [surveyData, surveyId], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
        }

        // 2. Delete existing pendekat and fase records
        await new Promise((resolve, reject) => {
          connection.query("DELETE FROM sa_i_pendekat WHERE survey_id = ?", [surveyId], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        await new Promise((resolve, reject) => {
          connection.query("DELETE FROM sa_i_fase_apil WHERE survey_id = ?", [surveyId], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        // 3. Create new pendekat records
        if (pendekat && Array.isArray(pendekat)) {
          for (const pendekatItem of pendekat) {
            const pendekatData = {
              survey_id: surveyId,
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

            await new Promise((resolve, reject) => {
              connection.query("INSERT INTO sa_i_pendekat SET ?", pendekatData, (err, result) => {
                if (err) reject(err);
                else resolve(result);
              });
            });
          }
        }

        // 4. Create new fase APIL records
        if (fase && typeof fase === 'object') {
          const directions = ['utara', 'selatan', 'timur', 'barat'];
          const directionMap = { 'utara': 'U', 'selatan': 'S', 'timur': 'T', 'barat': 'B' };

          for (const direction of directions) {
            if (fase[direction]) {
              const faseData = {
                survey_id: surveyId,
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

              await new Promise((resolve, reject) => {
                connection.query("INSERT INTO sa_i_fase_apil SET ?", faseData, (err, result) => {
                  if (err) reject(err);
                  else resolve(result);
                });
              });
            }
          }
        }

        // Commit transaction
        connection.commit((err) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              res.status(500).send({
                message: "Transaction commit error"
              });
            });
            return;
          }

          connection.release();
          res.send({
            message: "SA-I Survey updated successfully"
          });
        });

      } catch (error) {
        connection.rollback(() => {
          connection.release();
          res.status(500).send({
            message: "Error updating SA-I survey: " + error.message
          });
        });
      }
    });
  });
}; 