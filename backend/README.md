# Dishub Intersection Backend

This is the backend service for the Dishub Intersection project, handling traffic intersection management for Dishub Jogja.

## Features

- Real-time traffic light control
- Intersection monitoring
- Traffic data analytics
- API endpoints for frontend integration

## Prerequisites

- Node.js v14 or higher
- PostgreSQL database
- Redis (optional, for caching)

## Installation
TODO: Add installation instructions

## Listener Socket

Contoh format yang diterima
```
{
  "ID_Simpang": 2,
  "tipe_pendekat": "P",
  "counts": {
      "AUP": 0,
      "BB": 0,
      "BS": 0,
      "KTB": 0,
      "MP": 33,
      "SM": 79,
      "TB": 4,
      "TR": 13,
      "TS": 4,
      "GANDENG": 0
  },
  "arah_per_kelas": {
      "AUP": {},
      "BB": {},
      "BS": {},
      "KTB": {
          "east_to_west": 1,
          "west_to_east": 1
      },
      "MP": {},
      "SM": {},
      "TB": {
          "east_to_west": 1,
          "west_to_east": 1
      },
      "TR": {},
      "TS": {},
      "GANDENG": {}
  },
  "waktu": "2026-02-06 14:21:04"
}
```