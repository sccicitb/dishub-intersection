const db = require('../app/config/db');
const cron = require('node-cron');
const surveyModel = require('../app/models/survey.model');
const subCodeMap = require('../app/helpers/subCodeMap');
const fs = require('fs');
const path = require('path');

/**
 * Job untuk update camera status berdasarkan ketersediaan data di survey
 * Jika ada data survey → camera aktif (status = 1)
 * Jika tidak ada data survey → camera offline (status = 0)
 */
const updateCameraStatusFromSurvey = () => {
  // Jalankan setiap 5 menit
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log(`[${new Date().toISOString()}] 📡 Checking camera status from survey data...`);
      
      // Get all cameras
      const [cameras] = await db.execute('SELECT id, ID_Simpang FROM cameras');
      
      // Load classification data
      const classificationPath = path.join(__dirname, '../app/data/classification.json');
      const classificationJson = JSON.parse(fs.readFileSync(classificationPath, 'utf-8'));
      
      for (const camera of cameras) {
        try {
          const simpangId = camera.ID_Simpang;
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          
          // Prepare filters seperti di survey controller
          const filters = {
            simpangId,
            approach: 'semua',
            direction: null,
            classificationType: 'luar_kota'
          };
          
          // Ambil subCode list berdasarkan klasifikasi
          const rawSubCodes = classificationJson
            .filter(item => item.type === filters.classificationType)
            .map(item => item.subCode);
          const includedSubCodes = rawSubCodes.map(code => subCodeMap[code] || code);
          
          // Query data langsung dari database
          const surveyData = await surveyModel.getVehicleDataGrouped(
            filters,
            includedSubCodes,
            '5min'
          );
          
          // Cek apakah ada data
          const hasData = surveyData && 
                         Object.keys(surveyData).length > 0 &&
                         Object.values(surveyData).some(period => period && Object.keys(period).length > 0);
          
          const status = hasData ? 1 : 0;
          
          // Insert camera status log
          await db.execute(
            `INSERT INTO camera_status_logs (camera_id, status) VALUES (?, ?)`,
            [camera.id, status]
          );
          
          const statusLabel = status === 1 ? '✅ AKTIF' : '❌ OFFLINE';
          console.log(`  Camera ${camera.id} (Simpang ${simpangId}): ${statusLabel}`);
          
        } catch (err) {
          console.error(`  ❌ Error checking camera ${camera.id}:`, err.message);
          
          // Jika error terjadi, assume camera offline
          await db.execute(
            `INSERT INTO camera_status_logs (camera_id, status) VALUES (?, ?)`,
            [camera.id, 0]
          );
        }
      }
      
      console.log(`[${new Date().toISOString()}] ✅ Camera status update complete.\n`);
      
    } catch (err) {
      console.error('Error in updateCameraStatusFromSurvey job:', err);
    }
  });
};

module.exports = updateCameraStatusFromSurvey;
