'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileExcel } from 'react-icons/fa';
// Import fungsi export
import { exportSeasonalFactor } from '@/utils/excelExportFactor';

const SeasonalFactorTable = ({
  year: initialYear = new Date().getFullYear(),
  simpangId: rawSimpangId = 'semua',
  namaSimpang = ''
}) => {
  const simpangId = (rawSimpangId === 0 || rawSimpangId === '0') ? 'semua' : rawSimpangId;
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [data, setData] = useState([]);
  const [yearlyStats, setYearlyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const yearsOption = Array.from({ length: 5 }, (_, i) => currentYear - 3 + i);

  useEffect(() => { setSelectedYear(initialYear); }, [initialYear]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); setError(null);
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
        const response = await axios.get(`${baseUrl}/api/audit/volume-audit`, {
          params: { year: selectedYear, simpang_id: simpangId }
        });

        if (response.data.status === 'success') {
          setData(response.data.data);
          setYearlyStats(response.data.yearly_stats);
        } else { throw new Error('Gagal memuat data'); }
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    fetchData();
  }, [selectedYear, simpangId]);

  // Handler Export menggunakan Utility
  const handleExport = () => {
    exportSeasonalFactor({
      data,
      yearlyStats,
      year: selectedYear,
      simpangId
    });
  };


  if (loading) {
    return (
      <div className="w-[95%] mx-auto py-6 flex justify-center items-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-gray-500">Memuat Data Faktor Musiman . . .</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-[95%] mx-auto py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Tabel Faktor Musiman (Seasonal Factor)</h3>
          <div className="text-sm text-gray-500 mt-1">
            Lokasi: <span className="font-medium">{simpangId === 'semua' ? 'Semua Simpang' : `Simpang ${namaSimpang}`}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={handleExport}
              className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none flex items-center gap-2"
            >
              <FaFileExcel /> Export Excel
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border-none shadow-sm">
            <label className="text-sm font-semibold text-gray-600 pl-2">Tahun:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="select select-bordered select-sm w-24">
              {yearsOption.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-sm border-2 w-full text-sm text-center">
          <thead>
            <tr className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-xs">
              <th className="border-2 text-center">Bulan</th>
              <th className="border-2 text-center">Jumlah hari dalam <br />satu bulan (hari)</th>
              <th className="border-2 text-center">Jumlah volume lalin dalam <br />satu bulan (kend/bln)</th>
              <th className="border-2 text-center">LHR (kend/hari)</th>
              <th className="border-2 text-center">Faktor Musiman (SF)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => (
              <tr key={row.bulan} className="hover:bg-gray-50 transition-colors">
                <td className="border-2 font-medium text-gray-800">{row.bulan_label}</td>
                <td className="border-2 text-center text-gray-600">{row.days_count}</td>
                <td className="border-2 text-center text-gray-600 font-mono">
                  {row.volume_terdefinisi.toLocaleString('id-ID')}
                </td>
                <td className="border-2 text-center text-gray-600 font-mono">
                  {row.rata_rata_harian.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="border-2 text-center font-bold font-mono">
                  {row.faktor_musiman}
                </td>
              </tr>
            ))}
          </tbody>
          {yearlyStats && (
            <tfoot className="bg-gray-50 font-semibold text-gray-800 border-2">
              <tr>
                <td className="border-2">RATA-RATA / TOTAL TAHUNAN</td>
                <td className="text-center border-2">{yearlyStats.total_days}</td>
                <td className="text-center font-mono border-2">{yearlyStats.total_volume_terdefinisi.toLocaleString('id-ID')}</td>
                <td className="text-center font-mono border-2">{yearlyStats.yearly_average_daily.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="text-center text-gray-500 border-2">-</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
export default SeasonalFactorTable;
