const path = require("path");
const { parseHolidayFile } = require("../app/helpers/holidayParser");

describe("Holiday Parser", () => {
  const basePath = path.resolve(__dirname, "__data__");

  it("should parse valid JSON file", async () => {
    const filePath = path.join(basePath, "holiday_test_data.json");
    const data = await parseHolidayFile(filePath, ".json");

    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty("date");
    expect(data[0]).toHaveProperty("event_type");
    expect(data[0]).toHaveProperty("description");
  });

  it("should parse valid CSV file", async () => {
    const filePath = path.join(basePath, "holiday_test_data.csv");
    const data = await parseHolidayFile(filePath, ".csv");

    expect(Array.isArray(data)).toBe(true);
    expect(data[1].event_type).toBe("Cuti Bersama");
  });

  it("should parse valid XLSX file", async () => {
    const filePath = path.join(basePath, "holiday_test_data.xlsx");
    const data = await parseHolidayFile(filePath, ".xlsx");

    expect(data.length).toBeGreaterThan(0);
    expect(data[0].description).toMatch(/Tahun Baru/);
  });

  it("should throw error for unsupported file type", async () => {
    await expect(parseHolidayFile("somefile.txt", ".txt"))
      .rejects
      .toThrow("Unsupported file type");
  });
});
