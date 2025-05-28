const db = require('../app/config/db');
const mapsModel = require('../app/models/maps.model');

jest.mock('../app/config/db');

describe('maps.model.js', () => {
  afterEach(() => jest.clearAllMocks());

  it('getBuildingsRaw returns array of buildings', async () => {
    const mockRows = [
      { id: 2, name: 'Simpang Prambanan', latitude: -7.75, longitude: 110.48, kategori: 'timur' }
    ];
    db.query.mockResolvedValue([mockRows]);

    const result = await mapsModel.getBuildingsRaw();
    expect(result).toEqual(mockRows);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM simpang'));
  });

  it('getAllCamerasRaw returns array of cameras', async () => {
    const mockRows = [
      { camera_id: 1, id: 'detection1', location_id: 2, title: 'Camera 1', socketEvent: 'result_detection_2' }
    ];
    db.query.mockResolvedValue([mockRows]);

    const result = await mapsModel.getAllCamerasRaw();
    expect(result).toEqual(mockRows);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM cameras'));
  });

  it('getBuildingsWithCameras returns buildings and cameras', async () => {
    const mockBuildings = [
      { id: 2, name: 'Simpang Prambanan', latitude: -7.75, longitude: 110.48, kategori: 'timur' }
    ];
    const mockCameras = [
      { camera_id: 1, location_id: 2, title: 'Camera 1', socketEvent: 'result_detection_2' }
    ];
    db.query
      .mockResolvedValueOnce([mockBuildings])
      .mockResolvedValueOnce([mockCameras]);

    const result = await mapsModel.getBuildingsWithCameras();
    expect(result).toEqual({ buildings: mockBuildings, cameras: mockCameras });
  });
});
