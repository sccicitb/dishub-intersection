## Contoh Struktur localstorage (saat ini) referensi untuk di Database

```
{
  data: {
    headerData: {
      ...
      0: {},
      1: {}
    },
    sa1: {
      1752119026249: {
        fase: {...},
        pendekat: {...}
      }
    },
    sa2: {},
    sa3: {},
    sa4: {},
    sa5: {},
  }
}
```

## Sample Payload (SA-I Header Submission)

```
{
  "id": 1752119042910,
  "tanggal": "2025-07-16",
  "kabupatenKota": "Jogja",
  "lokasi": "Simpang",
  "ruasJalanMayor": [
    "Jl. Bagas"
  ],
  "ruasJalanMinor": [
    "Jl. Bagas"
  ],
  "ukuranKota": "20",
  "perihal": "Testing 3",
  "periode": "Kedua"
}
```

### Note:

- Field _id_ wajib unik.
- Field _tanggal_ dalam format YYYY-MM-DD.
- _ruasJalanMayor_ dan _ruasJalanMinor_ adalah array of string.
- ukuranKota bisa berupa nilai seperti "20" (dalam ribuan penduduk atau skala tertentu).
- perlu _GET_, _POST_, dan _UPDATE_.
- perlu status draft agar terlihat status tiap form nya yang sudah selesai.

## Sample Payload (Form SA-I)

```
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
    },
    {
      "kodePendekat": "s",
      "tipeLingkunganJalan": "kim",
      "kelasHambatanSamping": "r",
      "median": "2",
      "kelandaianPendekat": "2.5",
      "bkjt": "0",
      "jarakKeKendaraanParkir": "10",
      "lebarPendekat": {
        "awalLajur": "1",
        "garisHenti": "1",
        "lajurBki": "1",
        "lajurKeluar": "1"
      }
    }
  ],
  "updatedAt": 1753775220455,
  "fase": {
    "lokasi": "",
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
      },
      "selatan": {
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
          "fase_1": false,
          "fase_2": true,
          "fase_3": false,
          "fase_4": false
        }
      }
    }
  }
}
```

### Note:

- validasi _tipeLingkunganJalan_ hanya nilai => _KIM_, _KOM_, dan _AT_.
- validasi _kelasHambatanSamping_ hanya nilai => _R_, _T_, _S_.
- ```
  "data": {
      "utara": {
  ```
  utara atau arah lainnya sesuai yang diinput jadi bisa jadi nanti hanya dari 3 arah
- _kodePendekat_ hanya nilai => _u_, _t_, _s_, dan _b_
- untuk lebarPendekat harusnya angka tapi disini text bisa dirubah
  ```
   "lebarPendekat": {
        "awalLajur": "1",
        "garisHenti": "2",
        "lajurBki": "1",
        "lajurKeluar": "1"
    }
  ```
- butuh _GET_, _POST_, dan _UPDATE_