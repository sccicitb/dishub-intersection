"use client"

import Image from 'next/image';
import { useState } from 'react';

export default function FormSAVTable () {
  const [tableData, setTableData] = useState([
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
  ]);

  const handleInputChange = (rowIndex, field, value) => {
    const newData = [...tableData];
    newData[rowIndex][field] = value;
    setTableData(newData);
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
    setTableData([...tableData, newRow]);
  };

  const deleteRow = (index) => {
    if (tableData.length > 1) {
      const newData = tableData.filter((_, i) => i !== index);
      setTableData(newData);
    }
  };

  const calculateTotals = () => {
    return tableData.reduce((totals, row) => {
      totals.q += parseFloat(row.q) || 0;
      totals.nq += parseFloat(row.nq) || 0;
      totals.nqh += parseFloat(row.nqh) || 0;
      totals.tundaanTotal += parseFloat(row.tundaanTotal) || 0;
      return totals;
    }, { q: 0, nq: 0, nqh: 0, tundaanTotal: 0 });
  };

  const totals = calculateTotals();

  return (
    <div className="p-4 bg-base-100 h-fit">
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
            {tableData.map((row, index) => (
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
                  <Image src={'/image/Picture3.png'} width={500} height={400} alt=''/>
                </div>
              </td>
              <td rowSpan={3} colSpan={3} className="border border-gray-300 p-0">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  <Image src={'/image/Picture4.png'} width={200} height={300} alt=''/>
                </div>
              </td>
              <td rowSpan={3} colSpan={4} className="border border-gray-300 p-0">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  <Image src={'/image/Picture5.png'} width={600} height={600} alt=''/>
                </div>
              </td>
            </tr>
            {/* <tr className="border border-gray-300">
              <td className="text-center border border-gray-300">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  TOTAL
                </div>
              </td>
              <td className="text-center border border-gray-300">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  {totals.q.toFixed(0)}
                </div>
              </td>
              {[...Array(5)].map((_, i) => (
                <td className="text-center border border-gray-300" key={i}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    -
                  </div>
                </td>
              ))}
              <td className="text-center border border-gray-300">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  {totals.nq.toFixed(0)}
                </div>
              </td>
              <td className="text-center border border-gray-300">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  {totals.nqh.toFixed(0)}
                </div>
              </td>
              {[...Array(5)].map((_, i) => (
                <td className="text-center border border-gray-300" key={i}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                    -
                  </div>
                </td>
              ))}
              <td className="text-center border border-gray-300">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  {totals.tundaanTotal.toFixed(0)}
                </div>
              </td>
            </tr> */}
          </tbody>
        </table>
      </div>

      {/* <div className="mt-6 flex flex-wrap gap-4">
        <button
          className="btn b"
          onClick={addRow}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pendekat
        </button>

        <button
          className="btn btn-success"
          onClick={() => {
            console.log('Form SA-V Data:', tableData);
            alert('Data berhasil disimpan! (Lihat console untuk detail)');
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Simpan Data
        </button>

        <button
          className="btn btn-info"
          onClick={() => {
            const csvContent = "data:text/csv;charset=utf-8,"
              + "Kode,Arah Lalu Lintas,Kapasitas,Derajat Kejenuhan,Rasio Hijau,NQ1,NQ2,NQ,NQ Max,Panjang Antrian,RQH,NQH,Tundaan Lalu Lintas,Tundaan Geometri,Tundaan Total,Tundaan SMP\n"
              + tableData.map(row =>
                `${row.kode},${row.q},${row.c},${row.dj},${row.rh},${row.nq1},${row.nq2},${row.nq},${row.nqMax},${row.pa},${row.rqh},${row.nqh},${row.tl},${row.tg},${row.t},${row.tundaanTotal}`
              ).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "form_sa_v_data.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>

        <button
          className="btn btn-warning"
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin mereset semua data?')) {
              setTableData([{
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
              }]);
            }
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Tabel
        </button>
      </div> */}

      {/* <div className="mt-8 p-4 bg-base-200 rounded-lg">
        <h3 className=" text-lg mb-3">Keterangan Parameter:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <p><strong>q</strong> = Arus lalu lintas (SMP/jam)</p>
            <p><strong>C</strong> = Kapasitas (SMP/jam)</p>
            <p><strong>D<sub>J</sub></strong> = Derajat kejenuhan</p>
            <p><strong>R<sub>H</sub></strong> = Rasio hijau</p>
          </div>
          <div>
            <p><strong>N<sub>Q1</sub></strong> = Jumlah kendaraan antri awal</p>
            <p><strong>N<sub>Q2</sub></strong> = Jumlah kendaraan antri akhir</p>
            <p><strong>N<sub>Q</sub></strong> = Total kendaraan antri</p>
            <p><strong>P<sub>A</sub></strong> = Panjang antrian (m)</p>
          </div>
          <div>
            <p><strong>R<sub>QH</sub></strong> = Rasio kendaraan terhenti</p>
            <p><strong>N<sub>QH</sub></strong> = Jumlah kendaraan terhenti</p>
            <p><strong>T<sub>L</sub></strong> = Tundaan lalu lintas (detik)</p>
            <p><strong>T<sub>G</sub></strong> = Tundaan geometri (detik)</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}