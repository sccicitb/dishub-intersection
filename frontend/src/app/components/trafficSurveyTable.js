"use client"

import React, { useEffect, useState } from 'react';

const TrafficSurveyTable = () => {

  const [trafficData, setTrafficData] = useState([])
  useEffect(() => {
    import('@/data/trafficKinerja.json').then((data) => {
      setTrafficData(data.default)
    })
  }, [])

  const renderTableRows = () => {
    const rows = [];

    if (!trafficData || !trafficData.surveyData) {
      return rows;
    }

    trafficData.surveyData.forEach((directionData, dirIndex) => {
      // Render rows for each direction
      directionData.rows.forEach((row, rowIndex) => {
        rows.push(
          <tr key={`${dirIndex}-${rowIndex}`} className=" border-gray-300">
            {/* Direction column (only for first row of each direction) */}
            {rowIndex === 0 && (
              <td
                rowSpan={directionData.rows.length + 1}
                className="border-r border-gray-400 px-2 py-3 text-center font-semibold bg-gray-100 align-middle"
              >
                {directionData.direction}
              </td>
            )}

            {/* Type column */}
            <td className="border-r border-gray-300 px-2 py-1 text-xs bg-blue-50">
              {row.type}
            </td>

            {/* MP columns */}
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center text-blue-600 font-semibold">
              {row.mp.terlindung}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {row.mp.terlindung}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {row.mp.terlawan}
            </td>

            {/* KS columns */}
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center text-blue-600 font-semibold">
              {row.ks.terlindung}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {row.ks.terlindung}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {row.ks.terlawan}
            </td>

            {/* SM columns */}
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center text-blue-600 font-semibold">
              {row.sm.terlindung}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {row.sm.smpTerlindung}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {row.sm.smpTerlawan}
            </td>

            {/* Total columns */}
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center text-blue-600 font-semibold">
              {row.total.terlindung}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center text-green-600 font-semibold">
              {row.total.smpTerlindung}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center text-green-600 font-semibold">
              {row.total.smpTerlawan}
            </td>

            {/* KTB columns */}
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {row.ktb.rasio}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {row.ktb.count}
            </td>

            {/* RKTB column */}
            <td className="px-1 py-1 text-xs text-center bg-gray-200">
              {row.rktb || ''}
            </td>
          </tr>
        );
      });

      // Add subtotal row
      rows.push(
        <tr key={`subtotal-${dirIndex}`} className="bg-gray-100 font-semibold border-gray-400">
          <td className="border-r border-gray-300 px-2 py-1 text-xs">
            Total
          </td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">
            {directionData.subtotal.mp.terlindung}
          </td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">
            {directionData.subtotal.mp.terlindung}
          </td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">
            {directionData.subtotal.mp.terlawan}
          </td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">
            {directionData.subtotal.ks.terlindung}
          </td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">
            {directionData.subtotal.ks.terlindung}
          </td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">
            {directionData.subtotal.ks.terlawan}
          </td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">
            {directionData.subtotal.sm.terlindung}
          </td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">
            {directionData.subtotal.sm.smpTerlindung}
          </td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">
            {directionData.subtotal.sm.smpTerlawan}
          </td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">
            {directionData.subtotal.total.terlindung}
          </td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">
            {directionData.subtotal.total.smpTerlindung}
          </td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">
            {directionData.subtotal.total.smpTerlawan}
          </td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold"></td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">
            {directionData.subtotal.ktb}
          </td>
          <td className="px-1 py-1 text-xs text-center font-semibold bg-gray-200">
            {directionData.subtotal.rktb}
          </td>
        </tr>
      );
    });

    return rows;
  };

  return (
    <div className="w-full p-4 overflow-x-auto">
      <div className="p-2">
        <div className="py-4">
          <h2 className="text-[20px] font-normal text-gray-800">Form SA-II</h2>
          <p className="text-xs text-gray-600 mt-1">Data kendaraan berdasarkan arah pergerakan</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-400 text-xs table table-xs">
            <thead className="text-center">
              {/* Header Row 1 */}
              <tr className="bg-gray-200 ">
                <th rowSpan={6} className="border border-gray-400 px-2 py-3 text-xs font-semibold min-w-[60px]">
                  Kode Pendekat
                </th>
                <th rowSpan={6} className="border border-gray-400 px-2 py-3 text-xs font-semibold min-w-[80px]">
                  Arah
                </th>
                <th colSpan={13} className="border border-gray-400 px-2 py-2 text-xs font-semibold bg-gray-200">
                  KENDARAAN BERMOTOR
                </th>
                <th colSpan={2} className="border border-gray-400 px-2 py-2 text-xs font-semibold bg-gray-200">
                  KEND. TAK BERMOTOR
                </th>
              </tr>

              {/* Header Row 2 */}
              <tr className="bg-gray-200">
                <th colSpan={3} className="border border-gray-400 px-1 py-2 text-xs font-semibold">
                  Mobil Penumpang (MP)
                </th>
                <th colSpan={3} className="border border-gray-400 px-1 py-2 text-xs font-semibold">
                  Kendaraan Sedang (KS)
                </th>
                <th colSpan={3} className="border border-gray-400 px-1 py-2 text-xs font-semibold">
                  Sepeda Motor (SM)
                </th>
                <th colSpan={3} rowSpan={3} className="border border-gray-400 px-1 py-2 text-xs font-semibold">
                  Total Kendaraan Bermotor
                </th>
                <th rowSpan={5} className="border border-gray-400 px-1 py-1 text-xs font-semibold">
                  Rasio Belok Kendaraan
                </th>
                <th rowSpan={5} className="border border-gray-400 px-1 py-2 text-xs font-semibold">
                  KTB
                </th>
                <th rowSpan={5} className="border border-gray-400 px-1 py-2 text-xs font-semibold">
                  RKTB
                </th>
              </tr>

              {/* Header Row 3 */}
              <tr className="bg-gray-200 text-center">
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={2}>
                  EMP<sub>terlindung</sub>
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={1}>
                  1
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={2}>
                  EMP<sub>terlindung</sub>
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={1}>
                  1,3
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={2}>
                  EMP<sub>terlindung</sub>
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={1}>
                  1,5
                </th>
              </tr>

              {/* Header Row 4 */}
              <tr className="bg-gray-200 text-center">
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={2}>
                  EMP<sub>terlindung</sub>
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={1}>
                  1
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={2}>
                  EMP<sub>terlindung</sub>
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={1}>
                  1,3
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={2}>
                  EMP<sub>terlindung</sub>
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={1}>
                  1,5
                </th>
              </tr>

              {/* Column Headers */}
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" rowSpan={2}>kend/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlindung</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlawan</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" rowSpan={2}>kend/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlindung</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlawan</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" rowSpan={2}>kend/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlindung</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlawan</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" rowSpan={2}>kend/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlindung</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlawan</th>
              </tr>

                {/* Column Headers */}
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
              </tr>

              {/* Row Numbers */}
              <tr className="bg-gray-100 text-center">
                <th className="border border-gray-400 px-1 py-1 text-xs">(1)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(2)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(3)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(4)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(5)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(6)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(7)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(8)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(9)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(10)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(11)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(12)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(13)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(14)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(16)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(17)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(18)</th>
              </tr>
            </thead>

            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrafficSurveyTable;