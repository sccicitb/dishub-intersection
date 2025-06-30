import { useState } from 'react';
import Image from 'next/image';

export default function VehicleDataTable () {
  const [tableData, setTableData] = useState([
    {
      fase: 2,
      kode: 'U',
      jarak: {
        lintasanBerangkat: {
          pendekat: {
            u: '', s: '', t: 15.5, b: ''
          },
          kecepatan: {
            berangkat: 10, datang: 10, pejalanKaki: ''
          },
          waktuTempuh: 1.62,
          wws: 0.57,
          wusDisarankan: 1,
          wk: 3,
          wAll: 4,
          wHijau: ''
        },
        panjangBerangkat: {
          pendekat: {
            u: '', s: '', t: 5, b: ''
          },
          kecepatan: {
            berangkat: '', datang: '', pejalanKaki: ''
          },
          waktuTempuh: '',
          wws: '',
          wusDisarankan: '',
          wk: '',
          wAll: '',
          wHijau: ''
        },
        lintasanDatang: {
          pendekat: {
            u: '', s: '', t: '', b: ''
          },
          kecepatan: {
            berangkat: '', datang: '', pejalanKaki: ''
          },
          waktuTempuh: '',
          wws: '',
          wusDisarankan: '',
          wk: '',
          wAll: '',
          wHijau: ''
        },
        lintasanPejalan: {
          pendekat: {
            u: '', s: '', t: '', b: ''
          },
          kecepatan: {
            berangkat: '', datang: '', pejalanKaki: ''
          },
          waktuTempuh: '',
          wws: '',
          wusDisarankan: '',
          wk: '',
          wAll: '',
          wHijau: ''
        }
      }
    },
    {
      fase: 1,
      kode: 'S',
      jarak: {
        lintasanBerangkat: {
          pendekat: {
            u: '', s: 15.5, t: '', b: ''
          },
          kecepatan: {
            berangkat: 10, datang: 10, pejalanKaki: ''
          },
          waktuTempuh: 1.6,
          wws: 0.45,
          wusDisarankan: 1,
          wk: 3,
          wAll: 4,
          wHijau: ''
        },
        panjangBerangkat: {
          pendekat: {
            u: '', s: 5, t: '', b: ''
          },
          kecepatan: {
            berangkat: '', datang: '', pejalanKaki: ''
          },
          waktuTempuh: '',
          wws: '',
          wusDisarankan: '',
          wk: '',
          wAll: '',
          wHijau: ''
        },
        lintasanDatang: {
          pendekat: {
            u: '', s: 16, t: '', b: ''
          },
          kecepatan: {
            berangkat: '', datang: '', pejalanKaki: ''
          },
          waktuTempuh: '',
          wws: '',
          wusDisarankan: '',
          wk: '',
          wAll: '',
          wHijau: ''
        },
        lintasanPejalan: {
          pendekat: {
            u: '', s: '', t: '', b: ''
          },
          kecepatan: {
            berangkat: '', datang: '', pejalanKaki: ''
          },
          waktuTempuh: '',
          wws: '',
          wusDisarankan: '',
          wk: '',
          wAll: '',
          wHijau: ''
        }
      }
    }
  ]);

  const handleInputChange = (rowIndex, jarakType, field, subField, value) => {
    const newData = [...tableData];
    if (subField) {
      newData[rowIndex].jarak[jarakType][field][subField] = value;
    } else {
      newData[rowIndex].jarak[jarakType][field] = value;
    }
    setTableData(newData);
  };

  const handleKodeChange = (rowIndex, value) => {
    const newData = [...tableData];
    newData[rowIndex].kode = value;
    setTableData(newData);
  };

  const jarakTypes = [
    { key: 'lintasanBerangkat', label: 'Lintasan Kendaraan Berangkat, L', sub: 'bkr' },
    { key: 'panjangBerangkat', label: 'Panjang Kendaraan Berangkat, P', sub: 'bkr' },
    { key: 'lintasanDatang', label: 'Lintasan Kendaraan Datang, L', sub: 'dkt' },
    { key: 'lintasanPejalan', label: 'Lintasan Pejalan Kaki, L', sub: 'pk' }
  ];

  return (
    <div className="p-6 bg-base-100 min-h-screen">
      <div className="mb-6">
        <h2 className="text-[20px] text-base-content mb-2">
          Tabel Data Kendaraan
        </h2>
        <p className="text-sm text-base-content/70">
          Input data kendaraan berdasarkan fase, kode pendekat, dan parameter lainnya
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-xs w-full border border-base-300">
          <thead>
            <tr className="bg-gray-300">
              <th rowSpan="3" className="text-center border border-base-300 min-w-10 font-semibold">
                Fase
              </th>
              <th rowSpan="3" className="text-center border border-base-300 min-w-5 font-semibold">
                Kode <br /> Pendekat
              </th>
              <th rowSpan="3" className="text-center border border-base-300 min-w-14 font-semibold">
                Jarak
              </th>
              <th colSpan="4" className="text-center border border-base-300 font-semibold">
                Kode Pendekat
              </th>
              <th colSpan="3" className="text-center border border-base-300 font-semibold">
                Kecepatan (m/detik)
              </th>
              <th rowSpan="2" className="text-center border border-base-300 min-w-10 font-semibold">
                Waktu <br />Tempuh
              </th>
              <th rowSpan="2" className="text-center border border-base-300 min-w-10 font-semibold">
                W<sub>MS</sub>
              </th>
              <th rowSpan="2" className="text-center border border-base-300 min-w-10 font-semibold">
                W<sub>MS</sub> <br /> Disesuaikan
              </th>
              <th rowSpan="2" className="text-center border border-base-300 min-w-10 font-semibold">
                W<sub>K</sub>
              </th>
              <th rowSpan="2" className="text-center border border-base-300 min-w-10 font-semibold">
                W<sub>AH</sub>
              </th>
              <th rowSpan="2" className="text-center border border-base-300 min-w-10 font-semibold">
                W<sub>HH</sub>
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th className="text-center border border-base-300 min-w-10 font-semibold">U</th>
              <th className="text-center border border-base-300 min-w-10 font-semibold">S</th>
              <th className="text-center border border-base-300 min-w-10 font-semibold">T</th>
              <th className="text-center border border-base-300 min-w-10 font-semibold">B</th>
              <th className="text-center border border-base-300 min-w-10 font-semibold">
                Berangkat
              </th>
              <th className="text-center border border-base-300 min-w-10 font-semibold">
                Datang
              </th>
              <th className="text-center border border-base-300 min-w-10 font-semibold">
                Pejalan Kaki
              </th>
            </tr>
            <tr className="bg-gray-300 text-xs">
              <th className="text-center border border-base-300 font-semibold">(m)</th>
              <th className="text-center border border-base-300 font-semibold">(detik)</th>
              <th className="text-center border border-base-300 font-semibold">(detik)</th>
              <th className="text-center border border-base-300 font-semibold">(detik)</th>
              <th className="text-center border border-base-300 font-semibold">(detik)</th>
              <th className="text-center border border-base-300 font-semibold">
                V<sub>bkr</sub>
              </th>
              <th className="text-center border border-base-300 font-semibold">
                V<sub>dkt</sub>
              </th>
              <th className="text-center border border-base-300 font-semibold">
                V<sub>pk</sub>
              </th>
              <th className="text-center border border-base-300 font-semibold">(detik)</th>
              <th className="text-center border border-base-300 font-semibold">(detik)</th>
              <th className="text-center border border-base-300 font-semibold">(detik)</th>
              <th className="text-center border border-base-300 font-semibold">(detik)</th>
              <th className="text-center border border-base-300 font-semibold">(detik/siklus)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              jarakTypes.map((jarakType, jarakIndex) => (
                <tr key={`${rowIndex}-${jarakIndex}`} className="hover:bg-base-200">
                  {jarakIndex === 0 && (
                    <td rowSpan="4" className="text-center border border-base-300 font-semibold align-middle">
                      {row.fase}
                    </td>
                  )}
                  {jarakIndex === 0 && (
                    <td rowSpan="4" className="text-center border border-base-300 p-0">
                      <div className="flex h-full min-h-[16rem]">
                        <input
                          type="text"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                          value={row.kode}
                          onChange={(e) => handleKodeChange(rowIndex, e.target.value)}
                        />
                      </div>
                    </td>
                  )}
                  <td className="border border-base-300">
                    <div className="text-xs text-base-content/70">
                      {jarakType.label}<sub>{jarakType.sub}</sub>
                    </div>
                  </td>
                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="0.1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                        value={row.jarak[jarakType.key].pendekat.u}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'pendekat', 'u', e.target.value)
                        }
                      />
                    </div>
                  </td>
                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="0.1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                        value={row.jarak[jarakType.key].pendekat.s}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'pendekat', 's', e.target.value)
                        }
                      />
                    </div>
                  </td>
                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="0.1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                        value={row.jarak[jarakType.key].pendekat.t}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'pendekat', 't', e.target.value)
                        }
                      />
                    </div>

                  </td>
                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="0.1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                        value={row.jarak[jarakType.key].pendekat.b}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'pendekat', 'b', e.target.value)
                        }
                      />
                    </div>

                  </td>
                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="0.1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                        value={row.jarak[jarakType.key].kecepatan.berangkat}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'kecepatan', 'berangkat', e.target.value)
                        }
                      />
                    </div>

                  </td>
                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="0.1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                        value={row.jarak[jarakType.key].kecepatan.datang}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'kecepatan', 'datang', e.target.value)
                        }
                      />
                    </div>
                  </td>
                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="0.1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                        value={row.jarak[jarakType.key].kecepatan.pejalanKaki}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'kecepatan', 'pejalanKaki', e.target.value)
                        }
                      />
                    </div>

                  </td>
                  <td className="text-center border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="0.01"
                        className="focus:outline-none appearance-none flex-1 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-10 font-semibold border-0 focus:ring-0 text-center"
                        value={row.jarak[jarakType.key].waktuTempuh}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'waktuTempuh', null, e.target.value)
                        }
                      />
                    </div>
                  </td>

                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="0.01"
                        className="focus:outline-none appearance-none flex-1 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-10 font-semibold border-0 focus:ring-0 text-center"
                        value={row.jarak[jarakType.key].wws}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'wws', null, e.target.value)
                        }
                      />
                    </div>
                  </td>

                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="1"
                        className="focus:outline-none appearance-none flex-1 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-10 font-semibold border-0 focus:ring-0 text-center"
                        value={row.jarak[jarakType.key].wusDisarankan}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'wusDisarankan', null, e.target.value)
                        }
                      />
                    </div>
                  </td>

                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="1"
                        className="focus:outline-none appearance-none flex-1 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-10 font-semibold border-0 focus:ring-0 text-center"
                        value={row.jarak[jarakType.key].wk}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'wk', null, e.target.value)
                        }
                      />
                    </div>
                  </td>

                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="1"
                        className="focus:outline-none appearance-none flex-1 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-10 font-semibold border-0 focus:ring-0 text-center"
                        value={row.jarak[jarakType.key].wAll}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'wAll', null, e.target.value)
                        }
                      />
                    </div>
                  </td>

                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="1"
                        className="focus:outline-none appearance-none flex-1 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-10 font-semibold border-0 focus:ring-0 text-center"
                        value={row.jarak[jarakType.key].wHijau}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'wHijau', null, e.target.value)
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))
            ))}
            <tr>
              <td colSpan={8} className='text-xs text-gray-600 align-text-top border-1 border-gray-100'>
                <strong>Catatan:</strong><br /> Dari fase 3 ke 4 tidak memerlukan WMS karena arus dari barat tetap berjalan
              </td>
              <td colSpan={3} className='text-xs text-gray-600 align-text-top'>
                <table>
                  <tbody>
                    <tr>
                      <td>V<sub>KDT</sub></td>
                      <td className='text-nowrap'>= m/det (Kendaraan Bermotor)</td>
                    </tr>
                    <tr>
                      <td className='align-text-top'>V<sub>KBR</sub></td>
                      <td className='text-nowrap'>
                        <ul>
                          <li>= 10 m/det (Kendaraan Bermotor)</li>
                          <li>= 3 m/det (Kendaraan tidak bermotor misalnya sepeda)</li>
                          <li>= 1,2 m/det (pejalan kaki)</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td className='align-text-top'>V<sub>KBR</sub></td>
                      <td className='text-nowrap'>
                        <ul>
                          <li>= 5 m/det (MP atau KS)</li>
                          <li>= 2 m/det (SM atau KTB)</li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td colSpan={5} className='border-1 border-gray-100'>
                <Image
                  src="/image/Picture1.png"
                  alt=""
                  width={300}
                  height={200}
                  className='m-auto'
                /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            const newRow = {
              fase: tableData.length + 1,
              kode: '',
              jarak: {
                lintasanBerangkat: {
                  pendekat: { u: '', s: '', t: '', b: '' },
                  kecepatan: { berangkat: '', datang: '', pejalanKaki: '' },
                  waktuTempuh: '', wws: '', wusDisarankan: '', wk: '', wAll: '', wHijau: ''
                },
                panjangBerangkat: {
                  pendekat: { u: '', s: '', t: '', b: '' },
                  kecepatan: { berangkat: '', datang: '', pejalanKaki: '' },
                  waktuTempuh: '', wws: '', wusDisarankan: '', wk: '', wAll: '', wHijau: ''
                },
                lintasanDatang: {
                  pendekat: { u: '', s: '', t: '', b: '' },
                  kecepatan: { berangkat: '', datang: '', pejalanKaki: '' },
                  waktuTempuh: '', wws: '', wusDisarankan: '', wk: '', wAll: '', wHijau: ''
                },
                lintasanPejalan: {
                  pendekat: { u: '', s: '', t: '', b: '' },
                  kecepatan: { berangkat: '', datang: '', pejalanKaki: '' },
                  waktuTempuh: '', wws: '', wusDisarankan: '', wk: '', wAll: '', wHijau: ''
                }
              }
            };
            setTableData([...tableData, newRow]);
          }}
        >
          Tambah Baris
        </button>

        <button
          className="btn btn-sm btn-success"
          onClick={() => {
            console.log('Data saved:', tableData);
            alert('Data berhasil disimpan! (Lihat console untuk detail)');
          }}
        >
          Simpan Data
        </button>

        <button
          className="btn btn-sm btn-warning"
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin menghapus semua data?')) {
              setTableData([]);
            }
          }}
        >
          Reset Tabel
        </button>
      </div>

      {/* <div className="mt-6 p-4 bg-base-200 rounded-lg">
        <h3 className="font-semibold mb-2">Keterangan:</h3>
        <div className="text-sm space-y-1">
          <p>• L<sub>bkr</sub>: Lintasan Kendaraan Berangkat</p>
          <p>• P<sub>bkr</sub>: Panjang Kendaraan Berangkat</p>
          <p>• L<sub>dkt</sub>: Lintasan Kendaraan Datang</p>
          <p>• L<sub>pk</sub>: Lintasan Pejalan Kaki</p>
          <p>• V<sub>bkr</sub>: Kecepatan Berangkat</p>
          <p>• V<sub>dkt</sub>: Kecepatan Datang</p>
          <p>• V<sub>pk</sub>: Kecepatan Pejalan Kaki</p>
        </div>
      </div> */}
    </div>
  );
}