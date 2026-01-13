## 🔧 Perbaikan Cron Job Issue: "Missed Execution"

### 📋 Masalah yang Dihadapi

**Error Log:**
```
[WARN] missed execution at Tue Jan 13 2026 14:30:00 GMT+0700
Possible blocking IO or high CPU user at the same process used by node-cron.
```

**Root Cause:**
1. **Job tidak memiliki timeout** → query database bisa hang indefinitely
2. **Overlapping execution** → job sebelumnya masih running saat cron ingin jalankan job baru
3. **Connection pool stress** → terlalu banyak query concurrent ke database
4. **ECONNRESET** → koneksi database diputus karena timeout atau network issue

---

### ✅ Solusi yang Diterapkan

#### 1. **Timeout Protection** (`withTimeout`)
```javascript
const withTimeout = async (promise, timeoutMs) => {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error(`Operation timeout`)), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
};
```
- Setiap operation (query, insert) diberi timeout limit
- Fetch cameras: 15 detik
- Survey data query: 20 detik  
- Insert log: 10 detik
- **Benefit:** Mencegah job hang indefinitely

#### 2. **Prevent Overlapping Execution**
```javascript
let isJobRunning = false;

cron.schedule('*/5 * * * *', async () => {
  if (isJobRunning) {
    console.warn('Previous job still running, skipping');
    return;
  }
  isJobRunning = true;
  try {
    // ... do work ...
  } finally {
    isJobRunning = false;
  }
});
```
- Flag `isJobRunning` mencegah eksekusi job overlap
- Jika job belum selesai pada cycle berikutnya, skip execution
- **Benefit:** Node-cron tidak akan "missed execution" karena event loop clear

#### 3. **Sequential Processing (Tidak Parallel)**
```javascript
for (const camera of cameras) {
  // Process satu per satu, bukan concurrent
}
```
- Cameras diproses secara berurutan
- Reduce connection pool stress
- **Benefit:** Prevent connection pool saturation

#### 4. **Enhanced Database Configuration**
```javascript
const pool = mysql.createPool({
  // ... existing config ...
  connectTimeout: 10000,    // 10s untuk establish connection
  acquireTimeout: 10000,    // 10s untuk dapat connection dari pool
  decimalNumbers: true,
  supportBigNumbers: true
});
```
- Tambah timeout untuk acquire connection dari pool
- Better number handling
- **Benefit:** Prevent hanging di connection acquisition

#### 5. **Better Error Handling & Logging**
```javascript
// Track success/failure
let successCount = 0;
let failureCount = 0;

// Log duration
const duration = Date.now() - startTime;
console.log(`✅ Completed (${duration}ms) - Success: ${successCount}, Failed: ${failureCount}`);
```
- Lebih mudah monitor job health
- Visibility ke berapa lama job run

---

### 📊 Perbandingan Before & After

| Aspek | Before | After |
|-------|--------|-------|
| **Timeout Protection** | ❌ None | ✅ Multiple levels |
| **Overlapping Prevention** | ❌ No | ✅ isJobRunning flag |
| **Processing Model** | ❌ Unknown | ✅ Sequential |
| **Connection Pool Config** | ❌ Basic | ✅ Timeout settings |
| **Error Visibility** | ⚠️ Limited | ✅ Detailed logging |
| **Missed Execution Risk** | ⚠️ High | ✅ Low |

---

### 🧪 Testing

**Run test script:**
```bash
node test_cron_job.js
```

**Expected Output:**
```
[2026-01-13T07:25:20.000Z] 📡 Checking camera status from survey data...
[2026-01-13T07:25:20.500Z] ✅ Camera 1 (Simpang 2): ✅ AKTIF
[2026-01-13T07:25:20.800Z] 📷 Camera 2 (Simpang 3): ❌ OFFLINE
[2026-01-13T07:25:21.000Z] ✅ Camera status update complete (800ms) - Success: 2, Failed: 0

[2026-01-13T07:30:20.000Z] 📡 Checking camera status from survey data...
... (job runs without missed execution warning)
```

---

### 🚀 Deployment

File yang diubah:
1. `jobs/updateCameraStatusFromSurvey.js` - Enhanced cron job
2. `app/config/db.js` - Improved pool config
3. `test_cron_job.js` - New test file (optional)

**Restart server untuk apply changes:**
```bash
npm stop
npm start
```

---

### 📈 Monitoring Tips

Monitor di logs untuk:
- **⚠️ Warnings** - Job being skipped (previous still running)
- **❌ Errors** - Database connection issues
- **⏱️ Duration** - Jika > 4 menit, ada issue dengan query

---

### 🔍 Troubleshooting

| Gejala | Penyebab | Solusi |
|--------|---------|--------|
| Missed execution still occurs | Database terlalu slow | Optimize query atau increase timeout |
| Timeout errors | Network latency | Increase timeout values |
| Connection pool exhaustion | Terlalu banyak concurrent queries | Reduce connection limit atau process sequentially |

