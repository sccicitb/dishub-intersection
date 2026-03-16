'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { exportWeeklyFactor } from '@/utils/excelExportFactor';
import { FaFileExcel } from 'react-icons/fa';

const WeeklyFactorTable = ({
  year: initialYear = new Date().getFullYear(),
  simpangId: rawSimpangId = 'semua'
}) => {
  const simpangId = (rawSimpangId === 0 || rawSimpangId === '0') ? 'semua' : rawSimpangId;
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedWeekday, setSelectedWeekday] = useState(0);

  const [data, setData] = useState([]);
  const [yearlyStats, setYearlyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const yearsOption = Array.from({ length: 5 }, (_, i) => currentYear - 3 + i);
  const daysOption = [
    { value: 0, label: 'Senin' }, { value: 1, label: 'Selasa' }, { value: 2, label: 'Rabu' },
    { value: 3, label: 'Kamis' }, { value: 4, label: 'Jumat' }, { value: 5, label: 'Sabtu' }, { value: 6, label: 'Minggu' },
  ];

  useEffect(() => { setSelectedYear(initialYear); }, [initialYear]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9090';
        const response = await axios.get(`${baseUrl}/api/audit/volume-weekday`, {
          params: { year: selectedYear, simpang_id: simpangId, weekday: selectedWeekday }
        });

        if (response.data.status === 'success') {
          setData(response.data.data);
          setYearlyStats(response.data.yearly_stats);
        } else {
          throw new Error('Gagal memuat data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear, simpangId, selectedWeekday]);

  const handleYearChange = (e) => setSelectedYear(parseInt(e.target.value));
  const handleWeekdayChange = (e) => setSelectedWeekday(parseInt(e.target.value));
  const currentDayLabel = daysOption.find(d => d.value === selectedWeekday)?.label || 'Hari';

  const handleExport = () => {
    exportWeeklyFactor({
      data,
      yearlyStats,
      year: selectedYear,
      simpangId,
      dayLabel: currentDayLabel
    });
  };

  if (loading) {
    return (
      <div className="w-[95%] mx-auto py-6 flex justify-center items-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-gray-500">Memuat Data Faktor Musiman Harian . . .</span>
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
    <div className="w-[95%] mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Tabel Faktor Musiman per Hari
          </h3>
          <div className="text-sm text-gray-500 mt-1">
            Lokasi: <span className="font-medium text-gray-700">{simpangId === 'semua' ? 'Semua Simpang' : `Simpang ${simpangId}`}</span>
          </div>
        </div>

        {/* Filter Area */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={handleExport}
              className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none flex items-center gap-2"
            >
              <FaFileExcel /> Export Excel
            </button>
          </div>
          {/* Filter Hari */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <label htmlFor="weekday-select" className="text-sm font-semibold text-gray-600 pl-2">
              Hari:
            </label>
            <select
              id="weekday-select"
              value={selectedWeekday}
              onChange={handleWeekdayChange}
              className="select select-bordered select-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {daysOption.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tahun */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <label htmlFor="year-select" className="text-sm font-semibold text-gray-600 pl-2">
              Tahun:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={handleYearChange}
              className="select select-bordered select-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {yearsOption.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-sm border-2 w-full text-sm text-center">
          <thead>
            <tr className="text-gray-700 font-semibold uppercase tracking-wider text-xs">
              <th className="border-2 text-center">Bulan ({currentDayLabel})</th>
              <th className="border-2 text-center">Jumlah Hari {currentDayLabel} <br />dalam Sebulan</th>
              <th className="border-2 text-center">Hari {currentDayLabel}<br />(Kalender)</th>
              <th className="border-2 text-center">Total Volume ({currentDayLabel}) <br />(kend/bln)</th>
              <th className="border-2 text-center">Rata-rata Harian ({currentDayLabel}) <br />(kend/hari)</th>
              <th className="border-2 text-center">Faktor Musiman <br />({currentDayLabel})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => {
              const daysData = row.days_count_data !== undefined ? row.days_count_data : row.days_count;
              const daysReal = row.days_count_real || 0;

              return (
                <tr key={row.bulan} className="hover:bg-gray-50 transition-colors">
                  <td className="border-2 font-medium text-gray-800 p-2">{row.bulan_label}</td>
                  <td className="border-2 text-center text-gray-600 p-2">{daysData}</td>
                  <td className="border-2 text-center p-2">{daysReal}</td>
                  <td className="border-2 text-center text-gray-600 font-mono p-2">
                    {row.volume_terdefinisi.toLocaleString('id-ID')}
                  </td>
                  <td className="border-2 text-center text-gray-600 font-mono p-2">
                    {row.rata_rata_harian.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="border-2 text-center font-bold text-gray-600 font-mono p-2">
                    {row.faktor_musiman}
                  </td>
                </tr>
              )
            })}
          </tbody>
          {yearlyStats && (
            <tfoot className="bg-gray-100 font-semibold text-gray-800 border-2">
              <tr>
                <td className="border-2 text-center">TOTAL TAHUNAN / RATA-RATA</td>
                <td className="text-center border-2">{yearlyStats.total_days_data}</td>
                <td className="text-center border-2 p-3">{yearlyStats.total_days_real || '-'}</td>
                <td className="text-center font-mono border-2">{yearlyStats.total_volume_terdefinisi.toLocaleString('id-ID')}</td>
                <td className="text-center font-mono border-2">{yearlyStats.yearly_average_daily.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="text-center bg-gray-200 text-gray-500 border-2">-</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default WeeklyFactorTable;