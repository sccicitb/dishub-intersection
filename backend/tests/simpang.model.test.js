const db = require('../app/config/db');
const simpangModel = require('../app/models/simpang.model');

jest.mock('../app/config/db');

describe('simpang.model.js', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAllSimpang returns list of simpang', async () => {
    const mockRows = [
      { id: 1, Nama_Simpang: 'Simpang A' }
    ];
    db.query.mockResolvedValue([mockRows]);
    const result = await simpangModel.getAllSimpang();
    expect(result).toEqual(mockRows);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM simpang'));
  });

  it('getSimpangById returns simpang by id', async () => {
    const mockRows = [{ id: 2, Nama_Simpang: 'Simpang B' }];
    db.query.mockResolvedValue([mockRows]);
    const result = await simpangModel.getSimpangById(2);
    expect(result).toEqual(mockRows[0]);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = ?'), [2]);
  });

  it('createSimpang inserts and returns insertId', async () => {
    const mockResult = { insertId: 11 };
    const data = {
      name: 'Simpang Baru',
      latitude: -6.9,
      longitude: 107.6,
      kategori: 'utama',
      kota: 'Bandung',
      ukuran_kota: 'besar',
      tanggal: '2025-05-29',
      periode: '2025Q2',
      ditangani_oleh: 'DISHUB'
    };
    db.query.mockResolvedValue([mockResult]);
    const result = await simpangModel.createSimpang(data);
    expect(result).toBe(11);
  });

  it('updateSimpang updates row and returns affectedRows', async () => {
    const mockResult = { affectedRows: 1 };
    db.query.mockResolvedValue([mockResult]);
    const data = {
      name: 'Simpang Update',
      latitude: -6.91,
      longitude: 107.61,
      kategori: 'sekunder',
      kota: 'Bandung',
      ukuran_kota: 'sedang',
      tanggal: '2025-06-01',
      periode: '2025Q2',
      ditangani_oleh: 'DISHUB'
    };
    const result = await simpangModel.updateSimpang(2, data);
    expect(result).toEqual(mockResult);
  });

  it('deleteSimpangById deletes simpang', async () => {
    const mockResult = { affectedRows: 1 };
    db.query.mockResolvedValue([mockResult]);
    const result = await simpangModel.deleteSimpangById(2);
    expect(result).toEqual(mockResult);
  });

  it('getCamerasBySimpangId returns cameras for simpang', async () => {
    const mockRows = [
      { id: 1, name: 'Cam 1', ID_Simpang: 2 }
    ];
    db.query.mockResolvedValue([mockRows]);
    const result = await simpangModel.getCamerasBySimpangId(2);
    expect(result).toEqual(mockRows);
  });
});
