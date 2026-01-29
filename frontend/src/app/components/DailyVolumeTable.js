'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { exportDailyVolume } from '@/utils/excelExportFactor';
import { FaFileExcel } from 'react-icons/fa'; 

const DailyVolumeTable = ({
  year: initialYear = new Date().getFullYear(),
  simpangId: rawSimpangId = 'semua'
}) => {
  const simpangId = (rawSimpangId === 0 || rawSimpangId === '0') ? 'semua' : rawSimpangId;

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const monthsOption = [
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' }, { value: 3, label: 'Maret' },
    { value: 4, label: 'April' }, { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' }, { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Desember' },
  ];

  const currentYear = new Date().getFullYear();
  const yearsOption = Array.from({ length: 5 }, (_, i) => currentYear - 3 + i);

  useEffect(() => {
    setSelectedYear(initialYear);
  }, [initialYear]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
        const response = await axios.get(`${baseUrl}/api/audit/volume-daily`, {
          params: { year: selectedYear, month: selectedMonth, simpang_id: simpangId }
        });

        if (response.data.status === 'success') {
          setData(response.data.data);
          setSummary(response.data.summary);
        } else {
          throw new Error('Gagal memuat data dari server');
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err.message || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear, selectedMonth, simpangId]);

  const handleMonthChange = (e) => setSelectedMonth(parseInt(e.target.value));
  const handleYearChange = (e) => setSelectedYear(parseInt(e.target.value));
  const currentMonthLabel = monthsOption.find(m => m.value === selectedMonth)?.label || 'Bulan Ini';

  // Hitung total hari survei & total hari kalender untuk footer
  // Note: Backend mungkin mengirim 'jumlah_kejadian_data' atau 'jumlah_kejadian', kita handle keduanya
  const totalDaysSurvei = data.reduce((acc, curr) => acc + (curr.jumlah_kejadian_data || curr.jumlah_kejadian || 0), 0);
  const totalDaysReal = data.reduce((acc, curr) => acc + (curr.days_count_real || 0), 0);

  // MADT (Mean Annual Daily Traffic)
  const madt = (summary && totalDaysSurvei > 0) ? summary.total_lalin / totalDaysSurvei : 0;
  const handleExport = () => {
    exportDailyVolume({
      data,
      summary,
      year: selectedYear,
      monthLabel: currentMonthLabel,
      simpangId
    });
  };
  if (loading) {
    return (
      <div className="w-[95%] mx-auto py-6 flex justify-center items-center">
        <div className="flex flex-col items-center g">
          <span className="text-sm text-gray-500">Memuat Data Volume Harian . . .</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[95%] mx-auto py-6 text-center bg-red-50 text-red-600 border border-red-200">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-[95%] mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold">
            Tabel Faktor Harian & Volume
          </h3>
          <div className="text-sm text-gray-500 mt-1">
            Lokasi: <span className="font-medium text-gray-700">{simpangId === 'semua' ? 'Semua Simpang' : `Simpang ${simpangId}`}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={handleExport}
              className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none flex items-center gap-2"
            >
              <FaFileExcel /> Export Excel
            </button>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <label htmlFor="month-select" className="text-sm font-semibold pl-2">
              Bulan:
            </label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="select select-bordered select-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {monthsOption.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <label htmlFor="year-select" className="text-sm font-semibold pl-2">
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

      <div className="overflow-x-auto ">
        <table className="table-sm border-2 w-full text-sm text-center">
          <thead>
            <tr className="text-gray-700 font-semibold uppercase tracking-wider text-xs">
              <th className="border-2 text-center p-3">Nama Hari</th>
              <th className="border-2 text-center p-3">Jumlah Hari Bulan<br />{currentMonthLabel}</th>
              <th className="border-2 text-center p-3">Jumlah Hari<br />(Kalender)</th>
              <th className="border-2 text-center p-3">Jumlah Volume Lalin<br />(kend/bln)</th>
              <th className="border-2 text-center p-3">LHR {currentMonthLabel}<br />(kend/hari)</th>
              <th className="border-2 text-center p-3 ">Faktor Harian bulan<br />{currentMonthLabel} (DF)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-600">
            {data.length > 0 ? (
              data.map((row) => {
                // Compatibility check: field name might be 'jumlah_kejadian_data' from new controller or 'jumlah_kejadian' from old
                const daysData = row.jumlah_kejadian_data !== undefined ? row.jumlah_kejadian_data : row.jumlah_kejadian;
                const daysReal = row.days_count_real || 0;

                const lhrHari = daysData > 0 ? row.total_lalin / daysData : 0;
                const dailyFactor = madt > 0 ? lhrHari / madt : 0;

                return (
                  <tr key={row.index_hari} className="hover:bg-gray-50 transition-colors">
                    <td className="border-2 font-medium">{row.nama_hari}</td>
                    <td className="border-2 text-center">{daysData}</td>
                    <td className="border-2 text-center">{daysReal}</td>
                    <td className="border-2 text-center font-bold font-mono 50">
                      {row.total_lalin.toLocaleString('id-ID')}
                    </td>
                    <td className="border-2 text-center font-mono">
                      {lhrHari.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                    <td className="border-2 text-center font-bold font-mono">
                      {dailyFactor.toFixed(3)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="border-2 py-8 text-gray-400 italic">
                  Tidak ada data untuk periode ini.
                </td>
              </tr>
            )}
          </tbody>
          {summary && data.length > 0 && (
            <tfoot className="bg-gray-100 font-bold text-gray-600 border-2">
              <tr>
                <td className="border-2 p-3 text-center">TOTAL</td>
                <td className="text-center border-2 p-3">{totalDaysSurvei}</td>
                <td className="text-center border-2 p-3">{totalDaysReal}</td>
                <td className="text-center font-mono border-2 p-3">
                  {summary.total_lalin.toLocaleString('id-ID')}
                </td>
                <td className="text-center font-mono border-2 p-3">
                  {/* MADT */}
                  {madt.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
                <td className="text-center border-2 p-3 bg-gray-200">-</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default DailyVolumeTable;