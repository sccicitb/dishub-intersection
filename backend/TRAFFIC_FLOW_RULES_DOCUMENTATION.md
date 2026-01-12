# Dokumentasi Traffic Flow Rules - IN dan OUT

## Penjelasan Umum

API `GET /api/vehicles/getMasukKeluarByArah` menghitung traffic yang **MASUK (IN)** dan **KELUAR (OUT)** untuk setiap arah berdasarkan **location-specific flow rules**.

Dalam tabel `arus`, setiap record memiliki:
- `dari_arah` (origin direction) - arah kendaraan berasal
- `ke_arah` (destination direction) - arah kendaraan tujuan
- `ID_Simpang` - ID simpang/persimpangan

## Logika IN vs OUT

- **IN (Masuk)**: Traffic yang masuk ke area tertentu (berdasarkan combination dari_arah dan ke_arah)
- **OUT (Keluar)**: Traffic yang keluar dari area tertentu (berdasarkan combination dari_arah dan ke_arah)

Aturan ini **berbeda untuk setiap simpang** karena kondisi geografis yang berbeda.

---

## Detail Rules per Simpang

### Prambanan (ID: 2)

#### IN (Masuk ke area Prambanan):
```
- dari_arah = 'east' AND ke_arah = 'south'  → Masuk
- dari_arah = 'east' AND ke_arah = 'west'   → Masuk
- dari_arah = 'south' AND ke_arah = 'west'  → Masuk
- dari_arah = 'north' AND ke_arah = 'west'  → Masuk
```

#### OUT (Keluar dari area Prambanan):
```
- dari_arah = 'south' AND ke_arah = 'east'  → Keluar
- dari_arah = 'west' AND ke_arah = 'east'   → Keluar
- dari_arah = 'north' AND ke_arah = 'east'  → Keluar
```

---

### Piyungan (ID: 4)

#### IN (Masuk ke area Piyungan):
```
- dari_arah = 'east' AND ke_arah = 'west'   → Masuk
```

#### OUT (Keluar dari area Piyungan):
```
- dari_arah = 'west' AND ke_arah = 'east'   → Keluar
```

---

### Demen Glagah (ID: 3)

#### IN (Masuk ke area Demen Glagah):
```
- dari_arah = 'south' AND ke_arah = 'east'  → Masuk
- dari_arah = 'west' AND ke_arah = 'east'   → Masuk
- dari_arah = 'north' AND ke_arah = 'south' → Masuk
```

#### OUT (Keluar dari area Demen Glagah):
```
- dari_arah = 'east' AND ke_arah = 'west'   → Keluar
- dari_arah = 'south' AND ke_arah = 'west'  → Keluar
```

---

### Tempel (ID: 5)

#### IN (Masuk ke area Tempel):
```
- dari_arah = 'east' AND ke_arah = 'south'  → Masuk
- dari_arah = 'west' AND ke_arah = 'south'  → Masuk
```

#### OUT (Keluar dari area Tempel):
```
- dari_arah = 'east' AND ke_arah = 'north'  → Keluar
- dari_arah = 'south' AND ke_arah = 'north' → Keluar
- dari_arah = 'west' AND ke_arah = 'north'  → Keluar
```

---

## Implementasi SQL

Untuk menghitung IN dan OUT per arah di query:

```sql
SELECT 
  -- East direction
  COUNT(CASE WHEN ke_arah = 'east' AND (flow_in_cases) IS NOT NULL THEN 1 END) AS east_total_IN,
  COUNT(CASE WHEN dari_arah = 'east' AND (flow_out_cases) IS NOT NULL THEN 1 END) AS east_total_OUT,
  
  -- North direction  
  COUNT(CASE WHEN ke_arah = 'north' AND (flow_in_cases) IS NOT NULL THEN 1 END) AS north_total_IN,
  COUNT(CASE WHEN dari_arah = 'north' AND (flow_out_cases) IS NOT NULL THEN 1 END) AS north_total_OUT,
  
  -- South direction
  COUNT(CASE WHEN ke_arah = 'south' AND (flow_in_cases) IS NOT NULL THEN 1 END) AS south_total_IN,
  COUNT(CASE WHEN dari_arah = 'south' AND (flow_out_cases) IS NOT NULL THEN 1 END) AS south_total_OUT,
  
  -- West direction
  COUNT(CASE WHEN ke_arah = 'west' AND (flow_in_cases) IS NOT NULL THEN 1 END) AS west_total_IN,
  COUNT(CASE WHEN dari_arah = 'west' AND (flow_out_cases) IS NOT NULL THEN 1 END) AS west_total_OUT
FROM arus
WHERE date_filter AND simpang_filter;
```

---

## Contoh Penggunaan

### Request:
```
GET /api/vehicles/getMasukKeluarByArah?filter=day&simpang=2
```

### Response:
```json
{
  "status": "ok",
  "data": [
    {
      "arah": "east",
      "total_IN": 11,    // Traffic ke arah 'east' yang memenuhi IN rules
      "total_OUT": 1     // Traffic dari arah 'east' yang memenuhi OUT rules
    },
    {
      "arah": "north",
      "total_IN": 0,
      "total_OUT": 0
    },
    {
      "arah": "south",
      "total_IN": 0,
      "total_OUT": 5     // Traffic dari arah 'south' yang memenuhi OUT rules
    },
    {
      "arah": "west",
      "total_IN": 0,
      "total_OUT": 2     // Traffic dari arah 'west' yang memenuhi OUT rules
    }
  ]
}
```

---

## Cara Mengecek di Database

### Untuk cek IN dari arah tertentu (misal East ke South untuk Prambanan):
```sql
SELECT COUNT(*) as count 
FROM arus 
WHERE ID_Simpang = 2 
  AND dari_arah = 'east' 
  AND ke_arah = 'south'
  AND DATE(waktu) = CURDATE();
```

### Untuk cek OUT dari arah tertentu (misal South ke East untuk Prambanan):
```sql
SELECT COUNT(*) as count 
FROM arus 
WHERE ID_Simpang = 2 
  AND dari_arah = 'south' 
  AND ke_arah = 'east'
  AND DATE(waktu) = CURDATE();
```

### Untuk cek semua traffic di arah tertentu:
```sql
SELECT 
  dari_arah, 
  ke_arah, 
  COUNT(*) as count
FROM arus 
WHERE ID_Simpang = 2
  AND DATE(waktu) = CURDATE()
GROUP BY dari_arah, ke_arah
ORDER BY dari_arah, ke_arah;
```
