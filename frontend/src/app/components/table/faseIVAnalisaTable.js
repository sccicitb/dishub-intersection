"use client";

import { useState } from 'react';
import DataSample from "@/data/DataFaseIVAnalisa.json"
import SketsaFaseIV from '@/app/components/sketsa/sketsaFaseIV'

export default function TrafficPhaseTable () {
  const [tableData, setTableData] = useState(DataSample.tableData);
  const handleInputChange = (rowIndex, field, subField, phaseKey, value) => {
    const newData = [...tableData];

    if (field === 'phases' && phaseKey && subField) {
      if (subField === 'wAll') {
        // For nested wAll object
        const [wAllField, wAllSubField] = value.split('.');
        if (wAllSubField) {
          newData[rowIndex][field][phaseKey][subField][wAllField] = wAllSubField;
        } else {
          // Direct wAll field update
          newData[rowIndex][field][phaseKey][subField][wAllField] = value.value;
        }
      } else {
        // For direct phase fields like mf, whi
        newData[rowIndex][field][phaseKey][subField] = value;
      }
    } else if (field && subField) {
      // For nested fields not in phases
      if (!newData[rowIndex][field]) {
        newData[rowIndex][field] = {};
      }
      newData[rowIndex][field][subField] = value;
    } else {
      // For direct fields
      newData[rowIndex][field] = value;
    }

    setTableData(newData);
  };

  const handlePhaseWAllChange = (rowIndex, phaseKey, wAllField, value) => {
    const newData = [...tableData];
    if (!newData[rowIndex].phases[phaseKey].wAll) {
      newData[rowIndex].phases[phaseKey].wAll = {};
    }
    newData[rowIndex].phases[phaseKey].wAll[wAllField] = value;
    setTableData(newData);
  };

  return (
    <div className="p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-lg font-normal mb-2">
          Tabel Analisis Fase Lalu Lintas
        </h2>
        <p className="text-[12px]">
          Analisis waktu dan fase untuk setiap pendekat
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            {/* Header Row 1 */}
            <tr className="bg-gray-200">
              <th rowSpan={4} className="border border-gray-300 p-2 text-center font-semibold min-w-[80px]">
                Kode<br />Pendekat
              </th>
              <th rowSpan={4} className="border border-gray-300 p-2 text-center font-semibold min-w-[80px]">
                Tipe<br />Pendekat
              </th>
              <th rowSpan={4} className="border border-gray-300 p-2 text-center font-semibold min-w-[100px]">
                Arah
              </th>
              <th rowSpan={4} className="border border-gray-300 p-2 text-center font-semibold min-w-[100px]">
                Pemisahan<br />Lurus - RKa
              </th>
              <th colSpan={4} className="border border-gray-300 p-2 text-center font-semibold">
                F1
              </th>
              <th colSpan={4} className="border border-gray-300 p-2 text-center font-semibold">
                F2
              </th>
              <th colSpan={4} className="border border-gray-300 p-2 text-center font-semibold">
                F3
              </th>
              <th colSpan={4} className="border border-gray-300 p-2 text-center font-semibold">
                F4
              </th>
              <th rowSpan={4} className="border border-gray-300 p-2 text-center font-semibold min-w-[60px]">
                W<sub>HI</sub>
              </th>
              <th rowSpan={4} className="border border-gray-300 p-2 text-center font-semibold min-w-[60px]">
                S
              </th>
            </tr>

            {/* Header Row 2 */}
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[50px]">MF</th>
              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[50px]">W<sub>HI</sub></th>
              <th colSpan={2} className="border border-gray-300 p-1 text-center font-semibold ">W<sub>All</sub></th>

              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[50px]">MF</th>
              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[50px]">W<sub>HI</sub></th>
              <th colSpan={2} className="border border-gray-300 p-1 text-center font-semibold ">W<sub>All</sub></th>

              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[50px]">MF</th>
              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[50px]">W<sub>HI</sub></th>
              <th colSpan={2} className="border border-gray-300 p-1 text-center font-semibold ">W<sub>All</sub></th>

              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[50px]">MF</th>
              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[50px]">W<sub>HI</sub></th>
              <th colSpan={2} className="border border-gray-300 p-1 text-center font-semibold ">W<sub>All</sub></th>
            </tr>

            {/* Header Row 3 */}
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-1"></th>
              <th className="border border-gray-300 p-1"></th>
              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[40px]">W<sub>K</sub></th>
              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[40px]">W<sub>MS</sub></th>

              <th className="border border-gray-300 p-1"></th>
              <th className="border border-gray-300 p-1"></th>
              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[40px]">W<sub>K</sub></th>
              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[40px]">W<sub>MS</sub></th>

              <th className="border border-gray-300 p-1"></th>
              <th className="border border-gray-300 p-1"></th>
              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[40px]">W<sub>K</sub></th>
              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[40px]">W<sub>MS</sub></th>

              <th className="border border-gray-300 p-1"></th>
              <th className="border border-gray-300 p-1"></th>
              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[40px]">W<sub>K</sub></th>
              <th className="border border-gray-300 p-1 text-center font-semibold min-w-[40px]">W<sub>MS</sub></th>
            </tr>
          </thead>

          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {/* Kode Pendekat */}
                <td className="border border-gray-300 text-center ">
                  <div className="flex items-center justify-center p-2">
                    <input type="checkbox" className="mr-1" defaultChecked />
                    <span className="font-semibold">{row.kodePendekat}</span>
                  </div>
                </td>

                {/* Tipe Pendekat */}
                <td className="border border-gray-300 text-center p-2 font-semibold">
                  {row.tipePendekat}
                </td>

                {/* Arah */}
                <td className="border border-gray-300 p-2">
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      <input type="checkbox" className="mr-1" />
                      <span>BKI / BKIJT</span>
                      <input type="checkbox" className="ml-2" defaultChecked={row.pemisahanLurusRka === 1} />
                    </div>
                    <div className="flex items-center text-xs">
                      <input type="checkbox" className="mr-1" defaultChecked />
                      <span>Lurus</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <input type="checkbox" className="mr-1" />
                      <span>BKa</span>
                    </div>
                  </div>
                </td>

                {/* Pemisahan Lurus - RKa */}
                <td className="border border-gray-300 text-center p-2">
                  <input type="checkbox" className="scale-125" defaultChecked={row.pemisahanLurusRka === 1} />
                </td>

                {/* F1 */}
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                      value={row.phases.f1.mf}
                      onChange={(e) => handleInputChange(rowIndex, 'phases', 'mf', 'f1', e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                      value={row.phases.f1.whi}
                      onChange={(e) => handleInputChange(rowIndex, 'phases', 'whi', 'f1', e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.phases.f1.wAll.wk}
                    onChange={(e) => handlePhaseWAllChange(rowIndex, 'f1', 'wk', e.target.value)}
                  />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.phases.f1.wAll.wms}
                    onChange={(e) => handlePhaseWAllChange(rowIndex, 'f1', 'wms', e.target.value)}
                  />
                  </div>
                </td>

                {/* F2 */}
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.phases.f2.mf}
                    onChange={(e) => handleInputChange(rowIndex, 'phases', 'mf', 'f2', e.target.value)}
                  />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.phases.f2.whi}
                    onChange={(e) => handleInputChange(rowIndex, 'phases', 'whi', 'f2', e.target.value)}
                  />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.phases.f2.wAll.wk}
                    onChange={(e) => handlePhaseWAllChange(rowIndex, 'f2', 'wk', e.target.value)}
                  />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.phases.f2.wAll.wms}
                    onChange={(e) => handlePhaseWAllChange(rowIndex, 'f2', 'wms', e.target.value)}
                  />
                  </div>
                </td>

                {/* F3 */}
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.phases.f3.mf}
                    onChange={(e) => handleInputChange(rowIndex, 'phases', 'mf', 'f3', e.target.value)}
                  />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.phases.f3.whi}
                    onChange={(e) => handleInputChange(rowIndex, 'phases', 'whi', 'f3', e.target.value)}
                  />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.phases.f3.wAll.wk}
                    onChange={(e) => handlePhaseWAllChange(rowIndex, 'f3', 'wk', e.target.value)}
                  />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.phases.f3.wAll.wms}
                    onChange={(e) => handlePhaseWAllChange(rowIndex, 'f3', 'wms', e.target.value)}
                  />
                  </div>
                </td>

                {/* F4 */}
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.phases.f4.mf}
                    onChange={(e) => handleInputChange(rowIndex, 'phases', 'mf', 'f4', e.target.value)}
                  />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.phases.f4.whi}
                    onChange={(e) => handleInputChange(rowIndex, 'phases', 'whi', 'f4', e.target.value)}
                  />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.phases.f4.wAll.wk}
                    onChange={(e) => handlePhaseWAllChange(rowIndex, 'f4', 'wk', e.target.value)}
                  />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.phases.f4.wAll.wms}
                    onChange={(e) => handlePhaseWAllChange(rowIndex, 'f4', 'wms', e.target.value)}
                  />
                  </div>
                </td>

                {/* WHI */}
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.whi}
                    onChange={(e) => handleInputChange(rowIndex, 'whi', null, null, e.target.value)}
                  />
                  </div>
                </td>

                {/* S */}
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[3rem]">
                    <input
                      type="text"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-1 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-16 border-0"
                    value={row.s}
                    onChange={(e) => handleInputChange(rowIndex, 's', null, null, e.target.value)}
                  />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SketsaFaseIV dataSketsa={tableData}/>
      {/* 
      <div className="mt-6 flex gap-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          onClick={() => {
            console.log('Data saved:', tableData);
            alert('Data berhasil disimpan! (Lihat console untuk detail)');
          }}
        >
          Simpan Data
        </button>

        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          onClick={() => {
            const newRow = {
              kodePendekat: '',
              tipePendekat: '',
              arah: '',
              pemisahanLurusRka: '',
              phases: {
                f1: { mf: '', whi: '', wAll: { wk: '', wms: '' } },
                f2: { mf: '', whi: '', wAll: { wk: '', wms: '' } },
                f3: { mf: '', whi: '', wAll: { wk: '', wms: '' } },
                f4: { mf: '', whi: '', wAll: { wk: '', wms: '' } }
              },
              whi: '',
              s: ''
            };
            setTableData([...tableData, newRow]);
          }}
        >
          Tambah Baris
        </button>
      </div> */}
    </div>
  );
}