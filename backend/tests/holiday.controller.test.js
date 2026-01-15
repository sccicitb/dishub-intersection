const httpMocks = require("node-mocks-http");
const Holiday = require("../app/models/holiday.model");
const HolidayController = require("../app/controllers/holiday.controller");

jest.mock("../app/models/holiday.model");
jest.mock("../app/helpers/holidayParser", () => ({
  parseHolidayFile: jest.fn()
}));

describe("HolidayController CRUD", () => {
  const sampleBody = {
    date: "2025-05-01",
    event_type: "Libur Nasional",
    description: "Hari Buruh"
  };

  const savedData = {
    id: 1,
    ...sampleBody
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Create
  it("should create a new holiday", async () => {
    Holiday.create.mockImplementation((data, cb) => cb(null, savedData));

    const req = httpMocks.createRequest({
      method: "POST",
      body: sampleBody
    });
    const res = httpMocks.createResponse();

    await HolidayController.create(req, res);

    expect(Holiday.create).toHaveBeenCalledWith(sampleBody, expect.any(Function));
    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toMatchObject({ status: "ok", data: savedData });
  });

  // Update
  it("should update a holiday", async () => {
    Holiday.update.mockImplementation((id, data, cb) => cb(null, { affectedRows: 1 }));

    const req = httpMocks.createRequest({
      method: "PUT",
      params: { id: 2 },
      body: { ...sampleBody, description: "Updated Hari Buruh" }
    });
    const res = httpMocks.createResponse();

    await HolidayController.update(req, res);

    expect(Holiday.update).toHaveBeenCalledWith(2, expect.any(Object), expect.any(Function));
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toMatchObject({ status: "ok" });
  });

  // Delete
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

  // Get Paginated - default
  it("should get paginated holidays (default limit) with total and id", async () => {
    const dbRow = {
      id: 1,
      date: "2025-05-01",
      event_type: "Libur Nasional",
      description: "Hari Buruh"
    };

    Holiday.getPaginated.mockImplementation((page, limit, cb) => cb(null, [dbRow]));
    Holiday.countAll.mockImplementation((cb) => cb(null, 24));

    const req = httpMocks.createRequest({ method: "GET", query: {} });
    const res = httpMocks.createResponse();

    await HolidayController.getPaginated(req, res);

    expect(Holiday.getPaginated).toHaveBeenCalledWith(1, 5, expect.any(Function));
    expect(Holiday.countAll).toHaveBeenCalled();

    const body = res._getJSONData();
    expect(body).toMatchObject({
      total: 24,
      page: 1,
      limit: 5,
      holidays: [
        {
          id: 1,
          tanggal: "1 Mei 2025",
          events: "Libur Nasional",
          keterangan: "Hari Buruh"
        }
      ]
    });
  });

  // Get Paginated - custom limit
  it("should get paginated holidays with custom page/limit", async () => {
    const dbRow = {
      id: 1,
      date: "2025-05-01",
      event_type: "Libur Nasional",
      description: "Hari Buruh"
    };

    Holiday.getPaginated.mockImplementation((page, limit, cb) => cb(null, [dbRow]));
    Holiday.countAll.mockImplementation((cb) => cb(null, 24));

    const req = httpMocks.createRequest({
      method: "GET",
      query: { page: "2", limit: "10" }
    });
    const res = httpMocks.createResponse();

    await HolidayController.getPaginated(req, res);

    expect(Holiday.getPaginated).toHaveBeenCalledWith(2, 10, expect.any(Function));
    expect(Holiday.countAll).toHaveBeenCalled();

    const body = res._getJSONData();
    expect(body).toMatchObject({
      total: 24,
      page: 2,
      limit: 10,
      holidays: [
        {
          id: 1,
          tanggal: "1 Mei 2025",
          events: "Libur Nasional",
          keterangan: "Hari Buruh"
        }
      ]
    });
  });

it("should return all holidays without pagination", async () => {
    const sampleRow = {
      id: 2,
      date: "2025-06-01",
      event_type: "Cuti Bersama",
      description: "Idul Fitri"
    };

    Holiday.getAll.mockImplementation(cb => cb(null, [sampleRow]));

    const req = httpMocks.createRequest({ method: "GET" });
    const res = httpMocks.createResponse();

    await HolidayController.getAll(req, res);

    expect(Holiday.getAll).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);

    const body = res._getJSONData();
    expect(body).toMatchObject({
      holidays: [
        {
          tanggal: "1 Juni 2025",
          events: "Cuti Bersama",
          keterangan: "Idul Fitri"
        }
      ]
    });
  });

  it("should return 500 if getAll fails", async () => {
    Holiday.getAll.mockImplementation(cb => cb(new Error("DB error"), null));

    const req = httpMocks.createRequest({ method: "GET" });
    const res = httpMocks.createResponse();

    await HolidayController.getAll(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toMatchObject({ status: "error", message: "DB error" });
  });

  it("should return 500 if getAll fails", async () => {
    Holiday.getAll.mockImplementation(cb => cb(new Error("DB error"), null));

    const req = httpMocks.createRequest({ method: "GET" });
    const res = httpMocks.createResponse();

    await HolidayController.getAll(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toMatchObject({ status: "error", message: "DB error" });
  });

  it("should return 500 if create fails", async () => {
    Holiday.create.mockImplementation((data, cb) => cb(new Error("Create error"), null));

    const req = httpMocks.createRequest({ method: "POST", body: sampleBody });
    const res = httpMocks.createResponse();

    await HolidayController.create(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toMatchObject({ status: "error", message: "Create error" });
  });

  it("should return 500 if update fails", async () => {
    Holiday.update.mockImplementation((id, data, cb) => cb(new Error("Update failed"), null));

    const req = httpMocks.createRequest({
      method: "PUT",
      params: { id: 1 },
      body: sampleBody
    });
    const res = httpMocks.createResponse();

    await HolidayController.update(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toMatchObject({ status: "error", message: "Update failed" });
  });

  it("should return 500 if delete fails", async () => {
    Holiday.delete.mockImplementation((id, cb) => cb(new Error("Delete error"), null));

    const req = httpMocks.createRequest({ method: "DELETE", params: { id: 1 } });
    const res = httpMocks.createResponse();

    await HolidayController.remove(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toMatchObject({ status: "error", message: "Delete error" });
  });

  it("should return 500 if getPaginated fails", async () => {
    Holiday.getPaginated.mockImplementation((page, limit, cb) => cb(new Error("Pagination error"), null));

    const req = httpMocks.createRequest({ method: "GET" });
    const res = httpMocks.createResponse();

    await HolidayController.getPaginated(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toMatchObject({ status: "error", message: "Pagination error" });
  });

  it("should return 500 if countAll fails", async () => {
    Holiday.getPaginated.mockImplementation((page, limit, cb) => cb(null, [sampleBody]));
    Holiday.countAll.mockImplementation(cb => cb(new Error("Count error"), null));

    const req = httpMocks.createRequest({ method: "GET" });
    const res = httpMocks.createResponse();

    await HolidayController.getPaginated(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toMatchObject({ status: "error", message: "Count error" });
  });

  it("should return 400 if no file is uploaded", async () => {
    const req = httpMocks.createRequest({ method: "POST", body: {}, file: undefined });
    const res = httpMocks.createResponse();

    await HolidayController.importData(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toMatchObject({ status: "error", message: "No file uploaded." });
  });

  it("should return 500 if parseHolidayFile throws error", async () => {
    const { parseHolidayFile } = require("../app/helpers/holidayParser");
    parseHolidayFile.mockRejectedValue(new Error("Parsing failed"));

    const req = httpMocks.createRequest({
      method: "POST",
      body: { mode: "append" },
      file: { path: "/tmp/mock.json", originalname: "mock.json" }
    });
    const res = httpMocks.createResponse();

    await HolidayController.importData(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toMatchObject({ status: "error", message: "Parsing failed" });
  });
});
