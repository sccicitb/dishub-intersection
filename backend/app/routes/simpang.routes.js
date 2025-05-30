// routes/simpang.routes.js
const simpangController = require('../controllers/simpang.controller');

module.exports = function(app) {
  app.get('/api/simpang', simpangController.getAllSimpang);        // List semua simpang
  app.get('/api/simpang/:id', simpangController.getSimpangById);   // Detail simpang
  app.post('/api/simpang', simpangController.createSimpang);       // Tambah simpang
  app.put('/api/simpang/:id', simpangController.updateSimpang);    // Edit simpang
  app.delete('/api/simpang/:id', simpangController.deleteSimpangById); // Hapus simpang
  
  app.get('/api/simpang/:id/cameras', simpangController.getCamerasBySimpangId); // Relasi
};
