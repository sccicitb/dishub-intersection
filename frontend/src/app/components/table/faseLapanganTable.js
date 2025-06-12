"use client";

import { useState, useEffect } from 'react';


export default function FaseLapanganTable () {
  const [tableData, setTableData] = useState({
    lokasi: "",
    data: []
  });

  useEffect(() => {
    import("@/data/DataLokasiLapangan.json").then((data) => setTableData(data.default))
  }, [])
  const updateData = (rowIndex, field, value) => {
    const newRows = [...tableData.data]; // shallow copy array
    const row = { ...newRows[rowIndex] }; // copy baris
    if (field.includes('.')) {
      const [parentField, childField] = field.split('.');
      row[parentField] = { ...row[parentField], [childField]: value }; // copy nested object
    } else {
      row[field] = value;
    }
    newRows[rowIndex] = row;
    setTableData({ ...tableData, data: newRows });
  };


  // Fungsi untuk mengupdate lokasi
  const updateLokasi = (value) => {
    const newData = { ...tableData };
    newData.lokasi = value;
    setTableData(newData);
  };

  // Komponen input yang dapat diedit
  const EditableCell = ({ value, onChange, type = "text", options = null }) => {
    if (options) {
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full input input-xs text-xs border border-gray-300 rounded"
        >
          {options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={"text"}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full input input-xs text-xs border border-gray-300 rounded"
      />
    );
  };

  const saveData = () => {
    console.log('Data yang akan disimpan:', JSON.stringify(tableData, null, 2));
    alert('Data berhasil disimpan! Lihat console untuk melihat struktur JSON.');
  };

  // Add loading state check
  if (!tableData.data || tableData.data.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="w-full mx-auto">
        <h2 className="text-[14px] font-semibold mb-4 capitalize text-start">
          Kondisi Lapangan
        </h2>
        <div className="shadow-xs overflow-x-auto">
          <div className="overflow-x-auto">
            <table className="w-full table table-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th rowSpan={3} className="text-xs text-wrap text-center font-medium text-gray-700 uppercase border border-gray-300">
                    Kode Pendekat
                  </th>
                  <th rowSpan={3} className="text-xs text-wrap text-center font-medium text-gray-700 uppercase border border-gray-300">
                    Tipe Lingkungan Jalan
                  </th>
                  <th rowSpan={3} className="text-xs text-wrap text-center font-medium text-gray-700 uppercase border border-gray-300">
                    Kelas Hambatan Samping
                  </th>
                  <th rowSpan={3} className="text-xs text-wrap text-center font-medium text-gray-700 uppercase border border-gray-300">
                    Median
                  </th>
                  <th rowSpan={3} className="text-xs text-wrap text-center font-medium text-gray-700 uppercase border border-gray-300">
                    Kelandaian Pendekat
                  </th>
                  <th rowSpan={3} className="text-xs text-wrap text-center font-medium text-gray-700 uppercase border border-gray-300 px-5">
                    BKJT
                  </th>
                  <th rowSpan={3} className="text-xs text-wrap text-center font-medium text-gray-700 uppercase border border-gray-300">
                    Jarak ke Kendaraan Parkir
                  </th>
                  <th colSpan={4} className=" text-center text-xs text-wrap font-medium text-gray-700 uppercase border border-gray-300">
                    Lebar Pendekat
                  </th>
                </tr>
                <tr>
                  <th className="px-2 py-2 text-center text-xs text-wrap font-medium text-gray-700 uppercase border border-gray-300">
                    Awal Lajur
                  </th>
                  <th className="px-2 py-2 text-center text-xs text-wrap font-medium text-gray-700 uppercase border border-gray-300">
                    Garis Henti
                  </th>
                  <th className="px-2 py-2 text-center text-xs text-wrap font-medium text-gray-700 uppercase border border-gray-300">
                    Lajur Bki
                  </th>
                  <th className="px-2 py-2 text-center text-xs text-wrap font-medium text-gray-700 uppercase border border-gray-300">
                    Lajur Keluar
                  </th>
                </tr>
                <tr>
                  <th className="px-2 py-2 text-center text-xs text-wrap font-medium text-gray-600 border border-gray-300">m</th>
                  <th className="px-2 py-2 text-center text-xs text-wrap font-medium text border border-gray-300">m</th>
                  <th className="px-2 py-2 text-center text-xs text-wrap font-medium text border border-gray-300">m</th>
                  <th className="px-2 py-2 text-center text-xs text-wrap font-medium text border border-gray-300">m</th>
                </tr>
              </thead>
              <tbody className="">
                {tableData.data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-2 border-gray-300">
                      <EditableCell
                        value={row.kodePendekat}
                        onChange={(value) => updateData(index, 'kodePendekat', value)}
                        options={['U', 'S', 'T', 'B']}
                      />
                    </td>
                    <td className="px-2 border-gray-300">
                      <EditableCell
                        value={row.tipeLingkunganJalan}
                        onChange={(value) => updateData(index, 'tipeLingkunganJalan', value)}
                        options={['KOM', 'KIM', 'AT']}
                      />
                    </td>
                    <td className="px-2 border-gray-300">
                      <EditableCell
                        value={row.kelasHambatanSamping}
                        onChange={(value) => updateData(index, 'kelasHambatanSamping', value)}
                        options={['T', 'S', 'R']}
                      />
                    </td>
                    <td className="px-2 border-gray-300">
                      <EditableCell
                        value={row.median}
                        onChange={(value) => updateData(index, 'median', value)}
                        options={['Y', 'T']}
                      />
                    </td>
                    <td className="px-2 border-gray-300">
                      <EditableCell
                        value={row.kelandaianPendekat}
                        onChange={(value) => updateData(index, 'kelandaianPendekat', value)}
                      />
                    </td>
                    <td className="px-2 border-gray-300">
                      <EditableCell
                        value={row.bkjt}
                        onChange={(value) => updateData(index, 'bkjt', value)}
                        options={['Y', 'T']}
                      />
                    </td>
                    <td className="px-2 border-gray-300">
                      <EditableCell
                        value={row.jarakKeKendaraanParkir}
                        onChange={(value) => updateData(index, 'jarakKeKendaraanParkir', value)}
                      />
                    </td>
                    <td className="px-2 border-gray-300">
                      <EditableCell
                        value={row.lebarPendekat?.awalLajur}
                        onChange={(value) => updateData(index, 'lebarPendekat.awalLajur', value)}
                      />
                    </td>
                    <td className="px-2 border-gray-300">
                      <EditableCell
                        value={row.lebarPendekat?.garisHenti}
                        onChange={(value) => updateData(index, 'lebarPendekat.garisHenti', value)}
                      />
                    </td>
                    <td className="px-2 border-gray-300">
                      <EditableCell
                        value={row.lebarPendekat?.lajurBki}
                        onChange={(value) => updateData(index, 'lebarPendekat.lajurBki', value)}
                      />
                    </td>
                    <td className="">
                      <EditableCell
                        value={row.lebarPendekat?.lajurKeluar}
                        onChange={(value) => updateData(index, 'lebarPendekat.lajurKeluar', value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Lokasi: <span className="font-semibold">{tableData.lokasi}</span> | Total pendekat: {tableData.data.length}
              </div>
              <button
                onClick={saveData}
                className="btn btn-sm btn-success"
              >
                Simpan Data
              </button>
            </div>
          </div>
        </div>
        {/* 
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Struktur Data JSON Saat Ini:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            {JSON.stringify(tableData, null, 2)}
          </pre>
        </div> */}
      </div>
    </div>
  );
}