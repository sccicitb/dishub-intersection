const db = require('../app/config/db');
const mapsModel = require('../app/models/maps.model');

jest.mock('../app/config/db');

describe('Unit Test: maps.model.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBuildings', () => {
    it('should return list of buildings', async () => {
      const mockRows = [
        {
          id: 1,
          name: 'Simpang A',
          latitude: -7.7,
          longitude: 110.4,
          kategori: 'timur',
          camera_id: 2,
          camera_name: 'Cam A',
          socket_event: 'result_detection'
        }
      ];

      db.query.mockResolvedValue([mockRows]);

      const result = await mapsModel.getBuildings();
      expect(result).toEqual(mockRows);
      expect(db.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCameraById', () => {
    it('should return one camera row', async () => {
      const mockRow = [{ id: 1, name: 'Cam 1' }];
      db.query.mockResolvedValue([mockRow]);

      const result = await mapsModel.getCameraById(1);
      expect(result).toEqual(mockRow[0]);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM cameras WHERE id = ?', [1]);
    });
  });

  describe('deleteCameraById', () => {
    it('should delete camera and return affectedRows', async () => {
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await mapsModel.deleteCameraById(1);
      expect(result).toEqual(mockResult);
      expect(db.query).toHaveBeenCalledWith('DELETE FROM cameras WHERE id = ?', [1]);
    });
  });

  describe('createCamera', () => {
    it('should insert camera and return insertId', async () => {
      const mockResult = { insertId: 5 };
      const data = {
        title: 'Cam 5',
        category: 'timur',
        status: 1,
        latitude: -7.7,
        longitude: 110.4,
        socketEvent: 'result_detection_5'
      };

      db.query.mockResolvedValue([mockResult]);

      const result = await mapsModel.createCamera(data);
      expect(result).toBe(5);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO cameras'),
        ['Cam 5', 'timur', 1, -7.7, 110.4, 'result_detection_5']
      );
    });
  });

  describe('updateCamera', () => {
    it('should update camera and return affectedRows', async () => {
      const mockResult = { affectedRows: 1 };
      const data = {
        title: 'Cam Updated',
        category: 'barat',
        status: 0,
        latitude: -7.8,
        longitude: 110.5,
        socketEvent: 'result_detection_edited'
      };

      db.query.mockResolvedValue([mockResult]);

      const result = await mapsModel.updateCamera(3, data);
      expect(result).toEqual(mockResult);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE cameras'),
        ['Cam Updated', 'barat', 0, -7.8, 110.5, 'result_detection_edited', 3]
      );
    });
  });
});
