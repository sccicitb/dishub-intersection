// tests/classificationHelper.test.js
jest.mock('fs', () => ({
  readFileSync: jest.fn()
}));

const mockData = [
  { type: 'luar_kota', mainCode: 'SM', subCode: 'SM' },
  { type: 'luar_kota', mainCode: 'MP', subCode: 'MP' },
  { type: 'dalam_kota', mainCode: 'SM', subCode: 'SM' },
  { type: 'luar_kota', mainCode: 'TR', subCode: 'TR' },
  { type: 'luar_kota', mainCode: 'SM', subCode: 'SM' }
];

let helper;
let fs;

beforeEach(() => {
  jest.resetModules();
  fs = require('fs');
  fs.readFileSync.mockReturnValue(JSON.stringify(mockData));
  helper = require('../app/helpers/classificationHelper');
});

describe('classificationHelper', () => {
  test('getClassificationData returns parsed data', () => {
    const result = helper.getClassificationData();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(mockData.length);
    expect(result[0]).toHaveProperty('type', 'luar_kota');
  });

  test('getSubCodes returns correct subcodes for given type', () => {
    const codes = helper.getSubCodes('luar_kota');
    expect(codes).toEqual(['SM', 'MP', 'TR', 'SM']);
    expect(codes).not.toContain('XX');
  });

  test('getJenisKendaraan returns unique mainCode-subCode pairs', () => {
    const jenis = helper.getJenisKendaraan('luar_kota');
    expect(Array.isArray(jenis)).toBe(true);
    expect(jenis).toContainEqual({ mainCode: 'SM', subCode: 'SM' });
    expect(jenis).toContainEqual({ mainCode: 'MP', subCode: 'MP' });
    expect(jenis).toContainEqual({ mainCode: 'TR', subCode: 'TR' });
    const allStrings = jenis.map(j => `${j.mainCode}-${j.subCode}`);
    expect(new Set(allStrings).size).toBe(jenis.length);
  });

  test('getJenisKendaraan returns empty for type not found', () => {
    const jenis = helper.getJenisKendaraan('tidak_ada');
    expect(Array.isArray(jenis)).toBe(true);
    expect(jenis.length).toBe(0);
  });
});
