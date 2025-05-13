import React, { useState, useEffect } from 'react';
import yearlyData from '@/data/DataTableYear.json';

const YearlyVehicleTable = () => {
  const [vehicleData, setVehicleData] = useState({ yearlyData: [], lhrtData: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setVehicleData(yearlyData);
      setLoading(false);
    } catch (err) {
      setError('Gagal memuat data. Silakan coba lagi nanti.');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="bg-red-200 border border-red-400 text-red-700 px-4 py-3 rounded">
      {error}
    </div>;
  }

  // Generate yearly data rows
  const generateYearlyRows = () => {
    return vehicleData.yearlyData.map((yearData, index) => (
      <tr key={`year-${yearData.year}`} className={index % 2 === 0 ? 'bg-base-200' : 'bg-base-100'}>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{yearData.year}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{yearData.data.sm || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{yearData.data.mp || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{yearData.data.aup || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{yearData.data.tr || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{yearData.data.bs || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{yearData.data.ts || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{yearData.data.bb || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{yearData.data.tb || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">
          {yearData.data.gandengSemitrailer || ''}
        </td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{yearData.data.ktb || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{yearData.data.total || ''}</td>
      </tr>
    ));
  };

  // Generate LHRT data rows
  const generateLHRTRows = () => {
    return vehicleData.lhrtData.map((lhrtData, index) => (
      <tr key={`lhrt-${lhrtData.period}`} className={index % 2 === 0 ? 'bg-base-200' : 'bg-base-100'}>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrtData.period}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrtData.data.sm || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrtData.data.mp || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrtData.data.aup || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrtData.data.tr || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrtData.data.bs || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrtData.data.ts || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrtData.data.bb || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrtData.data.tb || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">
          {lhrtData.data.gandengSemitrailer || ''}
        </td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrtData.data.ktb || ''}</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrtData.data.total || ''}</td>
      </tr>
    ));
  };

  return (
    <div className="mx-auto p-4 overflow-x-auto">
      <table className="table-auto border-collapse border border-base-300 w-full">
        <thead>
          <tr className="bg-base-300">
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              Tahun
            </th>
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              SM
            </th>
            <th colSpan={3} className="border border-base-100 px-2 py-1 text-sm font-medium">
              MP
            </th>
            <th colSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              KS
            </th>
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              BB
            </th>
            <th colSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              TB
            </th>
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              Kend. Tak<br />Bermotor
            </th>
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              Total<br />Kendaraan
            </th>
          </tr>
          <tr className="bg-base-300">
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">MP</th>
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">AUP</th>
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">TR</th>
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">BS</th>
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">TS</th>
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">TB</th>
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">
              Gandeng /<br />Semitrailer
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Yearly data rows */}
          {generateYearlyRows()}
          
          {/* Divider row */}
          <tr>
            <td colSpan={12} className="border border-base-300 font-semibold px-2 py-1 text-sm text-center bg-base-200">
              Lalu Lintas Harian Rata-Rata Tahunan (kend/hari)
            </td>
          </tr>
          
          {/* LHRT data rows */}
          {generateLHRTRows()}
        </tbody>
      </table>
    </div>
  );
};

export default YearlyVehicleTable;