"use client"

import Image from 'next/image';
import { useState } from 'react';

export default function FormSAVTable () {
  const [tableData, setTableData] = useState({
    trata: 43.4,
    rkhrata: 0.775,
    qtotal: 4.749,
    qbkijt: 506,
    tingkat_polusi: 30,
    biaya_kemacetan: 1.5,
    data: [
      {
        kode: 'U',
        q: 1254,
        c: 1398,
        dj: 0.883,
        rh: 0.205,
        nq1: 2.4,
        nq2: 38.9,
        nq: 41,
        nqMax: 69,
        pa: 120,
        rqh: 0.920,
        nqh: 1135,
        tl: 51.4,
        tg: 3.8,
        t: 55.2,
        tundaanTotal: 68092
      },
      {
        kode: 'S',
        q: 1460,
        c: 1654,
        dj: 0.883,
        rh: 0.248,
        nq1: 2.4,
        nq2: 45.7,
        nq: 48,
        nqMax: 79,
        pa: 144,
        rqh: 0.910,
        nqh: 1329,
        tl: 47.6,
        tg: 3.9,
        t: 51.5,
        tundaanTotal: 75197
      },
      {
        kode: 'T',
        q: 733,
        c: 830,
        dj: 0.883,
        rh: 0.347,
        nq1: 2.4,
        nq2: 22.4,
        nq: 25,
        nqMax: 46,
        pa: 153,
        rqh: 0.944,
        nqh: 692,
        tl: 46.4,
        tg: 3.9,
        t: 50.4,
        tundaanTotal: 36911
      },
      {
        kode: 'B',
        q: 816,
        c: 1643,
        dj: 0.497,
        rh: 0.427,
        nq1: 0.0,
        nq2: 19.3,
        nq: 19,
        nqMax: 32,
        pa: 91,
        rqh: 0.645,
        nqh: 526,
        tl: 24.4,
        tg: 3.5,
        t: 27.9,
        tundaanTotal: 22744
      }
    ]
  });

  const handleInputChange = (rowIndex, field, value) => {
    setTableData(prevData => {
      const newData = [...prevData.data];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [field]: value
      };
      return {
        ...prevData,
        data: newData
      };
    });
  };

  const addRow = () => {
    const newRow = {
      kode: '',
      q: '',
      c: '',
      dj: '',
      rh: '',
      nq1: '',
      nq2: '',
      nq: '',
      nqMax: '',
      pa: '',
      rqh: '',
      nqh: '',
      tl: '',
      tg: '',
      t: '',
      tundaanTotal: ''
    };
    setTableData(prevData => ({
      ...prevData,
      data: [...prevData.data, newRow]
    }));
  };

  const deleteRow = (index) => {
    if (tableData.data.length > 1) {
      setTableData(prevData => ({
        ...prevData,
        data: prevData.data.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotals = () => {
    return tableData.data.reduce((totals, row) => {
      totals.q += parseFloat(row.q) || 0;
      totals.nq += parseFloat(row.nq) || 0;
      totals.nqh += parseFloat(row.nqh) || 0;
      totals.tundaanTotal += parseFloat(row.tundaanTotal) || 0;
      return totals;
    }, { q: 0, nq: 0, nqh: 0, tundaanTotal: 0 });
  };

  const totals = calculateTotals();

  return (
    <div>

      <div className="p-4 bg-base-100">
        {/* <div className="mb-6">
        <h2 className="text-2xl  text-base-content mb-2">
        FORM SA-V
        </h2>
        <p className="text-sm text-base-content/70">
        Formulir Analisis Kapasitas dan Tundaan Lalu Lintas
        </p>
        </div> */}

        <div className="overflow-x-auto">
          <table className="table table-xs w-full border border-gray-300">
            <thead>
              <tr className="border border-gray-300 bg-gray-200">
                <th rowSpan={4} className="text-center border border-gray-300 min-w-10 text-wrap">
                  Kode Pendekat
                </th>
                <th rowSpan="2" className="text-center border border-gray-300 min-w-10 text-wrap">
                  Arah lalu lintas
                </th>
                <th rowSpan="2" className="text-center border border-gray-300 min-w-10 text-wrap">
                  Kapasitas
                </th>
                <th rowSpan="2" className="text-center border border-gray-300 min-w-10 text-wrap">
                  Derajat Kejenuhan
                </th>
                <th rowSpan="2" className="text-center border border-gray-300 min-w-10 text-wrap">
                  Rasio Hijau
                </th>
                <th colSpan={4} rowSpan={2} className="text-center border border-gray-300 ">
                  Jumlah kendaraan Antri
                </th>
                <th rowSpan={2} className="text-center border border-gray-300 min-w-10 text-wrap">
                  Panjang Antrian
                </th>
                <th rowSpan={2} className="text-center border border-gray-300 ">
                  Rasio Kendaraan Terhenti
                </th>
                <th rowSpan={2} className="text-center border border-gray-300 min-w-10 text-wrap">
                  Jumlah Kendaraan Terhenti
                </th>
                <th colSpan={4} rowSpan={1} className="text-center border border-gray-300 ">
                  Tundaan
                </th>
              </tr>
              <tr className="border border-gray-300 text-xs bg-gray-200">

                <th className="text-center border border-gray-300 min-w-10 text-wrap">Tundaan lalu lintas rata-rata</th>
                <th className="text-center border border-gray-300 min-w-10 text-wrap">Tundaan geometri rata-rata</th>
                <th className="text-center border border-gray-300 min-w-10 text-wrap">Tundaan rata-rata</th>
                <th rowSpan={2} className="text-center border border-gray-300 min-w-10 text-wrap">Tundaan Total</th>
              </tr>
              <tr className="border border-gray-300 text-xs bg-gray-200">
                <th className="text-center border border-gray-300 ">q</th>
                <th className="text-center border border-gray-300 ">C</th>
                <th className="text-center border border-gray-300 ">D<sub>J</sub></th>
                <th className="text-center border border-gray-300 ">R<sub>H</sub></th>
                <th className="text-center border border-gray-300 min-w-10 text-wrap">N<sub>Q1</sub></th>
                <th className="text-center border border-gray-300 min-w-10 text-wrap">N<sub>Q2</sub></th>
                <th className="text-center border border-gray-300 min-w-10 text-wrap">N<sub>Q</sub></th>
                <th className="text-center border border-gray-300 min-w-10 text-wrap">N<sub>QMAX</sub></th>
                <th className="text-center border border-gray-300 ">P<sub>A</sub></th>
                <th className="text-center border border-gray-300 min-w-10 text-wrap">R<sub>KH</sub></th>
                <th className="text-center border border-gray-300 min-w-10 text-wrap">N<sub>QH</sub></th>
                <th className="text-center border border-gray-300 ">T<sub>L</sub></th>
                <th className="text-center border border-gray-300 ">T<sub>G</sub></th>
                <th className="text-center border border-gray-300 ">T</th>
              </tr>
              <tr className="border border-gray-300 text-xs bg-gray-200">
                <th className="text-center border border-gray-300">SMP/jam</th>
                <th className="text-center border border-gray-300">SMP/jam</th>
                <th className="text-center border border-gray-300">-</th>
                <th className="text-center border border-gray-300">-</th>
                <th className="text-center border border-gray-300">SMP</th>
                <th className="text-center border border-gray-300">SMP</th>
                <th className="text-center border border-gray-300 ">(6)+(7)</th>
                <th className="text-center border border-gray-300 ">Gambar SMP</th>
                <th className="text-center border border-gray-300">m</th>
                <th className="text-center border border-gray-300">-</th>
                <th className="text-center border border-gray-300">SMP</th>
                <th className="text-center border border-gray-300">detik</th>
                <th className="text-center border border-gray-300">detik</th>
                <th className="text-center border border-gray-300 ">(13)+(14)<br /> SMP.detik</th>
                <th className="text-center border border-gray-300 ">(2)x(15) <br /> SMP.detik</th>
              </tr>
              <tr className="border border-gray-300 text-xs bg-gray-200">
                <th className="text-center border border-gray-300">(1)</th>
                <th className="text-center border border-gray-300">(2)</th>
                <th className="text-center border border-gray-300">(3)</th>
                <th className="text-center border border-gray-300">(4)</th>
                <th className="text-center border border-gray-300">(5)</th>
                <th className="text-center border border-gray-300">(6)</th>
                <th className="text-center border border-gray-300">(7)</th>
                <th className="text-center border border-gray-300">(8)</th>
                <th className="text-center border border-gray-300">(9)</th>
                <th className="text-center border border-gray-300">(10)</th>
                <th className="text-center border border-gray-300">(11)</th>
                <th className="text-center border border-gray-300">(12)</th>
                <th className="text-center border border-gray-300">(13)</th>
                <th className="text-center border border-gray-300">(14)</th>
                <th className="text-center border border-gray-300">(15)</th>
                <th className="text-center border border-gray-300">(16)</th>
              </tr>
            </thead>
            <tbody>
              {tableData.data.map((row, index) => (
                <tr key={index} className="hover:bg-base-200">
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="text"
                        className="p-0 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center flex-1 "
                        value={row.kode}
                        onChange={(e) => handleInputChange(index, 'kode', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="0.01"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0" value={row.q}
                        onChange={(e) => handleInputChange(index, 'q', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="0.001"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                        value={row.c}
                        onChange={(e) => handleInputChange(index, 'c', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="0.0001"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0" value={row.dj}
                        onChange={(e) => handleInputChange(index, 'dj', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="0.001"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                        value={row.rh}
                        onChange={(e) => handleInputChange(index, 'rh', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="0.001"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                        value={row.nq1}
                        onChange={(e) => handleInputChange(index, 'nq1', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="0.001"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                        value={row.nq2}
                        onChange={(e) => handleInputChange(index, 'nq2', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                        value={row.nq}
                        onChange={(e) => handleInputChange(index, 'nq', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                        value={row.nqMax}
                        onChange={(e) => handleInputChange(index, 'nqMax', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                        value={row.pa}
                        onChange={(e) => handleInputChange(index, 'pa', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="0.01"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0" value={row.rqh}
                        onChange={(e) => handleInputChange(index, 'rqh', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                        value={row.nqh}
                        onChange={(e) => handleInputChange(index, 'nqh', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                        value={row.tl}
                        onChange={(e) => handleInputChange(index, 'tl', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                        value={row.tg}
                        onChange={(e) => handleInputChange(index, 'tg', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                        value={row.t}
                        onChange={(e) => handleInputChange(index, 't', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    <div className="flex h-full min-h-[2rem]">
                      <input
                        type="number"
                        step="1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                        value={row.tundaanTotal}
                        onChange={(e) => handleInputChange(index, 'tundaanTotal', e.target.value)}
                      />
                      {/* <button
                      className="btn btn-xs btn-error ml-2"
                      onClick={() => deleteRow(index)}
                      disabled={tableData.length <= 1}
                    >
                      ✕
                    </button> */}
                    </div>
                  </td>
                </tr>
              ))}

              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    . . .
                  </div>
                </td>
                {[...Array(15)].map((_, i) => (
                  <td className="border border-gray-300 p-0" key={i}>
                    <div className="flex h-full min-h-[2rem] items-center justify-center">
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    . . .
                  </div>
                </td>
                {[...Array(7)].map((_, i) => (
                  <td className="border border-gray-300 p-0" key={i}>
                    <div className="flex h-full min-h-[2rem] items-center justify-center">
                    </div>
                  </td>
                ))}
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    POL = 1%
                  </div>
                </td>
                {[...Array(7)].map((_, i) => (
                  <td className="border border-gray-300 p-0" key={i}>
                    <div className="flex h-full min-h-[2rem] items-center justify-center">
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    . . .
                  </div>
                </td>
                {[...Array(15)].map((_, i) => (
                  <td className="border border-gray-300 p-0" key={i}>
                    <div className="flex h-full min-h-[2rem] items-center justify-center">
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    BKiJT
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    506
                  </div>
                </td>
                {[...Array(10)].map((_, i) => (
                  <td className="border border-gray-300 p-0" key={i}>
                    <div className="flex h-full min-h-[2rem] items-center justify-center">
                    </div>
                  </td>
                ))}
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    0
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    6
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    6
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    3036
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    q<sub>total</sub>
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    1000
                  </div>
                </td>
                {[...Array(5)].map((_, i) => (
                  <td rowSpan={2} className="bg-gray-500 p-0" key={i}>
                    <div className="flex h-full min-h-[2rem] items-center justify-center">
                    </div>
                  </td>
                ))}
                <td className="border border-gray-300 p-0" colSpan={4}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    Total jumlah kendaraan terhenti =
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    0
                  </div>
                </td>
                <td className="border border-gray-300 p-0" colSpan={3}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    Total tundaan =
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    0
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    q<sub>dikoreksi</sub>
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    1000
                  </div>
                </td>
                <td className="border border-gray-300 p-0" colSpan={4}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    Rasio kendaraan terhenti rata-rata =
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    0
                  </div>
                </td>
                <td className="border border-gray-300 p-0" colSpan={3}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    Tundaan simpang rata-rata, detik/SMP =
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    0
                  </div>
                </td>
              </tr>
              <tr>
                <td rowSpan={3} colSpan={9} className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    <Image src={'/image/Picture3.png'} width={500} height={400} alt='' />
                  </div>
                </td>
                <td rowSpan={3} colSpan={3} className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    <Image src={'/image/Picture4.png'} width={200} height={300} alt='' />
                  </div>
                </td>
                <td rowSpan={3} colSpan={4} className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    <Image src={'/image/Picture5.png'} width={600} height={600} alt='' />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* <SketsaSimpangV data={tableData} /> */}
      <div className='w-full overflow-x-auto'>
        <div className="min-w-[900px] flex flex-col w-fit bg-[#bec1ce] mx-auto font-semibold text-sm text-gray-800">
          {/* North */}
          <div className="grid grid-cols-3">
            <div className='p-2 text-xl text-left flex flex-col justify-end'>B</div>
            <div className='min-h-64 items-center flex bg-stone-200 justify-center'>
              {tableData.data.filter(data => data.kode === "U").map((data, i) => (
                <div key={i}>
                  <div>T = {data.t} detik/SMP</div>
                  <div>R<sub>KH</sub> = {data.rqh}</div>
                  <div>P<sub>A</sub> = {data.pa} meter</div>
                  <div>D<sub>J</sub> = {data.dj}</div>
                  <div>C = {data.c} SMP/jam</div>
                  <div>q = {data.q} SMP/jam</div>
                </div>
              ))}
            </div>
            <div className='p-2 text-xl'>U</div>
          </div>

          {/* West - Center - East */}
          <div className="grid grid-cols-3">
            <div className='min-h-64 items-center flex bg-stone-200 justify-center'>
              {tableData.data.filter(data => data.kode === "B").map((data, i) => (
                <div key={i}>
                  <div>T = {data.t} detik/SMP</div>
                  <div>R<sub>KH</sub> = {data.rqh}</div>
                  <div>P<sub>A</sub> = {data.pa} meter</div>
                  <div>D<sub>J</sub> = {data.dj}</div>
                  <div>C = {data.c} SMP/jam</div>
                  <div>q = {data.q} SMP/jam</div>
                </div>
              ))}
            </div>
            <div className='min-h-64 items-center flex justify-center'>
              <div className="m-auto">
                <div className='text-white bg-red-500 p-1 text-xl mb-2 text-center w-fit mx-auto'>
                  LOS : E
                </div>
                <div>
                  <div>Total rata-rata = {tableData.trata} detik/SMP</div>
                  <div>R<sub>KH</sub> rata-rata = {tableData.rkhrata}</div>
                  <div>q<sub>total</sub> = {tableData.qtotal} meter</div>
                  <div>q<sub>bkijt</sub> = {tableData.qbkijt}</div>
                  <div>Tingkat polusi = {tableData.tingkat_polusi} SMP/jam</div>
                  <div>Biaya kemacetan = {tableData.biaya_kemacetan} SMP/jam</div>
                </div>
              </div>
            </div>
            <div className='min-h-64 items-center flex bg-stone-200 justify-center'>
              {tableData.data.filter(data => data.kode === "T").map((data, i) => (
                <div key={i}>
                  <div>T = {data.t} detik/SMP</div>
                  <div>R<sub>KH</sub> = {data.rqh}</div>
                  <div>P<sub>A</sub> = {data.pa} meter</div>
                  <div>D<sub>J</sub> = {data.dj}</div>
                  <div>C = {data.c} SMP/jam</div>
                  <div>q = {data.q} SMP/jam</div>
                </div>))}
            </div>
          </div>

          {/* South */}
          <div className="grid grid-cols-3">
            <div className='p-2 text-xl text-right'>S</div>
            <div className='min-h-64 items-center flex bg-stone-200 justify-center'>
              {tableData.data.filter(data => data.kode === "S").map((data, i) => (
                <div key={i}>
                  <div>T = {data.t} detik/SMP</div>
                  <div>R<sub>KH</sub> = {data.rqh}</div>
                  <div>P<sub>A</sub> = {data.pa} meter</div>
                  <div>D<sub>J</sub> = {data.dj}</div>
                  <div>C = {data.c} SMP/jam</div>
                  <div>q = {data.q} SMP/jam</div>
                </div>))}
            </div>
            <div className='p-2 text-xl text-right'>T</div>
          </div>
        </div>
      </div>
    </div>
  );
}