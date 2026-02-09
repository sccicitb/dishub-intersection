const db = require('../app/config/db'); // koneksi mysql2/promise
const cron = require('node-cron');

/**
 * Logika retry untuk koneksi database yang tidak stabil
 */
const executeWithRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // Retry on connection errors or generic errors that might be transient
      if (attempt < maxRetries) {
        const isNetworkError = err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ETIMEDOUT';
        if (isNetworkError) {
          console.warn(`[checkCameraStatus] ⚠️ Percobaan ${attempt} gagal (${err.code}), mencoba ulang dalam ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      throw err;
    }
  }
  throw lastError;
};

const checkCameraStatus = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      await executeWithRetry(async () => {
        const [inactiveCameras] = await db.execute(`
          SELECT c.id AS camera_id
          FROM cameras c
          WHERE c.id NOT IN (
              SELECT camera_id
              FROM camera_status_logs
              WHERE recorded_at >= NOW() - INTERVAL 5 MINUTE
              AND status = 1
          )
        `);

        if (inactiveCameras.length === 0) {
          console.log(`[${new Date().toISOString()}] All cameras active.`);
          return;
        }

        for (const { camera_id } of inactiveCameras) {
          await db.execute(`
            INSERT INTO camera_status_logs (camera_id, status)
            VALUES (?, 0)
          `, [camera_id]);

          console.log(`[${new Date().toISOString()}] Marked camera ${camera_id} as OFFLINE.`);
        }
      });
    } catch (err) {
      console.error('Error in camera status cron job:', err);
    }
  });
};

module.exports = checkCameraStatus;
