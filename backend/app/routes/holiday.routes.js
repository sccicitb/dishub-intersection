module.exports = (app) => {
    const Holidays = require("../controllers/holiday.controller");
    const express = require("express");
    const multer = require("multer");
    
    // Import authentication and role middleware
    const { authenticateToken } = require('../middleware/auth.middleware');
    const { requireViewerOrHigher, requireAdmin } = require('../middleware/role.middleware');
  
    const upload = multer({ dest: "uploads/" }); // sementara simpan di folder uploads
  
    const router = express.Router();
  
    // Holiday CRUD Operations - Admin only for write operations, Viewer+ for read
    router.get("/", authenticateToken, requireViewerOrHigher, Holidays.getPaginated); // support ?page=&limit=
    router.post("/", authenticateToken, requireAdmin, Holidays.create); // Tambah holiday baru
    router.put("/:id", authenticateToken, requireAdmin, Holidays.update); // Edit holiday
    router.delete("/:id", authenticateToken, requireAdmin, Holidays.remove); // Hapus holiday
    router.post("/import", authenticateToken, requireAdmin, upload.single("file"), Holidays.importData); // Import file: JSON, CSV, XLSX
  
    app.use("/api/holidays", router);
  };
  