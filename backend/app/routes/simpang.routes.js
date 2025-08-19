// routes/simpang.routes.js
const simpangController = require('../controllers/simpang.controller');

module.exports = function(app) {
  // Import authentication and role middleware
  const { authenticateToken } = require('../middleware/auth.middleware');
  const { requireViewerOrHigher, requireAdmin } = require('../middleware/role.middleware');

  // Simpang CRUD Operations - Admin only for write operations, Viewer+ for read
  app.get('/api/simpang', simpangController.getAllSimpang);        // List semua simpang
  app.get('/api/simpang/:id', authenticateToken, requireViewerOrHigher, simpangController.getSimpangById);   // Detail simpang
  app.get('/api/simpang/:id/detail', authenticateToken, requireViewerOrHigher, simpangController.getSimpangDetail); // Detail simpang with cameras
  app.post('/api/simpang', authenticateToken, requireAdmin, simpangController.createSimpang);       // Tambah simpang
  app.put('/api/simpang/:id', authenticateToken, requireAdmin, simpangController.updateSimpang);    // Edit simpang
  app.delete('/api/simpang/:id', authenticateToken, requireAdmin, simpangController.deleteSimpangById); // Hapus simpang
  
  app.get('/api/simpang/:id/cameras', authenticateToken, requireViewerOrHigher, simpangController.getCamerasBySimpangId); // Relasi
};
