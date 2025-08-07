const SaSurveyHeader = require("../models/sa_survey_header.model.js");
const SaVDelayAnalysis = require("../models/sa_v_delay_analysis.model.js");
const SaVPerformanceSummary = require("../models/sa_v_performance_summary.model.js");

// =====================================================
// SA-V COMPLETE SURVEY OPERATIONS (Phase 6 - 3 APIs)
// =====================================================

// Create a complete SA-V survey in a single transaction
exports.createCompleteSurvey = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const { header, delayData, performanceSummary } = req.body;

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
        const surveyDataRecord = {
          simpang_id: header.simpang_id,
          survey_type: 'SA-V',
          tanggal: header.tanggal,
          perihal: header.perihal,
          status: 'draft'
        };

        const surveyResult = await new Promise((resolve, reject) => {
          connection.query("INSERT INTO sa_surveys SET ?", surveyDataRecord, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        const surveyId = surveyResult.insertId;

        // 2. Create delay analysis records
        if (delayData && Array.isArray(delayData)) {
          for (const delay of delayData) {
            const delayRecord = {
              survey_id: surveyId,
              kode_pendekat: delay.kode,
              arus_lalu_lintas: delay.q,
              kapasitas: delay.c,
              derajat_kejenuhan: delay.dj,
              rasio_hijau: delay.rh,
              nq1: delay.nq1,
              nq2: delay.nq2,
              nq: delay.nq,
              nq_max: delay.nqMax,
              panjang_antrian: delay.pa,
              rasio_kendaraan_terhenti: delay.rqh,
              jumlah_kendaraan_terhenti: delay.nqh,
              tundaan_lalu_lintas: delay.tl,
              tundaan_geometri: delay.tg,
              tundaan_rata_rata: delay.t,
              tundaan_total: delay.tundaanTotal
            };

            await new Promise((resolve, reject) => {
              connection.query("INSERT INTO sa_v_delay_analysis SET ?", delayRecord, (err, result) => {
                if (err) reject(err);
                else resolve(result);
              });
            });
          }
        }

        // 3. Create performance summary record
        if (performanceSummary) {
          const summaryRecord = {
            survey_id: surveyId,
            total_kendaraan_terhenti: performanceSummary.totalKendaraanTerhenti,
            rasio_kendaraan_terhenti_rata: performanceSummary.rasioKendaraanTerhentiRata,
            total_tundaan: performanceSummary.totalTundaan,
            tundaan_simpang_rata: performanceSummary.tundaanSimpangRata,
            level_of_service: performanceSummary.levelOfService,
            performance_evaluation: performanceSummary.performanceEvaluation
          };

          await new Promise((resolve, reject) => {
            connection.query("INSERT INTO sa_v_performance_summary SET ?", summaryRecord, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
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
            message: "SA-V Survey created successfully"
          });
        });

      } catch (error) {
        connection.rollback(() => {
          connection.release();
          res.status(500).send({
            message: "Error creating SA-V survey: " + error.message
          });
        });
      }
    });
  });
};

// Get complete SA-V survey with all related data
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

    // Get delay analysis data
    SaVDelayAnalysis.findBySurveyId(surveyId, (err, delayData) => {
      if (err) {
        res.status(500).send({
          message: "Error retrieving delay data for survey " + surveyId
        });
        return;
      }

      // Get performance summary data
      SaVPerformanceSummary.findBySurveyId(surveyId, (err, performanceSummary) => {
        if (err) {
          res.status(500).send({
            message: "Error retrieving performance summary for survey " + surveyId
          });
          return;
        }

        // Transform data to match expected format
        const header = {
          simpang_id: survey.simpang_id,
          tanggal: survey.tanggal,
          perihal: survey.perihal
        };

        // Transform delay data
        const transformedDelayData = delayData.map(item => ({
          kode: item.kode_pendekat,
          q: item.arus_lalu_lintas,
          c: item.kapasitas,
          dj: item.derajat_kejenuhan,
          rh: item.rasio_hijau,
          nq1: item.nq1,
          nq2: item.nq2,
          nq: item.nq,
          nqMax: item.nq_max,
          pa: item.panjang_antrian,
          rqh: item.rasio_kendaraan_terhenti,
          nqh: item.jumlah_kendaraan_terhenti,
          tl: item.tundaan_lalu_lintas,
          tg: item.tundaan_geometri,
          t: item.tundaan_rata_rata,
          tundaanTotal: item.tundaan_total
        }));

        // Transform performance summary
        const transformedPerformanceSummary = performanceSummary ? {
          totalKendaraanTerhenti: performanceSummary.total_kendaraan_terhenti,
          rasioKendaraanTerhentiRata: performanceSummary.rasio_kendaraan_terhenti_rata,
          totalTundaan: performanceSummary.total_tundaan,
          tundaanSimpangRata: performanceSummary.tundaan_simpang_rata,
          levelOfService: performanceSummary.level_of_service,
          performanceEvaluation: performanceSummary.performance_evaluation
        } : null;

        // Combine all data into the expected format
        const completeSurvey = {
          header,
          delayData: transformedDelayData,
          performanceSummary: transformedPerformanceSummary
        };

        res.send(completeSurvey);
      });
    });
  });
};

// Update a complete SA-V survey
exports.updateCompleteSurvey = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const surveyId = req.params.surveyId;
  const { header, delayData, performanceSummary } = req.body;

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
          const surveyDataRecord = {
            simpang_id: header.simpang_id,
            tanggal: header.tanggal,
            perihal: header.perihal
          };

          await new Promise((resolve, reject) => {
            connection.query("UPDATE sa_surveys SET ? WHERE id = ?", [surveyDataRecord, surveyId], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
        }

        // 2. Delete existing delay and performance data
        await new Promise((resolve, reject) => {
          connection.query("DELETE FROM sa_v_delay_analysis WHERE survey_id = ?", [surveyId], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        await new Promise((resolve, reject) => {
          connection.query("DELETE FROM sa_v_performance_summary WHERE survey_id = ?", [surveyId], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        // 3. Create new delay analysis records (same logic as create)
        if (delayData && Array.isArray(delayData)) {
          for (const delay of delayData) {
            const delayRecord = {
              survey_id: surveyId,
              kode_pendekat: delay.kode,
              arus_lalu_lintas: delay.q,
              kapasitas: delay.c,
              derajat_kejenuhan: delay.dj,
              rasio_hijau: delay.rh,
              nq1: delay.nq1,
              nq2: delay.nq2,
              nq: delay.nq,
              nq_max: delay.nqMax,
              panjang_antrian: delay.pa,
              rasio_kendaraan_terhenti: delay.rqh,
              jumlah_kendaraan_terhenti: delay.nqh,
              tundaan_lalu_lintas: delay.tl,
              tundaan_geometri: delay.tg,
              tundaan_rata_rata: delay.t,
              tundaan_total: delay.tundaanTotal
            };

            await new Promise((resolve, reject) => {
              connection.query("INSERT INTO sa_v_delay_analysis SET ?", delayRecord, (err, result) => {
                if (err) reject(err);
                else resolve(result);
              });
            });
          }
        }

        // 4. Create new performance summary record
        if (performanceSummary) {
          const summaryRecord = {
            survey_id: surveyId,
            total_kendaraan_terhenti: performanceSummary.totalKendaraanTerhenti,
            rasio_kendaraan_terhenti_rata: performanceSummary.rasioKendaraanTerhentiRata,
            total_tundaan: performanceSummary.totalTundaan,
            tundaan_simpang_rata: performanceSummary.tundaanSimpangRata,
            level_of_service: performanceSummary.levelOfService,
            performance_evaluation: performanceSummary.performanceEvaluation
          };

          await new Promise((resolve, reject) => {
            connection.query("INSERT INTO sa_v_performance_summary SET ?", summaryRecord, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
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
            message: "SA-V Survey updated successfully"
          });
        });

      } catch (error) {
        connection.rollback(() => {
          connection.release();
          res.status(500).send({
            message: "Error updating SA-V survey: " + error.message
          });
        });
      }
    });
  });
}; 