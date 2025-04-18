const sql = require("./db.js");

// constructor
const Vehicle = function(Vehicle) {
  this.title = Vehicle.title;
  this.description = Vehicle.description;
  this.published = Vehicle.published;
};

Vehicle.create = (newVehicle, result) => {
  sql.query("INSERT INTO Vehicles SET ?", newVehicle, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Vehicle: ", { id: res.insertId, ...newVehicle });
    result(null, { id: res.insertId, ...newVehicle });
  });
};

Vehicle.findById = (id, result) => {
  sql.query(`SELECT * FROM Vehicles WHERE id = ${id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found Vehicle: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Vehicle with the id
    result({ kind: "not_found" }, null);
  });
};

Vehicle.getAll = (title, result) => {
  let query = "SELECT * FROM Vehicles";

  if (title) {
    query += ` WHERE title LIKE '%${title}%'`;
  }

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("Vehicles: ", res);
    result(null, res);
  });
};

Vehicle.getAllPublished = result => {
  sql.query("SELECT * FROM Vehicles WHERE published=true", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("Vehicles: ", res);
    result(null, res);
  });
};

Vehicle.updateById = (id, Vehicle, result) => {
  sql.query(
    "UPDATE Vehicles SET title = ?, description = ?, published = ? WHERE id = ?",
    [Vehicle.title, Vehicle.description, Vehicle.published, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Vehicle with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated Vehicle: ", { id: id, ...Vehicle });
      result(null, { id: id, ...Vehicle });
    }
  );
};

Vehicle.remove = (id, result) => {
  sql.query("DELETE FROM Vehicles WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Vehicle with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted Vehicle with id: ", id);
    result(null, res);
  });
};

Vehicle.removeAll = result => {
  sql.query("DELETE FROM Vehicles", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} Vehicles`);
    result(null, res);
  });
};

module.exports = Vehicle;
