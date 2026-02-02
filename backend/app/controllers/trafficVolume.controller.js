const TrafficVolume = require("../models/trafficVolume.model");

exports.getVolumeStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).send({
        message: "Content can not be empty! startDate and endDate are required."
      });
    }

    // Convert input strings to Date objects for iteration
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Ensure we cover the full range inclusive (depending on input format)
    // Assuming input is like '2026-01-29 00:00:00'
    
    const dbData = await TrafficVolume.getVolumeByMinute(startDate, endDate);

    // Create a map for quick lookup
    const dataMap = new Map();
    dbData.forEach(row => {
      dataMap.set(row.Menit, row);
    });

    const result = [];
    let current = new Date(start);

    // Loop through every minute from start to end
    while (current <= end) {
      // Format current time to match MySQL DATE_FORMAT output: YYYY-MM-DD HH:mm:00
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const hours = String(current.getHours()).padStart(2, '0');
      const minutes = String(current.getMinutes()).padStart(2, '0');
      
      const timeKey = `${year}-${month}-${day} ${hours}:${minutes}:00`;

      if (dataMap.has(timeKey)) {
        result.push(dataMap.get(timeKey));
      } else {
        result.push({
          Menit: timeKey,
          Volume_Arah_Lengkap: 0,
          Volume_Arah_Parsial: 0,
          Volume_Arah_Terdefinisi: 0,
          Volume_Arah_NULL: 0,
          Total_Lalin_Per_Menit: 0
        });
      }

      // Increment by 1 minute
      current.setMinutes(current.getMinutes() + 1);
    }

    res.send(result);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving traffic volume stats."
    });
  }
};
