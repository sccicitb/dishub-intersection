"use client";

import { useState, useEffect } from 'react';


export default function FaseLapanganTable () {
  const [tableData, setTableData] = useState({
    lokasi: "",
    data: [
      {
        kodePendekat: "",
        tipeLingkunganJalan: "",
        kelasHambatanSamping: "",
        median: "",
        kelandaianPendekat: "",
        bkjt: "",
        jarakKeKendaraanParkir: "",
        lebarPendekat: {
          awalLajur: "",
          garisHenti: "",
          lajurBki: "",
          lajurKeluar: ""
        }
      }
    ]
  });

  const updateData = (rowIndex, field, value) => {
    setTableData(prev => {
      const newData = [...prev.data];
      const row = { ...newData[rowIndex] };

      if (field.includes('.')) {
        const [parentField, childField] = field.split('.');
        row[parentField] = { ...row[parentField], [childField]: value };
      } else {
        row[field] = value;
      }

      newData[rowIndex] = row;
      return { ...prev, data: newData };
    });
  };


  // useEffect(() => {
  //   import("@/data/DataLokasiLapangan.json").then((data) => setTableData(data.default))
  // }, [])

  // const updateData = (rowIndex, field, value) => {
  //   const newRows = [...tableData.data]; // shallow copy array
  //   const row = { ...newRows[rowIndex] }; // copy baris
  //   if (field.includes('.')) {
  //     const [parentField, childField] = field.split('.');
  //     row[parentField] = { ...row[parentField], [childField]: value }; // copy nested object
  //   } else {
  //     row[field] = value;
  //   }
  //   newRows[rowIndex] = row;
  //   setTableData({ ...tableData, data: newRows });
  // };


  // Fungsi untuk mengupdate lokasi
  const updateLokasi = (value) => {
    const newData = { ...tableData };
    newData.lokasi = value;
    setTableData(newData);
  };

  // Enhanced form input component
  const FormInput = ({
    label,
    value,
    onChange,
    type = "text",
    options = null,
    placeholder = "",
    unit = "",
    required = false
  }) => {
    if (options) {
      return (
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            required={required}
          >
            <option value="">Pilih...</option>
            {options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
          {unit && <span className="text-gray-500 font-normal">({unit})</span>}
        </label>
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          required={required}
        />
      </div>
    );
  };

  const addNewRow = () => {
    const newRow = {
      kodePendekat: "",
      tipeLingkunganJalan: "",
      kelasHambatanSamping: "",
      median: "",
      kelandaianPendekat: "",
      bkjt: "",
      jarakKeKendaraanParkir: "",
      lebarPendekat: {
        awalLajur: "",
        garisHenti: "",
        lajurBki: "",
        lajurKeluar: ""
      }
    };
    setTableData({
      ...tableData,
      data: [...tableData.data, newRow]
    });
  };

  const removeRow = (index) => {
    if (tableData.data.length > 1) {
      const newData = tableData.data.filter((_, i) => i !== index);
      setTableData({ ...tableData, data: newData });
    }
  };

  // Komponen input yang dapat diedit
  const EditableCell = ({ value, onChange, options = null }) => {
    if (options) {
      return (
        <select
          value={value}
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
        type="text"
        value={value}
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
  // if (!tableData.data || tableData.data.length === 0) {
  //   return (
  //     <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading data...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-5">
      <div className="w-full mx-auto">
        <div className="px-6 py-4 border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Form Kondisi Lapangan
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Lengkapi data kondisi lapangan untuk setiap pendekat
          </p>
        </div>

        {/* Location Input */}
        <div className="px-6 py-4 ">
          <div className="max-w-md">
            <FormInput
              label="Lokasi Survey"
              value={tableData.lokasi}
              onChange={updateLokasi}
              placeholder="Masukkan lokasi survey"
              required={true}
            />
          </div>
        </div>

        {/* Form Cards */}
        <div className="p-6">
          <div className="space-y-6">
            {tableData.data.map((row, index) => (
              <div key={index} className="rounded-lg p-6 shadow-sm">
                {/* Card Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium text-gray-900">
                    Pendekat {index + 1}
                  </h3>
                  {tableData.data.length > 1 && (
                    <button
                      onClick={() => removeRow(index)}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Basic Information */}
                  <FormInput
                    label="Kode Pendekat"
                    value={row.kodePendekat}
                    onChange={(value) => updateData(index, 'kodePendekat', value)}
                    options={['U', 'S', 'T', 'B']}
                    required={true}
                  />

                  <FormInput
                    label="Tipe Lingkungan Jalan"
                    value={row.tipeLingkunganJalan}
                    onChange={(value) => updateData(index, 'tipeLingkunganJalan', value)}
                    options={['KOM', 'KIM', 'AT']}
                    required={true}
                  />

                  <FormInput
                    label="Kelas Hambatan Samping"
                    value={row.kelasHambatanSamping}
                    onChange={(value) => updateData(index, 'kelasHambatanSamping', value)}
                    options={['T', 'S', 'R']}
                    required={true}
                  />

                  <FormInput
                    label="Median"
                    value={row.median}
                    onChange={(value) => updateData(index, 'median', value)}
                    options={['Y', 'T']}
                    required={true}
                  />

                  <FormInput
                    label="Kelandaian Pendekat"
                    value={row.kelandaianPendekat}
                    onChange={(value) => updateData(index, 'kelandaianPendekat', value)}
                    type="text"
                    unit="%"
                    placeholder="0.0"
                  />

                  <FormInput
                    label="BKJT"
                    value={row.bkjt}
                    onChange={(value) => updateData(index, 'bkjt', value)}
                    options={['Y', 'T']}
                  />

                  <FormInput
                    label="Jarak ke Kendaraan Parkir"
                    value={row.jarakKeKendaraanParkir}
                    onChange={(value) => updateData(index, 'jarakKeKendaraanParkir', value)}
                    type="text"
                    unit="m"
                    placeholder="0.0"
                  />
                </div>

                {/* Lebar Pendekat Section */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Lebar Pendekat</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormInput
                      label="Awal Lajur"
                      value={row.lebarPendekat?.awalLajur}
                      onChange={(value) => updateData(index, 'lebarPendekat.awalLajur', value)}
                      type="text"
                      unit="m"
                      placeholder="0.0"
                    />

                    <FormInput
                      label="Garis Henti"
                      value={row.lebarPendekat?.garisHenti}
                      onChange={(value) => updateData(index, 'lebarPendekat.garisHenti', value)}
                      type="text"
                      unit="m"
                      placeholder="0.0"
                    />

                    <FormInput
                      label="Lajur BKI"
                      value={row.lebarPendekat?.lajurBki}
                      onChange={(value) => updateData(index, 'lebarPendekat.lajurBki', value)}
                      type="text"
                      unit="m"
                      placeholder="0.0"
                    />

                    <FormInput
                      label="Lajur Keluar"
                      value={row.lebarPendekat?.lajurKeluar}
                      onChange={(value) => updateData(index, 'lebarPendekat.lajurKeluar', value)}
                      type="text"
                      unit="m"
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Row Button */}
          <div className="mt-6 text-center">
            <button
              onClick={addNewRow}
              className="btn btn-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Pendekat
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-between items-center">
          {/* <div className="text-sm text-gray-600">
            <span className="font-medium">Lokasi:</span> {tableData.lokasi || 'Belum diisi'} |
            <span className="font-medium"> Total pendekat:</span> {tableData.data.length}
          </div> */}
          <button
            onClick={saveData}
            className="btn btn-sm btn-success text-white rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            Simpan Data
          </button>
        </div>
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