# 🚦 Mobility Dishub Jogja

Sistem monitoring dan analitik arus kendaraan untuk Dinas Perhubungan Provinsi Daerah Istimewa Yogyakarta. Proyek ini terdiri dari backend API yang menangani pemrosesan data, integrasi IoT (MQTT), dan manajemen database, serta frontend berbasis web untuk visualisasi dashboard real-time.

## 📁 Struktur Arsitektur

### Monorepo Structure
```bash
.
├── backend/        # Server-side Application (Node.js/Express)
├── frontend/       # Client-side Application (Next.js App Router)
└── reports/        # Dokumentasi & Laporan performa database
```

### 🔙 Backend Architecture (`/backend`)
Menggunakan arsitektur MVC (Model-View-Controller) dengan Express.js.

```bash
backend/
├── app/
│   ├── config/       # Konfigurasi Database & Helper Global
│   ├── controllers/  # Logika bisnis (Traffic, Camera, Survey, Auth)
│   ├── models/       # Model Database & Query SQL
│   ├── routes/       # Definisi endpoint API
│   ├── helpers/      # Utility function (Format tanggal, Logika klasifikasi)
│   └── middleware/   # Authorization & Request processing
├── jobs/             # Scheduled CRON jobs (Cek status kamera, Update data)
├── query/            # Raw SQL Queries untuk reporting kompleks
├── mqtt-listener.js  # Service listener untuk data sensor IoT via MQTT
└── server.js         # Entry point aplikasi & Setup Socket.IO
```

### 🖥️ Frontend Architecture (`/frontend`)
Menggunakan **Next.js 15** dengan **App Router** server components.

```bash
frontend/src/
├── app/              # Halaman Aplikasi (App Router)
│   ├── dashboard/    # Main Dashboard View
│   ├── auth/         # Login & Authentication Pages
│   ├── manajemen-*/  # Modul Manajemen (User, Kamera)
│   └── form-sa-*/    # Modul Form Survey (SA-I s/d SA-V)
├── components/       # Reusable UI Components
├── hooks/            # Custom React Hooks
├── lib/              # Konfigurasi library pihak ketiga (Axios, dll)
└── utils/            # Helper functions sisi client
```

## ⚙️ Teknologi yang Digunakan

### **Backend**
| Kategori         | Teknologi                          |
|------------------|------------------------------------|
| **Core**         | Node.js, Express.js                |
| **Database**     | MySQL, MySQL2                      |
| **Real-time**    | Socket.IO, MQTT (IoT Integration)  |
| **Scheduling**   | Node-Cron                          |
| **Utils**        | JWT (Auth), ExcelJS, Multer        |

### **Frontend**
| Kategori         | Teknologi                          |
|------------------|------------------------------------|
| **Framework**    | Next.js 15, React 19               |
| **Styling**      | Tailwind CSS v4, DaisyUI           |
| **Maps**         | MapLibre GL, React-Leaflet, Turf.js|
| **Charts**       | Chart.js, Recharts, AmCharts 5     |
| **Export**       | jsPDF, Html2Canvas, ExcelJS        |

---

## 🚀 Instalasi & Menjalankan Aplikasi

### Prasyarat
- Node.js (Versi LTS direkomendasikan)
- MySQL Database
- Git

### 1. Setup Backend

Masuk ke folder backend dan install dependensi:

```bash
cd backend
npm install
```

**Konfigurasi Environment:**
Duplikasi file `.env.example` menjadi `.env` dan sesuaikan kredensial database & konfigurasi lainnya:
```bash
cp .env.example .env
```
*(Pastikan konfigurasi DB_HOST, DB_USER, DB_PASSWORD, dan MQTT_URL sesuai)*

Jalankan Server:
```bash
# Mode Development (dengan Nodemon)
npm run dev

# Mode Production
npm start
```

### 2. Setup Frontend

Masuk ke folder frontend dan install dependensi:

```bash
cd frontend
npm install
```

**Konfigurasi Environment:**
Buat file `.env.local` jika diperlukan untuk konfigurasi API URL.

Jalankan Frontend:
```bash
npm run dev
```

Akses aplikasi di `http://localhost:3000`.

---

## 🔄 Fitur Utama

### 📊 Dashboard & Monitoring
- **Real-time Traffic Monitoring**: Integrasi CCTV dan sensor lalu lintas.
- **Traffic Matrix**: Analisis asal-tujuan kendaraan.
- **Auditing**: Audit volume lalu lintas (Harian, Mingguan).
- **Peta Interaktif**: Visualisasi sebaran kamera dan titik simpang menggunakan MapLibre/Leaflet.

### 📝 Manajemen Survei (SA Series)
Modul input dan pelaporan survei lalu lintas:
- **SA-I**: Inventarisasi Simpang
- **SA-II**: Survai Pencacahan Lalu Lintas
- **SA-III**: Survai Wawancara Tepi Jalan
- **SA-IV**: Survai Kecepatan Perjalanan (Floating Car Observer)
- **SA-V**: Inventory Ruas Jalan

### 🛠️ Manajemen Sistem
- **Manajemen User**: Role-based access control.
- **Manajemen Kamera**: Status monitoring kamera aktif/non-aktif.
- **Cron Jobs**: Otomatisasi pengecekan status perangkat.

---

## 👨‍💻 Developer

Proyek dikembangkan oleh:
- **Smart City & Community Innovation Center (SCCIC)** — Institut Teknologi Bandung
- Bekerja sama dengan **Dinas Perhubungan Kota Yogyakarta**

> Untuk kontribusi atau pertanyaan, silakan kontak tim SCCIC atau open issue di GitHub.
