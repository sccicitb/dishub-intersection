const Holiday = require("../app/models/holiday.model");

// Mock db.query
jest.mock("../app/config/db", () => ({
  query: jest.fn()
}));
const db = require("../app/config/db");

describe("Holiday Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleData = [
    { date: "2025-05-01", event_type: "Libur Nasional", description: "Hari Buruh" },
    { date: "2025-06-01", event_type: "Cuti Bersama", description: "Hari Pancasila" }
  ];

  // ✅ replaceAll
  it("should replace all holidays", async () => {
    db.query
      .mockResolvedValueOnce([{}]) // for DELETE
      .mockResolvedValueOnce([{}]); // for INSERT

    const callback = jest.fn();
    await Holiday.replaceAll(sampleData, callback);

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(db.query.mock.calls[0][0]).toMatch(/DELETE/i);
    expect(db.query.mock.calls[1][0]).toMatch(/INSERT/i);
    expect(callback).toHaveBeenCalledWith(null, { replaced: sampleData.length });
  });

  // ✅ appendOrUpdate
  it("should update if date exists and insert if not", async () => {
    db.query
      .mockResolvedValueOnce([[{ id: 1 }]]) // exists → update
      .mockResolvedValueOnce([[/* no match */]]) // not exist → insert
      .mockResolvedValueOnce([{}]) // update query
      .mockResolvedValueOnce([{}]); // insert query

    const callback = jest.fn();
    await Holiday.appendOrUpdate(sampleData, callback);

    expect(db.query).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenCalledWith(null, { processed: sampleData.length });
  });

  // ✅ getPaginated
  it("should get paginated results", async () => {
    db.query.mockResolvedValueOnce([[sampleData[0]]]);

    const callback = jest.fn();
    await Holiday.getPaginated(2, 1, callback);

    expect(db.query).toHaveBeenCalledWith(
      "SELECT * FROM holidays ORDER BY date ASC LIMIT ? OFFSET ?",
      [1, 1]
    );
    expect(callback).toHaveBeenCalledWith(null, [sampleData[0]]);
  });
});
