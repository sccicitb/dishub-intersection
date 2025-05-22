const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json()); /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); /* bodyParser.urlencoded() is deprecated */

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Dishub Jogja application." });
});

require("./app/routes/vehicle.routes.js")(app);
require("./app/routes/holiday.routes.js")(app);
// require("./app/routes/holiday.routes.js")(app);
require("./app/routes/maps.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
// Cek apakah file ini dijalankan langsung
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
}

module.exports = app; // 💡 penting: ekspor app untuk supertest
module.exports.close = () => {
  if (listener && typeof listener.close === 'function') {
    listener.close();
  }
};