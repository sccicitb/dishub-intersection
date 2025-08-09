# Form SA API Documentation

## Overview
This document provides comprehensive API documentation for all Form SA (SA-I through SA-V) endpoints implemented in the traffic intersection analysis system.

## 📋 **REQUIREMENTS MAPPING**

This API documentation directly supports the frontend requirements from `Requirements.md`:

### **Frontend Requirements → API Endpoints**

#### **1. Survey Header Requirements**

**Frontend Requirement**: Survey header with date, location, period selection
**API Endpoints**:
- `POST /api/sa-surveys/header` - Create survey header
- `GET /api/sa-surveys/header` - Get all survey headers
- `GET /api/sa-surveys/header/:id` - Get specific survey header
- `PUT /api/sa-surveys/header/:id` - Update survey header
- `DELETE /api/sa-surveys/header/:id` - Delete survey header

**Payload Structure**:
```json
{
  "tanggal": "2025-01-15",
  "kabupatenKota": "Yogyakarta",
  "lokasi": "Test Intersection",
  "ruasJalanMayor": ["Jl. Malioboro", "Jl. Sudirman"],
  "ruasJalanMinor": ["Jl. Kecil 1", "Jl. Kecil 2"],
  "ukuranKota": "1",
  "perihal": "Traffic analysis for intersection optimization",
  "periode": "Pertama"
}
```

#### **2. Form Data Management**

**Frontend Requirement**: Multiple forms (SA-I to SA-V) for same survey header
**API Endpoints**:
- `GET /api/sa-surveys/header/:id/forms` - Get all forms for a header
- `POST /api/sa-surveys/sa-i/` - Create SA-I form (auto-creates header if needed)
- `POST /api/sa-surveys/sa-ii/` - Create SA-II form (auto-creates header if needed)
- `POST /api/sa-surveys/sa-iii/` - Create SA-III form (auto-creates header if needed)
- `POST /api/sa-surveys/sa-iv/` - Create SA-IV form (auto-creates header if needed)
- `POST /api/sa-surveys/sa-v/` - Create SA-V form (auto-creates header if needed)

## 🚀 **SURVEY HEADER MANAGEMENT APIs**

### **1. Create Survey Header**
**POST** `/api/sa-surveys/header`
```json
{
  "tanggal": "2025-01-15",
  "kabupatenKota": "Yogyakarta",
  "lokasi": "Test Intersection",
  "ruasJalanMayor": ["Jl. Malioboro", "Jl. Sudirman"],
  "ruasJalanMinor": ["Jl. Kecil 1", "Jl. Kecil 2"],
  "ukuranKota": "1",
  "perihal": "Traffic analysis for intersection optimization",
  "periode": "Pertama"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Survey header created successfully",
  "data": {
    "id": 183,
    "tanggal": "2025-01-15",
    "kabupatenKota": "Yogyakarta",
    "lokasi": "Test Intersection",
    "ruasJalanMayor": ["Jl. Malioboro", "Jl. Sudirman"],
    "ruasJalanMinor": ["Jl. Kecil 1", "Jl. Kecil 2"],
    "ukuranKota": "1",
    "perihal": "Traffic analysis for intersection optimization",
    "periode": "Pertama",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

### **2. Get All Survey Headers**
**GET** `/api/sa-surveys/header`

**Query Parameters**:
- `kabupatenKota` (optional) - Filter by city
- `lokasi` (optional) - Filter by location
- `periode` (optional) - Filter by period
- `tanggal` (optional) - Filter by date

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 183,
      "tanggal": "2025-01-15",
      "kabupatenKota": "Yogyakarta",
      "lokasi": "Test Intersection",
      "ruasJalanMayor": ["Jl. Malioboro", "Jl. Sudirman"],
      "ruasJalanMinor": ["Jl. Kecil 1", "Jl. Kecil 2"],
      "ukuranKota": "1",
      "perihal": "Traffic analysis",
      "periode": "Pertama",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### **3. Get Survey Header by ID**
**GET** `/api/sa-surveys/header/:id`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 183,
    "tanggal": "2025-01-15",
    "kabupatenKota": "Yogyakarta",
    "lokasi": "Test Intersection",
    "ruasJalanMayor": ["Jl. Malioboro", "Jl. Sudirman"],
    "ruasJalanMinor": ["Jl. Kecil 1", "Jl. Kecil 2"],
    "ukuranKota": "1",
    "perihal": "Traffic analysis",
    "periode": "Pertama",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

### **4. Update Survey Header**
**PUT** `/api/sa-surveys/header/:id`
```json
{
  "tanggal": "2025-01-15",
  "kabupatenKota": "Yogyakarta",
  "lokasi": "Updated Test Intersection",
  "ruasJalanMayor": ["Jl. Malioboro", "Jl. Sudirman"],
  "ruasJalanMinor": ["Jl. Kecil 1", "Jl. Kecil 2"],
  "ukuranKota": "1",
  "perihal": "Updated traffic analysis",
  "periode": "Pertama"
}
```

### **5. Delete Survey Header**
**DELETE** `/api/sa-surveys/header/:id`

### **6. Get All Forms for a Header**
**GET** `/api/sa-surveys/header/:id/forms`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "form_type": "SA-I",
      "count": 1
    },
    {
      "form_type": "SA-II",
      "count": 1
    }
  ]
}
```

## 📊 **FORM-SPECIFIC APIs**

### **SA-I: Intersection Performance Analysis**

#### **Create Complete SA-I Survey**
**POST** `/api/sa-surveys/sa-i`

**Payload Structure**:
```json
{
  "surveyHeader": {
    "id": 183,
    "tanggal": "2025-01-15",
    "kabupatenKota": "Yogyakarta",
    "lokasi": "Test Intersection",
    "ruasJalanMayor": ["Jl. Malioboro", "Jl. Sudirman"],
    "ruasJalanMinor": ["Jl. Kecil 1", "Jl. Kecil 2"],
    "ukuranKota": "1",
    "perihal": "SA-I Traffic Analysis",
    "periode": "Pertama"
  },
  "pendekat": [
    {
      "kodePendekat": "U",
      "tipeLingkunganJalan": "KOM",
      "kelasHambatanSamping": "R",
      "median": "Ada",
      "kelandaianPendekat": 0.00,
      "bkjt": 1,
      "jarakKeKendaraanParkir": 5.00,
      "lebarAwalLajur": 3.50,
      "lebarGarisHenti": 3.50,
      "lebarLajurBki": 3.50,
      "lebarLajurKeluar": 3.50
    }
  ],
  "fase": {
    "utara": {
      "tipe_pendekat": { "terlindung": true, "terlawan": false },
      "arah": { "bki": true, "bkijt": false, "lurus": true, "bka": false },
      "pemisahan_lurus_bka": false,
      "fase": { "fase_1": true, "fase_2": false, "fase_3": false, "fase_4": false }
    }
  }
}
```

**Response**:
```json
{
  "headerId": 184,
  "message": "SA-I Survey created successfully"
}
```

#### **Get Complete SA-I Survey**
**GET** `/api/sa-surveys/sa-i/:surveyId`

#### **Update Complete SA-I Survey**
**PUT** `/api/sa-surveys/sa-i/:surveyId`

### **SA-II: Vehicle Data by Movement Direction**

#### **Create Complete SA-II Survey**
**POST** `/api/sa-surveys/sa-ii`

**Payload Structure**:
```json
{
  "surveyHeader": {
    "id": 183,
    "tanggal": "2025-01-15",
    "kabupatenKota": "Yogyakarta",
    "lokasi": "Test Intersection",
    "ruasJalanMayor": ["Jl. Malioboro", "Jl. Sudirman"],
    "ruasJalanMinor": ["Jl. Kecil 1", "Jl. Kecil 2"],
    "ukuranKota": "1",
    "perihal": "SA-II Vehicle Analysis",
    "periode": "Pertama"
  },
  "vehicleData": [
    {
      "direction": "U",
      "movement_type": "BKi",
      "vehicle_type": "MP",
      "count_terlindung": 150,
      "count_terlawan": 75,
      "smp_terlindung": 150.0,
      "smp_terlawan": 75.0
    }
  ],
  "ktbData": [
    {
      "direction": "U",
      "ktb_count": 25,
      "turn_ratio": 0.15,
      "rktb_value": 3.75
    }
  ]
}
```

**Response**:
```json
{
  "headerId": 185,
  "message": "SA-II Survey created successfully"
}
```

#### **Get Complete SA-II Survey**
**GET** `/api/sa-surveys/sa-ii/:surveyId`

#### **Update Complete SA-II Survey**
**PUT** `/api/sa-surveys/sa-ii/:surveyId`

### **SA-III: Intersection Sketch**

#### **Create Complete SA-III Survey**
**POST** `/api/sa-surveys/sa-iii`

**Payload Structure**:
```json
{
  "surveyHeader": {
    "id": 183,
    "tanggal": "2025-01-15",
    "kabupatenKota": "Yogyakarta",
    "lokasi": "Test Intersection",
    "ruasJalanMayor": ["Jl. Malioboro", "Jl. Sudirman"],
    "ruasJalanMinor": ["Jl. Kecil 1", "Jl. Kecil 2"],
    "ukuranKota": "1",
    "perihal": "SA-III Sketch Analysis",
    "periode": "Pertama"
  },
  "phaseData": [
    {
      "fase": 1,
      "kode": "U",
      "jarak": [
        {
          "type": "lintasanBerangkat",
          "pendekat": { "u": 100.00, "s": 0.00, "t": 0.00, "b": 0.00 },
          "kecepatan": { "berangkat": 40.00, "datang": 0.00, "pejalanKaki": 0.00 },
          "waktuTempuh": 15.00,
          "wws": 30.00,
          "wusDisarankan": 25.00,
          "wk": 3,
          "wAll": 60,
          "wHijau": 30
        }
      ]
    }
  ],
  "measurements": [
    {
      "id": 1,
      "label": "Measurement 1",
      "start": { "lat": "-7.7971", "lng": "110.3708" },
      "end": { "lat": "-7.7972", "lng": "110.3709" },
      "distance": 150
    }
  ]
}
```

**Response**:
```json
{
  "headerId": 186,
  "message": "SA-III Survey created successfully"
}
```

#### **Get Complete SA-III Survey**
**GET** `/api/sa-surveys/sa-iii/:surveyId`

#### **Update Complete SA-III Survey**
**PUT** `/api/sa-surveys/sa-iii/:surveyId`

### **SA-IV: Saturated Flow and Capacity Analysis**

#### **Create Complete SA-IV Survey**
**POST** `/api/sa-surveys/sa-iv`

**Payload Structure**:
```json
{
  "surveyHeader": {
    "id": 183,
    "tanggal": "2025-01-15",
    "kabupatenKota": "Yogyakarta",
    "lokasi": "Test Intersection",
    "ruasJalanMayor": ["Jl. Malioboro", "Jl. Sudirman"],
    "ruasJalanMinor": ["Jl. Kecil 1", "Jl. Kecil 2"],
    "ukuranKota": "1",
    "perihal": "SA-IV Capacity Analysis",
    "periode": "Pertama"
  },
  "capacityAnalysis": [
    {
      "kode_pendekat": "U",
      "rasio_kendaraan_belok": {
        "left_turn": 0.15,
        "straight": 0.70,
        "right_turn": 0.15
      },
      "arus_belok_kanan": {
        "volume": 150,
        "saturation_flow": 1800
      },
      "arus_jenuh_dasar": 1800,
      "faktor_penyesuaian": {
        "geometric": 0.95,
        "traffic": 0.90,
        "environmental": 0.98
      },
      "kapasitas": 1539,
      "derajat_kejenuhan": 0.85
    }
  ],
  "phaseAnalysis": [
    {
      "kode_pendekat": "U",
      "phases": {
        "f1": { "green": 30, "amber": 3, "red": 27 },
        "f2": { "green": 25, "amber": 3, "red": 32 },
        "f3": { "green": 28, "amber": 3, "red": 29 },
        "f4": { "green": 22, "amber": 3, "red": 35 }
      },
      "cycle_time": 120
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "headerId": 187,
  "message": "SA-IV Survey created successfully"
}
```

#### **Get Complete SA-IV Survey**
**GET** `/api/sa-surveys/sa-iv/:surveyId`

#### **Update Complete SA-IV Survey**
**PUT** `/api/sa-surveys/sa-iv/:surveyId`

### **SA-V: Delay and Performance Analysis**

#### **Create Complete SA-V Survey**
**POST** `/api/sa-surveys/sa-v`

**Payload Structure**:
```json
{
  "surveyHeader": {
    "id": 183,
    "tanggal": "2025-01-15",
    "kabupatenKota": "Yogyakarta",
    "lokasi": "Test Intersection",
    "ruasJalanMayor": ["Jl. Malioboro", "Jl. Sudirman"],
    "ruasJalanMinor": ["Jl. Kecil 1", "Jl. Kecil 2"],
    "ukuranKota": "1",
    "perihal": "SA-V Delay Analysis",
    "periode": "Pertama"
  },
  "delayData": [
    {
      "kode_pendekat": "U",
      "arus_lalu_lintas": 1254,
      "kapasitas": 1398,
      "derajat_kejenuhan": 0.883,
      "rasio_hijau": 0.205,
      "nq1": 2.4,
      "nq2": 38.9,
      "nq": 41,
      "nq_max": 69,
      "panjang_antrian": 120,
      "rasio_kendaraan_terhenti": 0.920,
      "jumlah_kendaraan_terhenti": 1135,
      "tundaan_lalu_lintas": 51.4,
      "tundaan_geometri": 3.8,
      "tundaan_rata_rata": 55.2,
      "tundaan_total": 68092
    }
  ],
  "performanceSummary": {
    "total_kendaraan_terhenti": 4500,
    "rasio_kendaraan_terhenti_rata": 0.85,
    "total_tundaan": 250000,
    "tundaan_simpang_rata": 45.2,
    "level_of_service": "C",
    "performance_evaluation": "Acceptable performance with moderate delays"
  }
}
```

**Response**:
```json
{
  "headerId": 188,
  "message": "SA-V Survey created successfully"
}
```

#### **Get Complete SA-V Survey**
**GET** `/api/sa-surveys/sa-v/:surveyId`

#### **Update Complete SA-V Survey**
**PUT** `/api/sa-surveys/sa-v/:surveyId`

## 🔄 **DATABASE STRUCTURE**

The APIs use the `sa_survey_headers` table with the following structure:

```sql
-- Survey header (reusable across forms)
sa_survey_headers {
  id: 183,
  tanggal: "2025-01-15",
  kabupaten_kota: "Yogyakarta",
  lokasi: "Test Intersection",
  ruas_jalan_mayor: JSON_ARRAY("Jl. Malioboro", "Jl. Sudirman"),
  ruas_jalan_minor: JSON_ARRAY("Jl. Kecil 1", "Jl. Kecil 2"),
  ukuran_kota: "1",
  perihal: "Traffic analysis",
  periode: "Pertama",
  created_at: "2025-01-15T10:00:00Z",
  updated_at: "2025-01-15T10:00:00Z"
}

-- Form data (linked to header via survey_id)
sa_i_pendekat {
  id: 1,
  survey_id: 183,
  kode_pendekat: "U",
  tipe_lingkungan_jalan: "KOM",
  kelas_hambatan_samping: "R",
  median: "Ada",
  kelandaian_pendekat: 0.00,
  bkjt: 1,
  jarak_ke_kendaraan_parkir: 5.00,
  lebar_awal_lajur: 3.50,
  lebar_garis_henti: 3.50,
  lebar_lajur_bki: 3.50,
  lebar_lajur_keluar: 3.50
}
```

## 🎯 **BENEFITS**

1. **Header Reusability**: One header can have multiple forms
2. **Better Organization**: Clear separation between header and form data
3. **Flexible Workflow**: Add forms incrementally to existing headers
4. **Clean API Design**: Consistent endpoint structure
5. **Comprehensive Coverage**: All Form SA requirements supported
6. **Google Maps Integration**: Coordinate fields support VARCHAR(25) for flexibility

## 📝 **VALIDATION RULES**

### **Survey Header Validation**
- `tanggal`: Required, valid date format (YYYY-MM-DD)
- `kabupatenKota`: Required, string field
- `lokasi`: Required, string field
- `ruasJalanMayor/ruasJalanMinor`: Required, JSON arrays
- `ukuranKota`: Required, string field
- `periode`: Required, enum('Pertama','Kedua','Ketiga','Keempat')

### **Form-Specific Validation**

#### **SA-I Validation**
- `kodePendekat`: Required, enum('U','T','S','B')
- `tipeLingkunganJalan`: Required, enum('KOM','KIM','AT')
- `kelasHambatanSamping`: Required, enum('R','T','S')
- `bkjt`: Required, boolean (0 or 1)
- `kelandaianPendekat`: Required, decimal
- `jarakKeKendaraanParkir`: Required, decimal
- `lebarAwalLajur`: Required, decimal
- `lebarGarisHenti`: Required, decimal
- `lebarLajurBki`: Required, decimal
- `lebarLajurKeluar`: Required, decimal

#### **SA-III Validation**
- Coordinate fields: VARCHAR(25) for Google Maps compatibility
- `start_longitude`: -180.000000 to +180.000000
- `start_latitude`: -90.000000 to +90.000000
- `end_longitude`: -180.000000 to +180.000000
- `end_latitude`: -90.000000 to +90.000000

## 🚨 **ERROR HANDLING**

### **Common Error Responses**

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "tanggal": "Tanggal is required",
    "kabupatenKota": "Kabupaten Kota is required"
  }
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Survey header not found"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Database connection error"
}
```

## 📊 **TESTING EXAMPLES**

### **Complete Workflow Test**
```bash
# 1. Create header
curl -X POST http://localhost:8080/api/sa-surveys/header \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal": "2025-01-15",
    "kabupatenKota": "Yogyakarta",
    "lokasi": "Test Intersection",
    "ruasJalanMayor": ["Jl. Malioboro", "Jl. Sudirman"],
    "ruasJalanMinor": ["Jl. Kecil 1", "Jl. Kecil 2"],
    "ukuranKota": "1",
    "perihal": "Test survey",
    "periode": "Pertama"
  }'

# 2. Create SA-I form
curl -X POST http://localhost:8080/api/sa-surveys/sa-i \
  -H "Content-Type: application/json" \
  -d '{
    "surveyHeader": {
      "id": 183,
      "tanggal": "2025-01-15",
      "kabupatenKota": "Yogyakarta",
      "lokasi": "Test Intersection",
      "ruasJalanMayor": ["Jl. Malioboro", "Jl. Sudirman"],
      "ruasJalanMinor": ["Jl. Kecil 1", "Jl. Kecil 2"],
      "ukuranKota": "1",
      "perihal": "SA-I Test",
      "periode": "Pertama"
    },
    "pendekat": [{
      "kodePendekat": "U",
      "tipeLingkunganJalan": "KOM",
      "kelasHambatanSamping": "R",
      "median": "Ada",
      "kelandaianPendekat": 0.00,
      "bkjt": 1,
      "jarakKeKendaraanParkir": 5.00,
      "lebarAwalLajur": 3.50,
      "lebarGarisHenti": 3.50,
      "lebarLajurBki": 3.50,
      "lebarLajurKeluar": 3.50
    }],
    "fase": {
      "utara": {
        "tipe_pendekat": { "terlindung": true, "terlawan": false },
        "arah": { "bki": true, "bkijt": false, "lurus": true, "bka": false },
        "pemisahan_lurus_bka": false,
        "fase": { "fase_1": true, "fase_2": false, "fase_3": false, "fase_4": false }
      }
    }
  }'

# 3. Get all forms for header
curl -X GET http://localhost:8080/api/sa-surveys/header/183/forms
```

## 🔧 **WORKFLOW SCENARIOS**

### **Scenario 1: Header-First Approach**
1. Create header first
2. Add forms to existing header
3. Multiple forms can share same header

### **Scenario 2: Form-First Approach**
1. Create form directly (auto-creates header)
2. Add more forms to auto-created header
3. System tracks form-header relationships

### **Scenario 3: Mixed Approach**
1. Combine both header-first and form-first
2. Flexible workflow based on user preference
3. All forms properly linked to headers

---

*This documentation provides comprehensive coverage of all Form SA APIs, ensuring frontend developers have complete information for integration.* 