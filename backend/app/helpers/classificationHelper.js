const fs = require('fs');
const path = require('path');

function getClassificationData() {
  const classificationPath = path.join(__dirname, '../data/classification.json');
  // Defensive: if readFileSync fails, return []
  try {
    return JSON.parse(fs.readFileSync(classificationPath, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function getSubCodes(type) {
  const data = getClassificationData();
  return data
    .filter(item => item.type === type)
    .map(item => item.subCode);
}

function getJenisKendaraan(type) {
  const data = getClassificationData();
  const seen = new Set();
  return data
    .filter(entry => entry.type === type)
    .map(entry => {
      if (seen.has(entry.subCode)) return null;
      seen.add(entry.subCode);
      return {
        mainCode: entry.mainCode,
        subCode: entry.subCode
      };
    })
    .filter(Boolean);
}

module.exports = {
  getClassificationData,
  getSubCodes,
  getJenisKendaraan
};
