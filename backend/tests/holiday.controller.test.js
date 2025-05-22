const httpMocks = require("node-mocks-http");
const path = require("path");

// ✅ Mock seluruh dependency
jest.mock("../app/models/holiday.model", () => ({
  replaceAll: jest.fn(),
  appendOrUpdate: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getPaginated: jest.fn(),
}));

jest.mock("../app/helpers/holidayParser", () => ({
  parseHolidayFile: jest.fn(),
}));

const Holiday = require("../app/models/holiday.model");
const { parseHolidayFile } = require("../app/helpers/holidayParser");
const HolidayController = require("../app/controllers/holiday.controller");

describe("HolidayController.importData", () => {
  const sampleData = [
    { date: "2025-01-01", event_type: "Libur Nasional", description: "Tahun Baru" },
    { date: "2025-04-02", event_type: "Cuti Bersama", description: "Idul Fitri" }
  ];

  const mockFile = {
    path: "/tmp/mockfile.json",
    originalname: "mockfile.json"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if no file is uploaded", async () => {
    const req = httpMocks.createRequest({ method: "POST", body: {} });
    const res = httpMocks.createResponse();

    await HolidayController.importData(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toMatchObject({ status: "error", message: "No file uploaded." });
  });

  it("should call replaceAll when mode is replace", async () => {
    parseHolidayFile.mockResolvedValue(sampleData);
    Holiday.replaceAll.mockImplementation((data, cb) => cb(null, { replaced: data.length }));

    const req = httpMocks.createRequest({
      method: "POST",
      body: { mode: "replace" },
      file: mockFile,
    });
    const res = httpMocks.createResponse();

    await HolidayController.importData(req, res);

    expect(parseHolidayFile).toHaveBeenCalledWith(mockFile.path, ".json");
    expect(Holiday.replaceAll).toHaveBeenCalledWith(sampleData, expect.any(Function));
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toMatchObject({ status: "ok", mode: "replace", replaced: 2 });
  });

  it("should call appendOrUpdate when mode is append", async () => {
    parseHolidayFile.mockResolvedValue(sampleData);
    Holiday.appendOrUpdate.mockImplementation((data, cb) => cb(null, { processed: data.length }));

    const req = httpMocks.createRequest({
      method: "POST",
      body: { mode: "append" },
      file: mockFile,
    });
    const res = httpMocks.createResponse();

    await HolidayController.importData(req, res);

    expect(parseHolidayFile).toHaveBeenCalledWith(mockFile.path, ".json");
    expect(Holiday.appendOrUpdate).toHaveBeenCalledWith(sampleData, expect.any(Function));
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toMatchObject({ status: "ok", mode: "append", processed: 2 });
  });

  it("should return 500 if parseHolidayFile throws an error", async () => {
    parseHolidayFile.mockRejectedValue(new Error("Parse error"));

    const req = httpMocks.createRequest({
      method: "POST",
      body: { mode: "append" },
      file: mockFile,
    });
    const res = httpMocks.createResponse();

    await HolidayController.importData(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toMatchObject({ status: "error", message: "Parse error" });
  });
});

describe("HolidayController CRUD", () => {
  const sampleData = {
    date: "2025-05-01",
    event_type: "Libur Nasional",
    description: "Hari Buruh"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new holiday", async () => {
    Holiday.create.mockImplementation((data, cb) => cb(null, { id: 1, ...data }));

    const req = httpMocks.createRequest({
      method: "POST",
      body: sampleData
    });
    const res = httpMocks.createResponse();

    await HolidayController.create(req, res);

    expect(Holiday.create).toHaveBeenCalledWith(sampleData, expect.any(Function));
    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toMatchObject({ status: "ok", data: { id: 1, ...sampleData } });
  });

  it("should update a holiday", async () => {
    Holiday.update.mockImplementation((id, data, cb) => cb(null, { affectedRows: 1 }));

    const req = httpMocks.createRequest({
      method: "PUT",
      params: { id: 2 },
      body: { ...sampleData, description: "Updated Hari Buruh" }
    });
    const res = httpMocks.createResponse();

    await HolidayController.update(req, res);

    expect(Holiday.update).toHaveBeenCalledWith(2, expect.any(Object), expect.any(Function));
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toMatchObject({ status: "ok" });
  });

  it("should delete a holiday", async () => {
    Holiday.delete.mockImplementation((id, cb) => cb(null, { affectedRows: 1 }));

    const req = httpMocks.createRequest({
      method: "DELETE",
      params: { id: 3 }
    });
    const res = httpMocks.createResponse();

    await HolidayController.remove(req, res);

    expect(Holiday.delete).toHaveBeenCalledWith(3, expect.any(Function));
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toMatchObject({ status: "ok" });
  });

  it("should get paginated holidays (default limit)", async () => {
    Holiday.getPaginated.mockImplementation((page, limit, cb) => cb(null, [sampleData]));

    const req = httpMocks.createRequest({
      method: "GET",
      query: {}
    });
    const res = httpMocks.createResponse();

    await HolidayController.getPaginated(req, res);

    expect(Holiday.getPaginated).toHaveBeenCalledWith(1, 5, expect.any(Function));
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toMatchObject({ status: "ok", data: [sampleData] });
  });

  it("should get paginated holidays with custom page/limit", async () => {
    Holiday.getPaginated.mockImplementation((page, limit, cb) => cb(null, [sampleData]));

    const req = httpMocks.createRequest({
      method: "GET",
      query: { page: "2", limit: "10" }
    });
    const res = httpMocks.createResponse();

    await HolidayController.getPaginated(req, res);

    expect(Holiday.getPaginated).toHaveBeenCalledWith(2, 10, expect.any(Function));
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toMatchObject({ status: "ok", data: [sampleData] });
  });
});
