# Form SA API Documentation

## Overview
This document provides comprehensive API documentation for all Form SA (SA-I through SA-V) endpoints implemented in the traffic intersection analysis system.

## 📋 **REQUIREMENTS MAPPING**

This API documentation directly supports the frontend requirements from `Requirements.md`:

### **Frontend Requirements → API Endpoints**

#### **1. Survey Header Requirements**
**Frontend Payload** (from Requirements.md):
```json
{
  "id": 1752119042910,
  "tanggal": "2025-07-16",
  "kabupatenKota": "Jogja",
  "lokasi": "Simpang",
  "ruasJalanMayor": ["Jl. Bagas"],
  "ruasJalanMinor": ["Jl. Bagas"],
  "ukuranKota": "20",
  "perihal": "Testing 3",
  "periode": "Kedua"
}
```

**✅ Supported by API**: `POST /sa-surveys` and `PUT /sa-surveys/survey?id=:id`

#### **2. Form SA-I Requirements**
**Frontend Payload** (from Requirements.md):
```json
{
  "pendekat": [
    {
      "kodePendekat": "u",
      "tipeLingkunganJalan": "kom",
      "kelasHambatanSamping": "t",
      "median": "Ada",
      "kelandaianPendekat": "5",
      "bkjt": "1",
      "jarakKeKendaraanParkir": "16",
      "lebarPendekat": {
        "awalLajur": "1",
        "garisHenti": "2",
        "lajurBki": "1",
        "lajurKeluar": "1"
      }
    }
  ],
  "fase": {
    "lokasi": "",
    "data": {
      "utara": {
        "tipe_pendekat": {"terlindung": true, "terlawan": false},
        "arah": {"bki": true, "bkijt": false, "lurus": true, "bka": true},
        "pemisahan_lurus_bka": true,
        "fase": {"fase_1": true, "fase_2": false, "fase_3": false, "fase_4": false}
      }
    }
  }
}
```

**✅ Supported by API**: `POST /sa-surveys/sa-i` and `PUT /sa-surveys/sa-i/:id`

**API Payload Format**:
```json
{
  "surveyHeader": {
    "simpang_id": 1,
    "tanggal": "2025-07-16",
    "perihal": "Testing 3",
    "status": "draft"
  },
  "pendekat": [
    {
      "kode_pendekat": "u",
      "tipe_lingkungan_jalan": "kom",
      "kelas_hambatan_samping": "t",
      "median": "Ada",
      "kelandaian_pendekat": 5,
      "bkjt": true,
      "jarak_ke_kendaraan_parkir": 16,
      "lebar_awal_lajur": 1,
      "lebar_garis_henti": 2,
      "lebar_lajur_bki": 1,
      "lebar_lajur_keluar": 1
    }
  ],
  "fase": {
    "lokasi": "",
    "data": {
      "utara": {
        "tipe_pendekat": {"terlindung": true, "terlawan": false},
        "arah": {"bki": true, "bkijt": false, "lurus": true, "bka": true},
        "pemisahan_lurus_bka": true,
        "fase": {"fase_1": true, "fase_2": false, "fase_3": false, "fase_4": false}
      }
    }
  }
}
```

#### **3. Form SA-II Requirements**
**Frontend Payload** (from Requirements.md):
```json
{
  "ekuivalensi": {
    "terlindung": {"mp": "2", "ks": "2", "sm": "3"},
    "terlawan": {"mp": "1", "ks": "2.5", "sm": "1.5"}
  },
  "surveyData": [
    {
      "direction": "B",
      "rows": [
        {
          "type": "BKi / BKIJT",
          "mp": {"kendjam": 500, "terlindung": 1000, "terlawan": 500},
          "ks": {"kendjam": 80, "terlindung": 160, "terlawan": 200},
          "sm": {"kendjam": 110, "terlindung": 330, "terlawan": 165},
          "total": {"terlindung": 1490, "terlawan": 865, "kendjam": 690},
          "ktb": {"rasio": 0.28, "count": 1},
          "rktb": 3
        }
      ]
    }
  ]
}
```

**✅ Supported by API**: `POST /sa-surveys/sa-ii` and `PUT /sa-surveys/sa-ii/:id`

**API Payload Format**:
```json
{
  "header": {
    "simpang_id": 1,
    "tanggal": "2025-07-16",
    "perihal": "SA-II Testing",
    "status": "draft"
  },
  "ekuivalensi": {
    "terlindung": {"mp": 2, "ks": 2, "sm": 3},
    "terlawan": {"mp": 1, "ks": 2.5, "sm": 1.5}
  },
  "surveyData": [
    {
      "direction": "B",
      "rows": [
        {
          "type": "BKi / BKIJT",
          "mp": {
            "terlindung": 1000,
            "terlawan": 500,
            "smpTerlindung": 2000,
            "smpTerlawan": 500
          },
          "ks": {
            "terlindung": 160,
            "terlawan": 200,
            "smpTerlindung": 320,
            "smpTerlawan": 500
          },
          "sm": {
            "terlindung": 330,
            "terlawan": 165,
            "smpTerlindung": 990,
            "smpTerlawan": 247.5
          },
          "total": {
            "terlindung": 1490,
            "terlawan": 865,
            "smpTerlindung": 3310,
            "smpTerlawan": 1247.5,
            "kendjam": 690
          },
          "ktb": {"rasio": 0.28, "count": 1},
          "rktb": 3
        }
      ]
    }
  ]
}
```

#### **4. Form SA-III Requirements**
**Frontend Payload** (from Requirements.md):
```json
{
  "tabel_konflik": {
    "whh": 0,
    "dataFase": [
      {
        "fase": 1,
        "kode": "U",
        "jarak": {
          "lintasanBerangkat": {
            "pendekat": {"u": 0, "s": 0, "t": 0, "b": 0},
            "kecepatan": {"vkbr": 0, "vkdt": 0, "vpk": 0},
            "waktuTempuh": 0,
            "wms": 0,
            "wmsDisesuaikan": 0,
            "wk": 0,
            "wah": 0
          }
        }
      }
    ]
  }
}
```

**✅ Supported by API**: `POST /sa-surveys/sa-iii` and `PUT /sa-surveys/sa-iii/:id`

**API Payload Format**:
```json
{
  "header": {
    "simpang_id": 1,
    "tanggal": "2025-07-16",
    "perihal": "SA-III Testing",
    "status": "draft"
  },
  "phaseData": [
    {
      "fase_number": 1,
      "kode_pendekat": "U",
      "jarak_type": "lintasanBerangkat",
      "pendekat_u": 0,
      "pendekat_s": 0,
      "pendekat_t": 0,
      "pendekat_b": 0,
      "kecepatan_berangkat": 0,
      "kecepatan_datang": 0,
      "kecepatan_pejalan_kaki": 0,
      "waktu_tempuh": 0,
      "w_ms": 0,
      "w_ms_disesuaikan": 0,
      "w_k": 0,
      "w_ah": 0,
      "w_hh": 0
    }
  ],
  "measurements": [
    {
      "measurement_label": "Test Measurement",
      "start_longitude": 110.3700,
      "start_latitude": -7.7971,
      "end_longitude": 110.3701,
      "end_latitude": -7.7972,
      "distance_meters": 15.5
    }
  ]
}
```

#### **5. Form SA-IV Requirements**
**Frontend Payload** (from Requirements.md):
```json
{
  "SAIV": {
    "tabel": [
      {
        "kodePendekat": "B",
        "hijauFase": 1,
        "tipependekat": "P",
        "rasioKendaraanBelok": {"rbkijt": 0.41, "rbki": 0.28, "rbka": 0.31},
        "arusBelokKanan": {"dariArahDitinjau": 1437.5, "dariArahBerlawanan": 332.5},
        "lebarEfektif": 5,
        "arusJenuhDasar": 3000,
        "faktorPenyesuaian": {"fhs": 2, "fux": 1, "fg": 1, "fp": 1, "fbki": 1, "fbka": 1},
        "arusJenuhYangDisesuaikan": {"j": 6000},
        "arusLaluLintas": 1615,
        "rasioArus": 0.269,
        "rasioFase": 0.158,
        "waktuHijauPerFase": "13",
        "kapasitas": 780,
        "derajatKejenuhan": "2.071"
      }
    ]
  }
}
```

**✅ Supported by API**: `POST /sa-surveys/sa-iv` and `PUT /sa-surveys/sa-iv/:id`

**API Payload Format**:
```json
{
  "surveyHeader": {
    "simpang_id": 1,
    "tanggal": "2025-07-16",
    "perihal": "SA-IV Testing",
    "status": "draft"
  },
  "capacityAnalysis": [
    {
      "kode_pendekat": "B",
      "tipe_pendekat": "P",
      "rasio_kendaraan_belok": {
        "rbkijt": 0.41,
        "rbki": 0.28,
        "rbka": 0.31
      },
      "arus_belok_kanan": {
        "dari_arah_ditinjau": 1437.5,
        "dari_arah_berlawanan": 332.5
      },
      "lebar_efektif": 5,
      "arus_jenuh_dasar": 3000,
      "faktor_penyesuaian": {
        "fhs": 2,
        "fuk": 1,
        "fg": 1,
        "fp": 1,
        "fbki": 1,
        "fbka": 1
      },
      "arus_jenuh_yang_disesuaikan": 6000,
      "arus_lalu_lintas": 1615,
      "rasio_arus": 0.269,
      "rasio_fase": 0.158,
      "waktu_hijau_per_fase": 13,
      "kapasitas": 780,
      "derajat_kejenuhan": 2.071
    }
  ],
  "phaseAnalysis": [
    {
      "kode_pendekat": "B",
      "tipe_pendekat": "P",
      "arah": "Terlindung",
      "pemisahan_lurus_rka": false,
      "phases": {
        "f1": {
          "mf": 1.0,
          "whi": 30,
          "w_all": {
            "wk": 3,
            "wms": 2
          }
        }
      },
      "whi_total": 30,
      "cycle_time": 100
    }
  ]
}
```

#### **6. Form SA-V Requirements**
**Frontend Payload** (from Requirements.md):
```json
{
  "SAV": {
    "trata": "482.308",
    "totalrata": "0.63",
    "rkhrata": "2484",
    "qtotal": 6790,
    "total_tundaan": 3274870,
    "tkt": 7451,
    "los": "F",
    "data": [
      {
        "kode": "B",
        "q": 3230,
        "c": 1170,
        "dj": 6.212,
        "rh": "0.260",
        "nq1": 261,
        "nq2": -108,
        "nq": 153,
        "nqMax": 242,
        "pa": "4840",
        "rqh": "1.535",
        "nqh": "4958",
        "tl": "759",
        "tg": "6",
        "t": 765,
        "tundaanTotal": 2470950
      }
    ]
  }
}
```

**✅ Supported by API**: `POST /sa-surveys/sa-v` and `PUT /sa-surveys/sa-v/:id`

**API Payload Format**:
```json
{
  "header": {
    "simpang_id": 1,
    "tanggal": "2025-07-16",
    "perihal": "SA-V Testing",
    "status": "draft"
  },
  "delayData": [
    {
      "kode_pendekat": "B",
      "arus_lalu_lintas": 3230,
      "kapasitas": 1170,
      "derajat_kejenuhan": 6.212,
      "rasio_hijau": 0.260,
      "nq1": 261,
      "nq2": -108,
      "nq": 153,
      "nq_max": 242,
      "panjang_antrian": 4840,
      "rasio_kendaraan_terhenti": 1.535,
      "jumlah_kendaraan_terhenti": 4958,
      "tundaan_lalu_lintas": 759,
      "tundaan_geometri": 6,
      "tundaan_rata_rata": 765,
      "tundaan_total": 2470950
    }
  ],
  "performanceSummary": {
    "total_kendaraan_terhenti": 7451,
    "rasio_kendaraan_terhenti_rata": 1.097,
    "total_tundaan": 3274870,
    "tundaan_simpang_rata": 482.308,
    "level_of_service": "F",
    "performance_evaluation": "Poor performance - requires immediate attention"
  }
}
```

### **Validation Rules Supported**
- ✅ `tipeLingkunganJalan`: KIM, KOM, AT
- ✅ `kelasHambatanSamping`: R, T, S  
- ✅ `kodePendekat`: u, t, s, b
- ✅ Status management: draft → completed → approved
- ✅ Unique ID generation and management

## Base URL
```
http://localhost:3000/api
```

---

## 📋 **CORE SURVEY MANAGEMENT APIs**

### 1. Create Survey Header
**POST** `/sa-surveys`
```json
{
  "simpang_id": 1,
  "survey_type": "SA-I",
  "tanggal": "2025-01-15",
  "perihal": "Traffic analysis for intersection optimization",
  "status": "draft"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "simpang_id": 1,
    "survey_type": "SA-I",
    "tanggal": "2025-01-15",
    "perihal": "Traffic analysis for intersection optimization",
    "status": "draft",
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Survey by ID
**GET** `/sa-surveys/survey?id=1`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "simpang_id": 1,
    "survey_type": "SA-I",
    "tanggal": "2025-01-15",
    "perihal": "Traffic analysis for intersection optimization",
    "status": "draft",
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

### 3. Get All Surveys
**GET** `/sa-surveys`

**Query Parameters:**
- `survey_type` (optional): Filter by survey type (SA-I, SA-II, SA-III, SA-IV, SA-V)
- `simpang_id` (optional): Filter by intersection ID
- `status` (optional): Filter by status (draft, completed, approved)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "simpang_id": 1,
      "survey_type": "SA-I",
      "tanggal": "2025-01-15",
      "perihal": "Traffic analysis for intersection optimization",
      "status": "draft",
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

### 4. Update Survey
**PUT** `/sa-surveys/survey?id=1`
```json
{
  "perihal": "Updated traffic analysis description",
  "status": "completed"
}
```

### 5. Delete Survey
**DELETE** `/sa-surveys/survey?id=1`

---

## 📊 **FORM SA-I APIs (Intersection Performance Analysis)**

### 1. Create Complete SA-I Survey
**POST** `/sa-surveys/sa-i`
```json
{
  "surveyHeader": {
    "simpang_id": 1,
    "tanggal": "2025-01-15",
    "perihal": "SA-I Traffic Analysis",
    "status": "draft"
  },
  "pendekat": [
    {
      "kode_pendekat": "U",
      "tipe_lingkungan_jalan": "KOM",
      "kelas_hambatan_samping": "T",
      "median": "Ada",
      "kelandaian_pendekat": 5.0,
      "bkjt": true,
      "jarak_ke_kendaraan_parkir": 16.0,
      "lebar_awal_lajur": 3.5,
      "lebar_garis_henti": 3.5,
      "lebar_lajur_bki": 3.5,
      "lebar_lajur_keluar": 3.5
    }
  ],
  "fase": {
    "lokasi": "Tempel",
    "data": {
      "utara": {
        "tipe_pendekat": {
          "terlindung": true,
          "terlawan": false
        },
        "arah": {
          "bki": true,
          "bkijt": false,
          "lurus": true,
          "bka": true
        },
        "pemisahan_lurus_bka": true,
        "fase": {
          "fase_1": true,
          "fase_2": false,
          "fase_3": false,
          "fase_4": false
        }
      }
    }
  }
}
```

### 2. Get Complete SA-I Survey
**GET** `/sa-surveys/sa-i/1`

### 3. Update Complete SA-I Survey
**PUT** `/sa-surveys/sa-i/1`

---

## 🚗 **FORM SA-II APIs (Vehicle Data by Movement Direction)**

### 1. Create Complete SA-II Survey
**POST** `/sa-surveys/sa-ii`
```json
{
  "surveyHeader": {
    "simpang_id": 1,
    "tanggal": "2025-01-15",
    "perihal": "SA-II Vehicle Analysis",
    "status": "draft"
  },
  "ekuivalensi": {
    "terlindung": {
      "mp": 1.0,
      "ks": 1.3,
      "sm": 0.5
    },
    "terlawan": {
      "mp": 1.0,
      "ks": 1.3,
      "sm": 0.5
    }
  },
  "surveyData": [
    {
      "direction": "U",
      "rows": [
        {
          "type": "BKi",
          "mp": {
            "count_terlindung": 100,
            "count_terlawan": 50,
            "smp_terlindung": 100,
            "smp_terlawan": 50
          },
          "ks": {
            "count_terlindung": 20,
            "count_terlawan": 10,
            "smp_terlindung": 26,
            "smp_terlawan": 13
          },
          "sm": {
            "count_terlindung": 150,
            "count_terlawan": 75,
            "smp_terlindung": 75,
            "smp_terlawan": 37.5
          }
        }
      ]
    }
  ],
  "ktbData": [
    {
      "direction": "U",
      "ktb_count": 10,
      "turn_ratio": 0.05
    }
  ]
}
```

### 2. Get Complete SA-II Survey
**GET** `/sa-surveys/sa-ii/1`

### 3. Update Complete SA-II Survey
**PUT** `/sa-surveys/sa-ii/1`

### 4. Get EMP Configurations
**GET** `/sa-surveys/sa-ii/emp-configurations`

**Response:**
```json
{
  "success": true,
  "data": {
    "terlindung": {
      "mp": 1.0,
      "ks": 1.3,
      "sm": 0.5
    },
    "terlawan": {
      "mp": 1.0,
      "ks": 1.3,
      "sm": 0.5
    }
  }
}
```

---

## 🗺️ **FORM SA-III APIs (Intersection Sketch)**

### 1. Create Complete SA-III Survey
**POST** `/sa-surveys/sa-iii`
```json
{
  "surveyHeader": {
    "simpang_id": 1,
    "tanggal": "2025-01-15",
    "perihal": "SA-III Sketch Analysis",
    "status": "draft"
  },
  "phaseData": [
    {
      "fase_number": 1,
      "kode_pendekat": "U",
      "jarak_type": "lintasanBerangkat",
      "pendekat_u": 15.5,
      "pendekat_s": 0,
      "pendekat_t": 0,
      "pendekat_b": 0,
      "kecepatan_berangkat": 10.0,
      "kecepatan_datang": 5.0,
      "kecepatan_pejalan_kaki": 1.2,
      "waktu_tempuh": 1.55,
      "w_ms": 0.57,
      "w_ms_disesuaikan": 1.0,
      "w_k": 3,
      "w_ah": 4,
      "w_hh": 30
    }
  ],
  "measurements": [
    {
      "measurement_label": "North Approach",
      "start_longitude": 110.3700,
      "start_latitude": -7.7971,
      "end_longitude": 110.3701,
      "end_latitude": -7.7972,
      "distance_meters": 15.5
    }
  ]
}
```

### 2. Get Complete SA-III Survey
**GET** `/sa-surveys/sa-iii/1`

### 3. Update Complete SA-III Survey
**PUT** `/sa-surveys/sa-iii/1`

---

## 📈 **FORM SA-IV APIs (Saturated Flow and Capacity Analysis)**

### 1. Create Complete SA-IV Survey
**POST** `/sa-surveys/sa-iv`
```json
{
  "surveyHeader": {
    "simpang_id": 1,
    "tanggal": "2025-01-15",
    "perihal": "SA-IV Capacity Analysis",
    "status": "draft"
  },
  "capacityAnalysis": [
    {
      "kode_pendekat": "U",
      "tipe_pendekat": "P",
      "rasio_kendaraan_belok": {
        "rbkijt": 0.41,
        "rbki": 0.28,
        "rbka": 0.31
      },
      "arus_belok_kanan": {
        "dari_arah_ditinjau": 1437.5,
        "dari_arah_berlawanan": 332.5
      },
      "lebar_efektif": 5.0,
      "arus_jenuh_dasar": 3000,
      "faktor_penyesuaian": {
        "fhs": 1.0,
        "fuk": 1.0,
        "fg": 1.0,
        "fp": 1.0,
        "fbki": 1.0,
        "fbka": 1.0
      },
      "arus_jenuh_yang_disesuaikan": 3000,
      "arus_lalu_lintas": 1615,
      "rasio_arus": 0.269,
      "rasio_fase": 0.158,
      "waktu_hijau_per_fase": 13,
      "kapasitas": 780,
      "derajat_kejenuhan": 2.071
    }
  ],
  "phaseAnalysis": [
    {
      "kode_pendekat": "U",
      "tipe_pendekat": "P",
      "arah": "Terlindung",
      "pemisahan_lurus_rka": false,
      "phases": {
        "f1": {
          "mf": 1.0,
          "whi": 30,
          "w_all": {
            "wk": 3,
            "wms": 2
          }
        }
      },
      "whi_total": 30,
      "cycle_time": 100
    }
  ]
}
```

### 2. Get Complete SA-IV Survey
**GET** `/sa-surveys/sa-iv/1`

### 3. Update Complete SA-IV Survey
**PUT** `/sa-surveys/sa-iv/1`

### 4. Get Calculation Configuration
**GET** `/sa-surveys/sa-iv/config/1`

**Response:**
```json
{
  "success": true,
  "data": {
    "base_saturation_flow": 3000,
    "adjustment_factors": {
      "fhs": 1.0,
      "fuk": 1.0,
      "fg": 1.0,
      "fp": 1.0,
      "fbki": 1.0,
      "fbka": 1.0
    },
    "calculation_rules": {
      "default_cycle_time": 120,
      "minimum_green_time": 10
    }
  }
}
```

---

## ⏱️ **FORM SA-V APIs (Delay and Performance Analysis)**

### 1. Create Complete SA-V Survey
**POST** `/sa-surveys/sa-v`
```json
{
  "surveyHeader": {
    "simpang_id": 1,
    "tanggal": "2025-01-15",
    "perihal": "SA-V Delay Analysis",
    "status": "draft"
  },
  "delayData": [
    {
      "kode_pendekat": "U",
      "arus_lalu_lintas": 3230,
      "kapasitas": 1170,
      "derajat_kejenuhan": 2.76,
      "rasio_hijau": 0.260,
      "nq1": 261,
      "nq2": -108,
      "nq": 153,
      "nq_max": 242,
      "panjang_antrian": 4840,
      "rasio_kendaraan_terhenti": 1.535,
      "jumlah_kendaraan_terhenti": 4958,
      "tundaan_lalu_lintas": 759,
      "tundaan_geometri": 6,
      "tundaan_rata_rata": 765,
      "tundaan_total": 2470950
    }
  ],
  "performanceSummary": {
    "total_kendaraan_terhenti": 7451,
    "rasio_kendaraan_terhenti_rata": 1.097,
    "total_tundaan": 3274870,
    "tundaan_simpang_rata": 482.308,
    "level_of_service": "F",
    "performance_evaluation": "Poor performance - requires immediate attention"
  }
}
```

### 2. Get Complete SA-V Survey
**GET** `/sa-surveys/sa-v/1`

### 3. Update Complete SA-V Survey
**PUT** `/sa-surveys/sa-v/1`

---

## 🔧 **Error Responses**

All APIs return consistent error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "field": "Error description"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Survey not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 📝 **Notes**

1. **Authentication**: All endpoints require proper authentication (implement as needed)
2. **Validation**: All inputs are validated on both frontend and backend
3. **Transactions**: All create/update operations use database transactions
4. **Data Transformation**: APIs handle conversion between frontend and database formats
5. **Error Handling**: Comprehensive error handling with meaningful messages 