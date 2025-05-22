const db = require("../config/db");

// Constructor (optional kalau mau buat instance Holiday)
const Holiday = function(data) {
  this.date = data.date;
  this.event_type = data.event_type;
  this.description = data.description;
};

// Ambil semua data (tanpa pagination)
Holiday.getAll = async (result) => {
  try {
    const [rows] = await db.query("SELECT * FROM holidays ORDER BY date ASC");
    result(null, rows);
  } catch (err) {
    result(err, null);
  }
};

// Ambil data dengan pagination
Holiday.getPaginated = async (page = 1, limit = 5, result) => {
  const offset = (page - 1) * limit;
  try {
    const [rows] = await db.query(
      "SELECT * FROM holidays ORDER BY date ASC LIMIT ? OFFSET ?",
      [parseInt(limit), parseInt(offset)]
    );
    result(null, rows);
  } catch (err) {
    result(err, null);
  }
};

// Tambah event baru
Holiday.create = async (data, result) => {
  try {
    const [res] = await db.query(
      "INSERT INTO holidays (date, event_type, description) VALUES (?, ?, ?)",
      [data.date, data.event_type, data.description]
    );
    result(null, { id: res.insertId, ...data });
  } catch (err) {
    result(err, null);
  }
};

// Update event
Holiday.update = async (id, data, result) => {
  try {
    const [res] = await db.query(
      "UPDATE holidays SET date = ?, event_type = ?, description = ? WHERE id = ?",
      [data.date, data.event_type, data.description, id]
    );
    result(null, res);
  } catch (err) {
    result(err, null);
  }
};

// Delete event
Holiday.delete = async (id, result) => {
  try {
    const [res] = await db.query("DELETE FROM holidays WHERE id = ?", [id]);
    result(null, res);
  } catch (err) {
    result(err, null);
  }
};

// Import (replace all)
Holiday.replaceAll = async (dataArray, result) => {
  try {
    await db.query("DELETE FROM holidays");
    const values = dataArray.map(item => [item.date, item.event_type, item.description]);
    await db.query(
      "INSERT INTO holidays (date, event_type, description) VALUES ?",
      [values]
    );
    result(null, { replaced: values.length });
  } catch (err) {
    result(err, null);
  }
};

// Import (append/update if date match)
Holiday.appendOrUpdate = async (dataArray, result) => {
  try {
    for (const item of dataArray) {
      const [exist] = await db.query("SELECT id FROM holidays WHERE date = ?", [item.date]);
      if (exist.length > 0) {
        await db.query(
          "UPDATE holidays SET event_type = ?, description = ? WHERE date = ?",
          [item.event_type, item.description, item.date]
        );
      } else {
        await db.query(
          "INSERT INTO holidays (date, event_type, description) VALUES (?, ?, ?)",
          [item.date, item.event_type, item.description]
        );
      }
    }
    result(null, { processed: dataArray.length });
  } catch (err) {
    result(err, null);
  }
};

Holiday.countAll = async (result) => {
  try {
    const [res] = await db.query("SELECT COUNT(*) as total FROM holidays");
    result(null, res[0].total);
  } catch (err) {
    result(err, null);
  }
};

module.exports = Holiday;
