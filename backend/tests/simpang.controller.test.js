const httpMocks = require('node-mocks-http');
const simpangController = require('../app/controllers/simpang.controller');
const simpangModel = require('../app/models/simpang.model');
jest.mock('../app/models/simpang.model');

describe('simpang.controller.js', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAllSimpang returns simpang array', async () => {
    const mockSimpang = [{ id: 1, Nama_Simpang: 'Simpang A' }];
    simpangModel.getAllSimpang.mockResolvedValue(mockSimpang);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    await simpangController.getAllSimpang(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().simpang).toEqual(mockSimpang);
  });

  it('getSimpangById returns simpang', async () => {
    const simpang = { id: 1, Nama_Simpang: 'Simpang A' };
    simpangModel.getSimpangById.mockResolvedValue(simpang);

    const req = httpMocks.createRequest({ params: { id: 1 } });
    const res = httpMocks.createResponse();
    await simpangController.getSimpangById(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(simpang);
  });

  it('createSimpang returns created simpang', async () => {
    simpangModel.createSimpang.mockResolvedValue(2);
    simpangModel.getSimpangById.mockResolvedValue({ id: 2, Nama_Simpang: 'Simpang B' });

    const req = httpMocks.createRequest({
      body: {
        name: 'Simpang B',
        latitude: -6.91,
        longitude: 107.61,
        kategori: 'utama',
        kota: 'Bandung',
        ukuran_kota: 'besar',
        tanggal: '2025-05-29',
        periode: '2025Q2',
        ditangani_oleh: 'DISHUB'
      }
    });
    const res = httpMocks.createResponse();
    await simpangController.createSimpang(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toHaveProperty('id', 2);
  });

  it('createSimpang returns 400 if field missing', async () => {
    const req = httpMocks.createRequest({ body: {} });
    const res = httpMocks.createResponse();
    await simpangController.createSimpang(req, res);

    expect(res.statusCode).toBe(400);
  });

  it('updateSimpang returns updated simpang', async () => {
    simpangModel.updateSimpang.mockResolvedValue({ affectedRows: 1 });
    simpangModel.getSimpangById.mockResolvedValue({ id: 1, Nama_Simpang: 'Simpang Updated' });

    const req = httpMocks.createRequest({
      params: { id: 1 },
      body: {
        name: 'Simpang Updated',
        latitude: -6.91,
        longitude: 107.61,
        kategori: 'utama',
        kota: 'Bandung',
        ukuran_kota: 'besar',
        tanggal: '2025-05-29',
        periode: '2025Q2',
        ditangani_oleh: 'DISHUB'
      }
    });
    const res = httpMocks.createResponse();
    await simpangController.updateSimpang(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toHaveProperty('Nama_Simpang', 'Simpang Updated');
  });

  it('updateSimpang returns 404 if simpang not found', async () => {
    simpangModel.updateSimpang.mockResolvedValue({ affectedRows: 0 });

    const req = httpMocks.createRequest({
      params: { id: 999 },
      body: {
        name: 'Invalid',
        latitude: 0,
        longitude: 0,
        kategori: 'utama',
        kota: 'Bandung',
        ukuran_kota: 'kecil',
        tanggal: '2025-05-29',
        periode: '2025Q2',
        ditangani_oleh: 'DISHUB'
      }
    });
    const res = httpMocks.createResponse();
    await simpangController.updateSimpang(req, res);

    expect(res.statusCode).toBe(404);
  });

  it('deleteSimpangById returns 200 if deleted', async () => {
    simpangModel.deleteSimpangById.mockResolvedValue({ affectedRows: 1 });

    const req = httpMocks.createRequest({ params: { id: 2 } });
    const res = httpMocks.createResponse();
    await simpangController.deleteSimpangById(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().message).toMatch(/deleted/);
  });

  it('getCamerasBySimpangId returns camera array', async () => {
    const cameras = [{ id: 5, name: 'Kamera A', ID_Simpang: 2 }];
    simpangModel.getCamerasBySimpangId.mockResolvedValue(cameras);

    const req = httpMocks.createRequest({ params: { id: 2 } });
    const res = httpMocks.createResponse();
    await simpangController.getCamerasBySimpangId(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().cameras).toEqual(cameras);
  });
});
