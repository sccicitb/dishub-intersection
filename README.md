# 🚦 Mobility Dishub Jogja

Sistem monitoring dan analitik arus kendaraan untuk Dinas Perhubungan Kota Yogyakarta.

## 📁 Struktur Proyek

```
.
├── backend/        # API server (ExpressJS + MySQL)
└── frontend/       # Dashboard web (NextJS + Tailwind)
```

## ⚙️ Teknologi yang Digunakan

| Layer     | Stack                          |
|-----------|--------------------------------|
| Backend   | Node.js, Express, MySQL        |
| Frontend  | Next.js, React, Tailwind CSS   |
| Database  | MySQL (localhost/cloud)        |

---

## 🚀 Instalasi & Jalankan

### ✅ 1. Clone Repository

```bash
git clone https://github.com/namamu/mobility-dishub.git
cd mobility-dishub
```

---

### ✅ 2. Setup Backend (Node.js + Express)

#### 📦 Install dependencies:

```bash
cd backend
npm install
```

#### 🛠️ Konfigurasi `.env`

```bash
cp .env.example .env
```

Isi dengan konfigurasi database:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mobility
PORT=3001
```

#### ▶️ Jalankan backend:

```bash
npm start
```

Akses backend: [http://localhost:3001](http://localhost:3001)

---

### ✅ 3. Setup Frontend (Next.js)

#### 📦 Install dependencies:

```bash
cd ../frontend
npm install
```

#### 🛠️ Konfigurasi `.env.local`

```bash
cp .env.example .env.local
```

Contoh isi:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### ▶️ Jalankan frontend:

```bash
npm run dev
```

Akses frontend: [http://localhost:3000](http://localhost:3000)

---

## 📊 Fitur Utama

- Visualisasi distribusi kendaraan masuk & keluar
- Deteksi otomatis status IN / OUT berdasarkan simpang & arah
- Statistik harian, bulanan, tahunan
- Terintegrasi dengan peta simpang (Tempel, Glagah, Prambanan, Piyungan)

---

## 🧪 Testing

Jika tersedia skrip test:

```bash
npm run test
```

---

## 👨‍💻 Developer

Proyek dikembangkan oleh:
- **Smart City & Community Innovation Center (SCCIC)** — Institut Teknologi Bandung
- Bekerja sama dengan **Dinas Perhubungan Kota Yogyakarta**

---

> Untuk kontribusi atau pertanyaan, silakan kontak tim SCCIC atau open issue di GitHub.

