# Form SA API Documentation

## Overview
This document provides comprehensive API documentation for all Form SA (SA-I through SA-V) endpoints implemented in the traffic intersection analysis system.

## 📋 **REQUIREMENTS MAPPING**

This API documentation directly supports the frontend requirements from `Requirements.md`:

### **Frontend Requirements → API Endpoints**

#### **1. Survey Header Requirements**

**Frontend Requirement**: Survey header with date, location, period selection
**API Endpoints**:
- `POST /api/sa-surveys/headers` - Create survey header
- `GET /api/sa-surveys/headers` - Get all survey headers
- `GET /api/sa-surveys/headers/:id` - Get specific survey header
- `PUT /api/sa-surveys/headers/:id` - Update survey header
- `DELETE /api/sa-surveys/headers/:id` - Delete survey header

**Payload Structure**:
```json
{
  "simpang_id": 1,
  "tanggal": "2025-01-15",
  "perihal": "Traffic analysis for intersection optimization",
  "status": "draft"
}
```

#### **2. Form Data Management**

**Frontend Requirement**: Multiple forms (SA-I to SA-V) for same survey header
**API Endpoints**:
- `GET /api/sa-surveys/headers/:id/forms` - Get all forms for a header
- `POST /api/sa-surveys/headers/:id/forms` - Add form to existing header

**Payload Structure**:
```json
{
  "form_type": "SA-I",
  "status": "draft"
}
```

## 🚀 **SURVEY HEADER MANAGEMENT APIs**

### **1. Create Survey Header**
**POST** `/api/sa-surveys/headers`
```json
{
  "simpang_id": 1,
  "tanggal": "2025-01-15",
  "perihal": "Traffic analysis for intersection optimization",
  "status": "draft"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Survey header created successfully",
  "data": {
    "id": 1,
    "simpang_id": 1,
    "tanggal": "2025-01-15",
    "perihal": "Traffic analysis for intersection optimization",
    "status": "draft"
  }
}
```

### **2. Get All Survey Headers**
**GET** `/api/sa-surveys/headers`

**Query Parameters**:
- `simpang_id` (optional) - Filter by intersection
- `status` (optional) - Filter by status

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "simpang_id": 1,
      "tanggal": "2025-01-15",
      "perihal": "Traffic analysis",
      "status": "draft"
    }
  ]
}
```

### **3. Get Survey Header by ID**
**GET** `/api/sa-surveys/headers/:id`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "simpang_id": 1,
    "tanggal": "2025-01-15",
    "perihal": "Traffic analysis",
    "status": "draft"
  }
}
```

### **4. Update Survey Header**
**PUT** `/api/sa-surveys/headers/:id`
```json
{
  "simpang_id": 1,
  "tanggal": "2025-01-15",
  "perihal": "Updated traffic analysis",
  "status": "completed"
}
```

### **5. Delete Survey Header**
**DELETE** `/api/sa-surveys/headers/:id`

### **6. Get All Forms for a Header**
**GET** `/api/sa-surveys/headers/:id/forms`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "form_type": "SA-I",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    },
    {
      "form_type": "SA-II", 
      "created_at": "2025-01-15T11:00:00Z",
      "updated_at": "2025-01-15T11:00:00Z"
    }
  ]
}
```

### **7. Add Form to Existing Header**
**POST** `/api/sa-surveys/headers/:id/forms`
```json
{
  "form_type": "SA-II",
  "status": "draft"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Form SA-II added to header successfully",
  "data": {
    "id": 2,
    "simpang_id": 1,
    "survey_type": "SA-II",
    "tanggal": "2025-01-15",
    "perihal": "Traffic analysis",
    "status": "draft"
  }
}
```

## 📋 **WORKFLOW EXAMPLE**

### **Step 1: Create Survey Header**
```bash
POST /api/sa-surveys/headers
{
  "simpang_id": 1,
  "tanggal": "2025-01-15",
  "perihal": "Traffic analysis for intersection optimization",
  "status": "draft"
}
```

### **Step 2: Add SA-I Form Data**
```bash
POST /api/sa-surveys/headers/1/forms
{
  "form_type": "SA-I"
}
```

### **Step 3: Add SA-II Form Data**
```bash
POST /api/sa-surveys/headers/1/forms
{
  "form_type": "SA-II"
}
```

### **Step 4: Check All Forms**
```bash
GET /api/sa-surveys/headers/1/forms
```

## 📊 **FORM-SPECIFIC APIs**

### **SA-I: Intersection Performance Analysis**

#### **Create Complete SA-I Survey**
**POST** `/api/sa-surveys/sa-i`

**Payload Structure**:
```json
{
  "surveyHeader": {
    "simpang_id": 1,
    "tanggal": "2025-01-15",
    "perihal": "SA-I Traffic Analysis"
  },
  "pendekat": [
    {
      "kodePendekat": "U",
      "tipeLingkunganJalan": "KOM",
      "kelasHambatanSamping": "T",
      "median": "Yes",
      "kelandaianPendekat": 2.5,
      "bkjt": true,
      "jarakKeKendaraanParkir": 5.0,
      "lebarAwalLajur": 3.5,
      "lebarGarisHenti": 0.3,
      "lebarLajurBki": 3.2,
      "lebarLajurKeluar": 3.0
    }
  ],
  "fase": {
    "utara": {
      "tipe_pendekat": { "terlindung": true, "terlawan": false },
      "arah": { "bki": true, "bkijt": true, "lurus": true, "bka": true },
      "pemisahan_lurus_bka": false,
      "fase": { "fase_1": false, "fase_2": true, "fase_3": false, "fase_4": false }
    }
  }
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
    "simpang_id": 1,
    "tanggal": "2025-01-15",
    "perihal": "SA-II Vehicle Analysis"
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

#### **Get EMP Configurations**
**GET** `/api/sa-surveys/sa-ii/emp-configurations`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "vehicle_type": "MP",
      "condition_type": "terlindung",
      "emp_value": 1.0,
      "is_active": true
    },
    {
      "vehicle_type": "KS",
      "condition_type": "terlindung", 
      "emp_value": 1.3,
      "is_active": true
    }
  ]
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
    "simpang_id": 1,
    "tanggal": "2025-01-15",
    "perihal": "SA-III Sketch Analysis"
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
      "waktu_tempuh": 1.62,
      "w_ms": 0.57,
      "w_ms_disesuaikan": 1.0,
      "w_k": 3,
      "w_ah": 4,
      "w_hh": 30
    }
  ],
  "measurements": [
    {
      "measurement_label": "Intersection Width",
      "start_longitude": 110.123456,
      "start_latitude": -7.123456,
      "end_longitude": 110.123789,
      "end_latitude": -7.123789,
      "distance_meters": 25.5
    }
  ]
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
    "simpang_id": 1,
    "tanggal": "2025-01-15",
    "perihal": "SA-IV Capacity Analysis"
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

#### **Get Calculation Configuration**
**GET** `/api/sa-surveys/sa-iv/calculation-config/:simpangId`

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
    "simpang_id": 1,
    "tanggal": "2025-01-15",
    "perihal": "SA-V Delay Analysis"
  },
  "delayAnalysis": [
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

#### **Get Complete SA-V Survey**
**GET** `/api/sa-surveys/sa-v/:surveyId`

#### **Update Complete SA-V Survey**
**PUT** `/api/sa-surveys/sa-v/:surveyId`

## 🔄 **DATABASE STRUCTURE**

The APIs use the `sa_surveys` table with the following structure:

```sql
-- Survey header (reusable across forms)
sa_surveys {
  id: 1,
  simpang_id: 1,
  survey_type: NULL,  -- Initially NULL for header
  tanggal: "2025-01-15",
  perihal: "Traffic analysis",
  status: "draft"
}

-- Form data (linked to header)
sa_surveys {
  id: 2,
  simpang_id: 1,
  survey_type: "SA-I",  -- Form type
  tanggal: "2025-01-15",
  perihal: "Traffic analysis", 
  status: "draft"
}
```

## 🎯 **BENEFITS**

1. **Header Reusability**: One header can have multiple forms
2. **Better Organization**: Clear separation between header and form data
3. **Flexible Workflow**: Add forms incrementally to existing headers
4. **Clean API Design**: `form_type` instead of confusing `survey_type`
5. **Comprehensive Coverage**: All Form SA requirements supported

## 📝 **VALIDATION RULES**

### **Survey Header Validation**
- `simpang_id`: Required, must exist in `simpang` table
- `tanggal`: Required, valid date format (YYYY-MM-DD)
- `perihal`: Optional, text field
- `status`: Optional, enum('draft','completed','approved'), defaults to 'draft'

### **Form Type Validation**
- `form_type`: Required, enum('SA-I','SA-II','SA-III','SA-IV','SA-V')
- `status`: Optional, enum('draft','completed','approved'), defaults to 'draft'

### **Form-Specific Validation**
Each form type has its own validation rules as defined in the respective analysis documents.

## 🚨 **ERROR HANDLING**

### **Common Error Responses**

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "simpang_id": "Simpang ID is required",
    "tanggal": "Invalid date format"
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
curl -X POST http://localhost:3000/api/sa-surveys/headers \
  -H "Content-Type: application/json" \
  -d '{"simpang_id": 1, "tanggal": "2025-01-15", "perihal": "Test survey", "status": "draft"}'

# 2. Add SA-I form
curl -X POST http://localhost:3000/api/sa-surveys/headers/1/forms \
  -H "Content-Type: application/json" \
  -d '{"form_type": "SA-I", "status": "draft"}'

# 3. Add SA-II form  
curl -X POST http://localhost:3000/api/sa-surveys/headers/1/forms \
  -H "Content-Type: application/json" \
  -d '{"form_type": "SA-II", "status": "draft"}'

# 4. Get all forms
curl -X GET http://localhost:3000/api/sa-surveys/headers/1/forms
```

---

*This documentation provides comprehensive coverage of all Form SA APIs, ensuring frontend developers have complete information for integration.* 