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

  // getAll
  it("should fetch all holidays", async () => {
    db.query.mockResolvedValueOnce([[sampleData[0], sampleData[1]]]);

    const callback = jest.fn();
    await Holiday.getAll(callback);

    expect(db.query).toHaveBeenCalledWith("SELECT * FROM holidays ORDER BY date ASC");
    expect(callback).toHaveBeenCalledWith(null, [sampleData[0], sampleData[1]]);
  });

  // getPaginated
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

  // countAll
  it("should return total count", async () => {
    db.query.mockResolvedValueOnce([[{ total: 24 }]]);

    const callback = jest.fn();
    await Holiday.countAll(callback);

    expect(db.query).toHaveBeenCalledWith("SELECT COUNT(*) as total FROM holidays");
    expect(callback).toHaveBeenCalledWith(null, 24);
  });

  // create
  it("should create new holiday", async () => {
    db.query.mockResolvedValueOnce([{ insertId: 123 }]);

    const callback = jest.fn();
    await Holiday.create(sampleData[0], callback);

    expect(db.query).toHaveBeenCalledWith(
      "INSERT INTO holidays (date, event_type, description) VALUES (?, ?, ?)",
      [sampleData[0].date, sampleData[0].event_type, sampleData[0].description]
    );
    expect(callback).toHaveBeenCalledWith(null, { id: 123, ...sampleData[0] });
  });

  // update
  it("should update existing holiday", async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const callback = jest.fn();
    await Holiday.update(1, sampleData[0], callback);

    expect(db.query).toHaveBeenCalledWith(
      "UPDATE holidays SET date = ?, event_type = ?, description = ? WHERE id = ?",
      [sampleData[0].date, sampleData[0].event_type, sampleData[0].description, 1]
    );
    expect(callback).toHaveBeenCalledWith(null, { affectedRows: 1 });
  });

  // delete
  it("should delete a holiday", async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const callback = jest.fn();
    await Holiday.delete(1, callback);

    expect(db.query).toHaveBeenCalledWith("DELETE FROM holidays WHERE id = ?", [1]);
    expect(callback).toHaveBeenCalledWith(null, { affectedRows: 1 });
  });

  // replaceAll
  it("should replace all holidays", async () => {
    db.query
      .mockResolvedValueOnce([{}]) // DELETE
      .mockResolvedValueOnce([{}]); // INSERT

    const callback = jest.fn();
    await Holiday.replaceAll(sampleData, callback);

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(db.query.mock.calls[0][0]).toMatch(/DELETE/i);
    expect(db.query.mock.calls[1][0]).toMatch(/INSERT/i);
    expect(callback).toHaveBeenCalledWith(null, { replaced: sampleData.length });
  });

  // appendOrUpdate
  it("should update if date exists and insert if not", async () => {
    db.query
      .mockResolvedValueOnce([[{ id: 1 }]]) // exists
      .mockResolvedValueOnce([[/* no match */]]) // not exists
      .mockResolvedValueOnce([{}]) // update
      .mockResolvedValueOnce([{}]); // insert

    const callback = jest.fn();
    await Holiday.appendOrUpdate(sampleData, callback);

    expect(db.query).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenCalledWith(null, { processed: sampleData.length });
  });

  it("should return error if getAll fails", async () => {
    db.query.mockRejectedValueOnce(new Error("DB error"));
    const callback = jest.fn();
    await Holiday.getAll(callback);
    expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
  });

  it("should return error if getPaginated fails", async () => {
    db.query.mockRejectedValueOnce(new Error("Pagination failed"));
    const callback = jest.fn();
    await Holiday.getPaginated(1, 5, callback);
    expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
  });

  it("should return error if create fails", async () => {
    db.query.mockRejectedValueOnce(new Error("Insert error"));
    const callback = jest.fn();
    await Holiday.create(sampleData[0], callback);
    expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
  });

  it("should return error if update fails", async () => {
    db.query.mockRejectedValueOnce(new Error("Update error"));
    const callback = jest.fn();
    await Holiday.update(1, sampleData[0], callback);
    expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
  });

  it("should return error if delete fails", async () => {
    db.query.mockRejectedValueOnce(new Error("Delete error"));
    const callback = jest.fn();
    await Holiday.delete(1, callback);
    expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
  });

  it("should return error if replaceAll fails", async () => {
    db.query.mockRejectedValueOnce(new Error("Replace failed"));
    const callback = jest.fn();
    await Holiday.replaceAll(sampleData, callback);
    expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
  });

  it("should return error if appendOrUpdate fails", async () => {
    db.query.mockRejectedValueOnce(new Error("Append error"));
    const callback = jest.fn();
    await Holiday.appendOrUpdate(sampleData, callback);
    expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
  });

  it("should return error if countAll fails", async () => {
    db.query.mockRejectedValueOnce(new Error("Count error"));
    const callback = jest.fn();
    await Holiday.countAll(callback);
    expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
  });
});
