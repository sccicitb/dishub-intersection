const db = require('../app/config/db');
const cron = require('node-cron');
const surveyModel = require('../app/models/survey.model');
const subCodeMap = require('../app/helpers/subCodeMap');
const fs = require('fs');
const path = require('path');

// Flag untuk mencegah overlapping execution
let isJobRunning = false;

/**
 * Timeout wrapper untuk mencegah job hang
 */
const withTimeout = async (promise, timeoutMs) => {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error(`Waktu tunggu habis setelah ${timeoutMs}ms`)), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
};

/**
 * Logika retry untuk koneksi database yang tidak stabil
 */
const executeWithRetry = async (fn, maxRetries = 3, delay = 1000, timeoutMs = 10000) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(fn(), timeoutMs);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        console.warn(`  ⚠️ Percobaan ${attempt} gagal, mencoba ulang dalam ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

/**
 * Job untuk update camera status berdasarkan ketersediaan data di survey
 * Jika ada data survey → camera aktif (status = 1)
 * Jika tidak ada data survey → camera offline (status = 0)
 */
const updateCameraStatusFromSurvey = () => {
  // Jalankan setiap 5 menit dengan proteksi dari eksekusi ganda
  cron.schedule('*/5 * * * *', async () => {
    // Cegah eksekusi ganda
    if (isJobRunning) {
      console.warn(`[${new Date().toISOString()}] ⚠️ Job sebelumnya masih berjalan, skip cycle ini`);
      return;
    }
    
    isJobRunning = true;
    
    try {
      console.log(`[${new Date().toISOString()}] 📡 Memeriksa status camera dari data survey...`);
      
      // Ambil semua camera dengan logika retry
      let cameras = [];
      try {
        [cameras] = await executeWithRetry(
          () => db.execute('SELECT id, ID_Simpang FROM cameras'),
          3,
          1000,
          15000 // 15 detik timeout
        );
      } catch (err) {
        console.error('❌ Gagal mengambil data camera:', err.message);
        isJobRunning = false;
        return; // Keluar dengan baik
      }
      
      if (!cameras || cameras.length === 0) {
        console.log('ℹ️ Tidak ada camera ditemukan di database');
        isJobRunning = false;
        return;
      }
      
      // Muat data klasifikasi
      const classificationPath = path.join(__dirname, '../app/data/classification.json');
      let classificationJson = [];
      try {
        classificationJson = JSON.parse(fs.readFileSync(classificationPath, 'utf-8'));
      } catch (err) {
        console.error('❌ Gagal memuat data klasifikasi:', err.message);
        isJobRunning = false;
        return;
      }
      
      // Proses camera secara berurutan untuk menghindari stress connection pool
      const startTime = Date.now();
      let successCount = 0;
      let failureCount = 0;
      
      for (const camera of cameras) {
        try {
          const simpangId = camera.ID_Simpang;
          
          // Siapkan filter seperti di survey controller
          const filters = {
            simpangId,
            approach: 'semua',
            direction: null,
            classificationType: 'luar_kota'
          };
          
          // Ambil daftar subCode berdasarkan klasifikasi
          const rawSubCodes = classificationJson
            .filter(item => item.type === filters.classificationType)
            .map(item => item.subCode);
          const includedSubCodes = rawSubCodes.map(code => subCodeMap[code] || code);
          
          // Query data langsung dari database dengan retry dan timeout
          let surveyData = {};
          try {
            const result = await executeWithRetry(
              () => surveyModel.getVehicleDataGrouped(
                filters,
                includedSubCodes,
                '5min'
              ),
              2,
              500,
              20000 // timeout 20 detik per query
            );
            surveyData = result.vehicleData || {};
          } catch (err) {
            console.warn(`  ⚠️ Camera ${camera.id}: Gagal mengambil data survey - ${err.message}`);
            // Lanjut dengan data kosong - anggap offline
          }
          
          // Periksa apakah ada data
          const hasData = surveyData && 
                         Object.keys(surveyData).length > 0 &&
                         Object.values(surveyData).some(period => period && Object.keys(period).length > 0);
          
          const status = hasData ? 1 : 0;
          
          // Sisipkan log status camera dengan retry dan timeout
          try {
            await executeWithRetry(
              () => db.execute(
                `INSERT INTO camera_status_logs (camera_id, status) VALUES (?, ?)`,
                [camera.id, status]
              ),
              2,
              500,
              10000 // timeout 10 detik
            );
            
            const statusLabel = status === 1 ? '✅ AKTIF' : '❌ OFFLINE';
            console.log(`  📷 Camera ${camera.id} (Simpang ${simpangId}): ${statusLabel}`);
            successCount++;
          } catch (err) {
            console.error(`  ❌ Camera ${camera.id}: Gagal memperbarui status - ${err.message}`);
            failureCount++;
          }
          
        } catch (err) {
          console.error(`  ❌ Camera ${camera.id}: Error tak terduga - ${err.message}`);
          failureCount++;
        }
      }
      
      const duration = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] ✅ Pembaruan status camera selesai (${duration}ms) - Berhasil: ${successCount}, Gagal: ${failureCount}\n`);
      
    } catch (err) {
      console.error(`[${new Date().toISOString()}] ❌ Error job:`, err.message);
    } finally {
      isJobRunning = false;
    }
  });
};

module.exports = updateCameraStatusFromSurvey;
