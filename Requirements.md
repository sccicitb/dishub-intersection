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

## Sample Payload atau Response (SA-I Header Submission)

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

## Sample Payload atau Response (Form SA-I)

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
- butuh _GET_, _POST_, dan _UPDATE_. (get by id yang udh dibuat termasuk header nya juga)

## Sample Response (Form SA-II Arus Kendaraan berdasarkan Lokasi Simpang)

```
  {
      u: {
        mp: [500, 100, 140],
        ks: [100, 250, 80],
        sm: [120, 220, 50],
        ktb: [0, 2, 0],
        rktb: [4, null, null]
      },
      t: {
        mp: [300, 120, 90],
        ks: [80, 210, 70],
        sm: [110, 200, 45],
        ktb: [1, 1, 1],
        rktb: [3, null, null]
      },
      b: {
        mp: [500, 620, 290],
        ks: [80, 270, 420],
        sm: [110, 110, 65],
        ktb: [1, 5, 2],
        rktb: [3, null, null]
      },
      s: {
        mp: [312, 620, 290],
        ks: [850, 270, 420],
        sm: [160, 310, 65],
        ktb: [1, 4, 2],
        rktb: [2, null, null]
      }
  }
```

### Note:
- butuh _GET_ by id yaitu jumlah kendaraan semua jenis kendaraan ada mp, ks, sm, ktb. dan rktb.
- u, t dsb => dari jalan simpang.
-  ```mp: [500, 100, 140],``` jumlah 3 jenis awal untuk urutan awal ada bki/ bkijt, kedua ada lurus, dan ketiga bka.

## Sample Payload atau Response (Form SA-II)

```
{
  "surveyHeader": {
    "id": 0,
    "tanggal": '',
    "kabupatenKota": '',
    "lokasi": '',
    "simpang_id": 0,
    "survey_type": "",
    "ruasJalanMayor": [''],
    "ruasJalanMinor": [''],
    "ukuranKota": '',
    "perihal": '',
    "periode": '',
    "status": ''
  },
  "ekuivalensi": {
    "terlindung": {
      "mp": "2",
      "ks": "2",
      "sm": "3"
    },
    "terlawan": {
      "mp": "1",
      "ks": "2.5",
      "sm": "1.5"
    }
  },
  "surveyData": [
    {
      "direction": "B",
      "rows": [
        {
          "type": "BKi / BKIJT",
          "mp": {
            "kendjam": 500,
            "terlindung": 1000,
            "terlawan": 500
          },
          "ks": {
            "kendjam": 80,
            "terlindung": 160,
            "terlawan": 200
          },
          "sm": {
            "kendjam": 110,
            "terlindung": 330,
            "terlawan": 165,
            "smpTerlindung": 0,
            "smpTerlawan": 0
          },
          "total": {
            "terlindung": 1490,
            "terlawan": 865,
            "smpTerlindung": 1490,
            "smpTerlawan": 865,
            "kendjam": 690
          },
          "ktb": {
            "rasio": 0.28,
            "count": 1
          },
          "rktb": 3
        },
        {
          "type": "Lurus",
          "mp": {
            "kendjam": 620,
            "terlindung": 1240,
            "terlawan": 620
          },
          "ks": {
            "kendjam": 270,
            "terlindung": 540,
            "terlawan": 675
          },
          "sm": {
            "kendjam": 110,
            "terlindung": 330,
            "terlawan": 165,
            "smpTerlindung": 0,
            "smpTerlawan": 0
          },
          "total": {
            "terlindung": 2110,
            "terlawan": 1460,
            "smpTerlindung": 2110,
            "smpTerlawan": 1460,
            "kendjam": 1000
          },
          "ktb": {
            "rasio": 0.41,
            "count": 5
          },
          "rktb": null
        },
        {
          "type": "BKa",
          "mp": {
            "kendjam": 290,
            "terlindung": 580,
            "terlawan": 290
          },
          "ks": {
            "kendjam": 420,
            "terlindung": 840,
            "terlawan": 1050
          },
          "sm": {
            "kendjam": 65,
            "terlindung": 195,
            "terlawan": 97.5,
            "smpTerlindung": 0,
            "smpTerlawan": 0
          },
          "total": {
            "terlindung": 1615,
            "terlawan": 1437.5,
            "smpTerlindung": 1615,
            "smpTerlawan": 1437.5,
            "kendjam": 775
          },
          "ktb": {
            "rasio": 0.31,
            "count": 2
          },
          "rktb": null
        }
      ],
      "subtotal": {
        "mp": {
          "kendjam": 1410,
          "terlindung": 2820,
          "terlawan": 1410
        },
        "ks": {
          "kendjam": 770,
          "terlindung": 1540,
          "terlawan": 1925
        },
        "sm": {
          "kendjam": 285,
          "terlindung": 855,
          "terlawan": 428,
          "smpTerlindung": 0,
          "smpTerlawan": 0
        },
        "total": {
          "kendjam": 2465,
          "terlindung": 5215,
          "terlawan": 3763,
          "smpTerlindung": 5215,
          "smpTerlawan": 3763
        },
        "ktb": 8,
        "rktb": 0.003
      }
    },
    ...
  ]
}
```

### Note:

- butuh _GET_, _POST_, dan _UPDATE_. (get by id yang udh dibuat termasuk header nya juga)
- 
```
  ...
    "surveyHeader": {
      "id": 0,
      "tanggal": '',
      "kabupatenKota": '',
      "lokasi": '',
      "simpang_id": 0,
      "survey_type": "",
      "ruasJalanMayor": [''],
      "ruasJalanMinor": [''],
      "ukuranKota": '',
      "perihal": '',
      "periode": '',
      "status": ''
    },
  ...
```
disini untuk header nya

```
  ...
    "ekuivalensi": {
      "terlindung": {
        "mp": "2",
        "ks": "2",
        "sm": "3"
      },
      "terlawan": {
        "mp": "1",
        "ks": "2.5",
        "sm": "1.5"
      }
    },
  ...
```
disini untuk ekuivalensi tabel mp, ks, sm nantinya dihtung di dalam tabel

```
 "surveyData": [
    {
      "direction": "B",
      "rows": [
        {
          "type": "BKi / BKIJT",
          "mp": {
            "kendjam": 500,
            "terlindung": 1000,
            "terlawan": 500
          },
          "ks": {
            "kendjam": 80,
            "terlindung": 160,
            "terlawan": 200
          },
          "sm": {
            "kendjam": 110,
            "terlindung": 330,
            "terlawan": 165,
            "smpTerlindung": 0,
            "smpTerlawan": 0
          },
          "total": {
            "terlindung": 1490,
            "terlawan": 865,
            "smpTerlindung": 1490,
            "smpTerlawan": 865,
            "kendjam": 690
          },
          "ktb": {
            "rasio": 0.28,
            "count": 1
          },
          "rktb": 3
        },
        {
          "type": "Lurus",
          "mp": {
            "kendjam": 620,
            "terlindung": 1240,
            "terlawan": 620
          },
          "ks": {
            "kendjam": 270,
            "terlindung": 540,
            "terlawan": 675
          },
          "sm": {
            "kendjam": 110,
            "terlindung": 330,
            "terlawan": 165,
            "smpTerlindung": 0,
            "smpTerlawan": 0
          },
          "total": {
            "terlindung": 2110,
            "terlawan": 1460,
            "smpTerlindung": 2110,
            "smpTerlawan": 1460,
            "kendjam": 1000
          },
          "ktb": {
            "rasio": 0.41,
            "count": 5
          },
          "rktb": null
        },
        {
          "type": "BKa",
          "mp": {
            "kendjam": 290,
            "terlindung": 580,
            "terlawan": 290
          },
          "ks": {
            "kendjam": 420,
            "terlindung": 840,
            "terlawan": 1050
          },
          "sm": {
            "kendjam": 65,
            "terlindung": 195,
            "terlawan": 97.5,
            "smpTerlindung": 0,
            "smpTerlawan": 0
          },
          "total": {
            "terlindung": 1615,
            "terlawan": 1437.5,
            "smpTerlindung": 1615,
            "smpTerlawan": 1437.5,
            "kendjam": 775
          },
          "ktb": {
            "rasio": 0.31,
            "count": 2
          },
          "rktb": null
        }
      ],
      "subtotal": {
        "mp": {
          "kendjam": 1410,
          "terlindung": 2820,
          "terlawan": 1410
        },
        "ks": {
          "kendjam": 770,
          "terlindung": 1540,
          "terlawan": 1925
        },
        "sm": {
          "kendjam": 285,
          "terlindung": 855,
          "terlawan": 428,
          "smpTerlindung": 0,
          "smpTerlawan": 0
        },
        "total": {
          "kendjam": 2465,
          "terlindung": 5215,
          "terlawan": 3763,
          "smpTerlindung": 5215,
          "smpTerlawan": 3763
        },
        "ktb": 8,
        "rktb": 0.003
      }
    },
    ...
  ]
```
disini ada survey data untuk tabel yang sudah dihitung juga

## Sample Response (Form SA-II Diagram Terlindung dan Terlawan)

```
[
  {
    "type": "terlindungi",
    "data": {
      "Utara": [90, 110, 120, 130, 160, 140, 130, 125, 110, 95, 85, 70],
      "Timur": [80, 90, 100, 120, 140, 160, 170, 165, 140, 120, 100, 85],
      "Selatan": [100, 120, 130, 140, 135, 130, 125, 120, 110, 95, 85, 70],
      "Barat": [70, 80, 90, 100, 110, 120, 125, 130, 135, 130, 120, 110]
    }
  },
  {
    "type": "terlawanan",
    "data": {
      "Utara": [100, 110, 130, 150, 160, 160, 150, 135, 130, 105, 95, 90],
      "Timur": [90, 95, 105, 120, 140, 160, 170, 155, 140, 120, 100, 85],
      "Selatan": [100, 120, 140, 150, 145, 140, 130, 125, 115, 100, 90, 75],
      "Barat": [80, 90, 100, 110, 120, 130, 135, 140, 145, 135, 125, 115]
    }
  }
]
```

### Note:

- butuh _GET_ hanya menampilkan data kendaraan semua jenis _per bulan dalam satu tahun_

## Sample Response (Sketsa Simpang Form SA-II)

```
{
  "category": [
    {
      "name": "Arus Kendaraan Bermotor kend / jam",
      "directions": {
        "north": {
          "row1": [{ "id": "n1-1", "content": 42 }],
          "row2": [{ "id": "n2-1", "content": 15 }],
          "row3": [{ "id": "n3-1", "content": 89 }]
        },
        "south": {
          "row1": [{ "id": "s1-1", "content": 77 }],
          "row2": [{ "id": "s2-1", "content": 64 }],
          "row3": [{ "id": "s3-1", "content": 13 }]
        },
        "east": {
          "row1": [{ "id": "e1-1", "content": 55 }],
          "row2": [{ "id": "e2-1", "content": 98 }],
          "row3": [{ "id": "e3-1", "content": 26 }]
        },
        "west": {
          "row1": [{ "id": "w1-1", "content": 33 }],
          "row2": [{ "id": "w2-1", "content": 71 }],
          "row3": [{ "id": "w3-1", "content": 6 }]
        }
      }
    },
    {
      "name": "Arus Kendaraan Bermotor Terlindung (P) SMP / jam",
      "directions": {
        "north": {
          "row1": [{ "id": "n1-1", "content": 59 }],
          "row2": [{ "id": "n2-1", "content": 82 }],
          "row3": [{ "id": "n3-1", "content": 44 }]
        },
        "south": {
          "row1": [{ "id": "s1-1", "content": 3 }],
          "row2": [{ "id": "s2-1", "content": 67 }],
          "row3": [{ "id": "s3-1", "content": 21 }]
        },
        "east": {
          "row1": [{ "id": "e1-1", "content": 94 }],
          "row2": [{ "id": "e2-1", "content": 30 }],
          "row3": [{ "id": "e3-1", "content": 79 }]
        },
        "west": {
          "row1": [{ "id": "w1-1", "content": 18 }],
          "row2": [{ "id": "w2-1", "content": 48 }],
          "row3": [{ "id": "w3-1", "content": 97 }]
        }
      }
    },
    {
      "name": "Arus Kendaraan Bermotor Terlawan (O) SMP / jam",
      "directions": {
        "north": {
          "row1": [{ "id": "n1-1", "content": 40 }],
          "row2": [{ "id": "n2-1", "content": 5 }],
          "row3": [{ "id": "n3-1", "content": 100 }]
        },
        "south": {
          "row1": [{ "id": "s1-1", "content": 66 }],
          "row2": [{ "id": "s2-1", "content": 81 }],
          "row3": [{ "id": "s3-1", "content": 20 }]
        },
        "east": {
          "row1": [{ "id": "e1-1", "content": 92 }],
          "row2": [{ "id": "e2-1", "content": 16 }],
          "row3": [{ "id": "e3-1", "content": 70 }]
        },
        "west": {
          "row1": [{ "id": "w1-1", "content": 28 }],
          "row2": [{ "id": "w2-1", "content": 43 }],
          "row3": [{ "id": "w3-1", "content": 35 }]
        }
      }
    },
    {
      "name": "Arus Kend.Tak Bermotor kend / jam",
      "directions": {
        "north": {
          "row1": [{ "id": "n1-1", "content": 84 }],
          "row2": [{ "id": "n2-1", "content": 25 }],
          "row3": [{ "id": "n3-1", "content": 62 }]
        },
        "south": {
          "row1": [{ "id": "s1-1", "content": 12 }],
          "row2": [{ "id": "s2-1", "content": 76 }],
          "row3": [{ "id": "s3-1", "content": 49 }]
        },
        "east": {
          "row1": [{ "id": "e1-1", "content": 2 }],
          "row2": [{ "id": "e2-1", "content": 87 }],
          "row3": [{ "id": "e3-1", "content": 68 }]
        },
        "west": {
          "row1": [{ "id": "w1-1", "content": 61 }],
          "row2": [{ "id": "w2-1", "content": 8 }],
          "row3": [{ "id": "w3-1", "content": 36 }]
        }
      }
    },
    {
      "name": "Rasio Belok Kendaraan",
      "directions": {
        "north": {
          "row1": [{ "id": "n1-1", "content": 85 }],
          "row2": [{ "id": "n2-1", "content": 38 }],
          "row3": [{ "id": "n3-1", "content": 56 }]
        },
        "south": {
          "row1": [{ "id": "s1-1", "content": 23 }],
          "row2": [{ "id": "s2-1", "content": 7 }],
          "row3": [{ "id": "s3-1", "content": 73 }]
        },
        "east": {
          "row1": [{ "id": "e1-1", "content": 91 }],
          "row2": [{ "id": "e2-1", "content": 10 }],
          "row3": [{ "id": "e3-1", "content": 60 }]
        },
        "west": {
          "row1": [{ "id": "w1-1", "content": 17 }],
          "row2": [{ "id": "w2-1", "content": 90 }],
          "row3": [{ "id": "w3-1", "content": 53 }]
        }
      }
    }
  ]
}
```

### Note:

- butuh _GET_.
- _name_ sebagai label jenis kategori.

## Sample Payload (Form SA-III)

```
{
  "tabel_konflik": {
    "whh": 0,
    "dataFase": [
      {
        "fase": 1,
        "kode": "U",
        "whh": 0,
        "jarak": {
          "lintasanBerangkat": {
            "pendekat": {
              "u": 0,
              "s": 0,
              "t": 0,
              "b": 0
            },
            "kecepatan": {
              "vkbr": 0,
              "vkdt": 0,
              "vpk": 0
            },
            "waktuTempuh": 0,
            "wms": 0,
            "wmsDisesuaikan": 0,
            "wk": 0,
            "wah": 0
          },
          "panjangBerangkat": {
            "pendekat": {
              "u": 0,
              "s": 0,
              "t": 0,
              "b": 0
            },
            "kecepatan": {
              "vkbr": 0,
              "vkdt": 0,
              "vpk": 0
            },
            "waktuTempuh": 0,
            "wms": 0,
            "wmsDisesuaikan": 0,
            "wk": 0,
            "wah": 0
          },
          "lintasanDatang": {
            "pendekat": {
              "u": 0,
              "s": 0,
              "t": 0,
              "b": 0
            },
            "kecepatan": {
              "vkbr": 0,
              "vkdt": 0,
              "vpk": 0
            },
            "waktuTempuh": 0,
            "wms": 0,
            "wmsDisesuaikan": 0,
            "wk": 0,
            "wah": 0
          },
          "lintasanPejalan": {
            "pendekat": {
              "u": 0,
              "s": 0,
              "t": 0,
              "b": 0
            },
            "kecepatan": {
              "vkbr": 0,
              "vkdt": 0,
              "vpk": 0
            },
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

### Note:

- butuh _GET_, _UPDATE_, _POST_. (get by id yang udh dibuat termasuk header nya juga)
- _name_ sebagai label jenis kategori.

## Sample Payload (Form SA-IV)

```
{
  "SAIV": {
    "tabel": [
      {
        "kodePendekat": "B",
        "hijauFase": 1,
        "tipependekat": "P",
        "rasioKendaraanBelok": {
          "rbkijt": 0.41,
          "rbki": 0.28,
          "rbka": 0.31
        },
        "arusBelokKanan": {
          "dariArahDitinjau": 1437.5,
          "dariArahBerlawanan": 332.5
        },
        "lebarEfektif": 5,
        "arusJenuhDasar": 3000,
        "faktorPenyesuaian": {
          "fhs": 2,
          "fux": 1,
          "fg": 1,
          "fp": 1,
          "fbki": 1,
          "fbka": 1
        },
        "arusJenuhYangDisesuaikan": {
          "j": 6000
        },
        "arusLaluLintas": 1615,
        "rasioArus": 0.26916666666666667,
        "rasioFase": 0.158,
        "waktuHijauPerFase": "13",
        "kapasitas": 780,
        "derajatKejenuhan": "2.071"
      },
      {
        "kodePendekat": "B",
        "hijauFase": 4,
        "tipependekat": "P",
        "rasioKendaraanBelok": {
          "rbkijt": 0.41,
          "rbki": 0.28,
          "rbka": 0.31
        },
        "arusBelokKanan": {
          "dariArahDitinjau": 1437.5,
          "dariArahBerlawanan": 332.5
        },
        "lebarEfektif": 5,
        "arusJenuhDasar": 3000,
        "faktorPenyesuaian": {
          "fhs": 1,
          "fux": 1,
          "fg": 1,
          "fp": 1,
          "fbki": 1,
          "fbka": 1
        },
        "arusJenuhYangDisesuaikan": {
          "j": 3000
        },
        "arusLaluLintas": 1615,
        "rasioArus": 0.5383333333333333,
        "rasioFase": 0.158,
        "waktuHijauPerFase": "13",
        "kapasitas": 390,
        "derajatKejenuhan": "4.141"
      },
      {
        "kodePendekat": "T",
        "hijauFase": 2,
        "tipependekat": "P",
        "rasioKendaraanBelok": {
          "rbkijt": 0.43,
          "rbki": 0.4,
          "rbka": 0.17
        },
        "arusBelokKanan": {
          "dariArahDitinjau": 332.5,
          "dariArahBerlawanan": 1437.5
        },
        "lebarEfektif": 3,
        "arusJenuhDasar": 1800,
        "faktorPenyesuaian": {
          "fhs": 1,
          "fux": 1,
          "fg": 3,
          "fp": 1,
          "fbki": 1,
          "fbka": 1
        },
        "arusJenuhYangDisesuaikan": {
          "j": 5400
        },
        "arusLaluLintas": 455,
        "rasioArus": 0.08425925925925926,
        "rasioFase": 0.05,
        "waktuHijauPerFase": "4",
        "kapasitas": 216,
        "derajatKejenuhan": "2.106"
      },
      {
        "kodePendekat": "S",
        "hijauFase": 3,
        "tipependekat": "P",
        "rasioKendaraanBelok": {
          "rbkijt": 0.36,
          "rbki": 0.4,
          "rbka": 0.24
        },
        "arusBelokKanan": {
          "dariArahDitinjau": 1437.5,
          "dariArahBerlawanan": ""
        },
        "lebarEfektif": 1,
        "arusJenuhDasar": 600,
        "faktorPenyesuaian": {
          "fhs": 2,
          "fux": 1,
          "fg": 1,
          "fp": 1,
          "fbki": 1,
          "fbka": 1
        },
        "arusJenuhYangDisesuaikan": {
          "j": 1200
        },
        "arusLaluLintas": 1615,
        "rasioArus": 1.3458333333333334,
        "rasioFase": 0.792,
        "waktuHijauPerFase": "67",
        "kapasitas": 804,
        "derajatKejenuhan": "2.009"
      }
    ],
    "foot": {
      "ras": 1.699,
      "whh": 16,
      "S": 100,
      "sbp": "-41.49"
    }
  }
}
```

### Note:

- butuh _GET_, _UPDATE_, dan _CREATE_. (get by id yang udh dibuat termasuk header nya juga)
- untuk diagram dan tabel analisis ambil dari satu response tabel sa IV ini.

## Sample Payload atau Response (Form SA-V)

```
{
  "SAV": {
    "trata": "482.308",
    "totalrata": "0.63",
    "rkhrata": "2484",
    "qtotal": 6790,
    "row_1": 0,
    "row_2": 1,
    "row_3": 1,
    "row_4": 1490,
    "qbkijt": 0,
    "total_tundaan": 3274870,
    "tkt": 7451,
    "pol": 2,
    "rkt": 1.0973490427098676,
    "bkijt": 1490,
    "los": "F",
    "polution": 135.8,
    "loss": 818717500,
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
      },
      {
        "kode": "T",
        "q": 455,
        "c": 216,
        "dj": 2.106,
        "rh": "0.040",
        "nq1": 56,
        "nq2": 13,
        "nq": 69,
        "nqMax": 109,
        "pa": "2180",
        "rqh": "4.913",
        "nqh": "2235",
        "tl": "984",
        "tg": "20",
        "t": 1004,
        "tundaanTotal": 456820
      },
      {
        "kode": "S",
        "q": 1615,
        "c": 804,
        "dj": 2.009,
        "rh": "0.670",
        "nq1": 51,
        "nq2": -43,
        "nq": 8,
        "nqMax": 13,
        "pa": "260",
        "rqh": "0.160",
        "nqh": "258",
        "tl": "213",
        "tg": "1",
        "t": 214,
        "tundaanTotal": 345610
      }
    ]
  }
}
```

### Note: 
- butuh _GET_, _POST_, dan _CREATE_. (get by id yang udh dibuat termasuk header nya juga). 