module.exports = (app) => {
    const Holidays = require("../controllers/holiday.controller");
    const express = require("express");
    const multer = require("multer");
  
    const upload = multer({ dest: "uploads/" }); // sementara simpan di folder uploads
  
    const router = express.Router();
  
    // Tambah holiday baru
    router.post("/", Holidays.create);
  
    // Edit holiday
    router.put("/:id", Holidays.update);
  
    // Hapus holiday
    router.delete("/:id", Holidays.remove);
  
    // Ambil semua holiday
    router.get("/", Holidays.getPaginated); // support ?page=&limit=
  
    // Import file: JSON, CSV, XLSX
    router.post("/import", upload.single("file"), Holidays.importData);
  
    app.use("/api/holidays", router);
  };
  