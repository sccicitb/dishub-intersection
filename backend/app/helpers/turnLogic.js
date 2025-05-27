// app/helpers/turnLogic.js

// Untuk simpang 4 standar, mapping belok kiri, lurus, kanan berdasarkan dari_arah
const TURN_MAP = {
  north: {
    left: 'west',
    straight: 'south',
    right: 'east',
  },
  east: {
    left: 'north',
    straight: 'west',
    right: 'south',
  },
  south: {
    left: 'east',
    straight: 'north',
    right: 'west',
  },
  west: {
    left: 'south',
    straight: 'east',
    right: 'north',
  }
};

// Untuk row ke grid
const ROWS = [
  { row: 'row1', turn: 'left' },
  { row: 'row2', turn: 'straight' },
  { row: 'row3', turn: 'right' }
];

// Default urutan jenis kendaraan (kode kolom DB, bisa disesuaikan!)
const JENIS_KENDARAAN = ['SM', 'MP', 'BS', 'TR']; // Motor, Mobil, Bus, Truk

module.exports = { TURN_MAP, ROWS, JENIS_KENDARAAN };
