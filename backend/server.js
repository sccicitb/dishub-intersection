const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");
const checkCameraStatus = require('./jobs/checkCameraStatus');
checkCameraStatus(); // jalanin cron saat server start

const app = express();

var corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://63.250.52.19:9091",  
    "http://63.250.52.19:6060",  // sementara untuk demo
    "https://dishub-dashboard-v2.layanancerdas.id",
    process.env.CORS_ORIGIN
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "x-requested-with",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Methods"
  ],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Additional CORS middleware for preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

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
require("./app/routes/maps.routes.js")(app);
require('./app/routes/camera.routes.js')(app);
require("./app/routes/survey.routes.js")(app);
require('./app/routes/simpang.routes')(app);

// Register the survey header routes
const saSurveyHeaderRoutes = require('./app/routes/sa_survey_headers.routes.js');
app.use('/api/sa-surveys', saSurveyHeaderRoutes);

// Register SA-I specific routes
const saIRoutes = require('./app/routes/sa_i.routes.js');
app.use('/api/sa-surveys/sa-i', saIRoutes);

// Register SA-II specific routes
const saIIRoutes = require('./app/routes/sa_ii.routes.js');
app.use('/api/sa-surveys/sa-ii', saIIRoutes);

// Register SA-III specific routes
const saIIIRoutes = require('./app/routes/sa_iii.routes.js');
app.use('/api/sa-surveys/sa-iii', saIIIRoutes);

// Register SA-IV specific routes
const saIVRoutes = require('./app/routes/sa_iv.routes.js');
app.use('/api/sa-surveys/sa-iv', saIVRoutes);

// Register SA-V specific routes
const saVRoutes = require('./app/routes/sa_v.routes.js');
app.use('/api/sa-surveys/sa-v', saVRoutes);

// Authentication and User Management Routes
const authRoutes = require('./app/routes/auth.routes');
const userRoutes = require('./app/routes/user.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Simpan instance listen di variabel
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
