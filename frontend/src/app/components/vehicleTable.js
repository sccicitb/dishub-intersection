"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ExportButton, ExportMonthButton, ExportDayButton, ExportYearButton } from './exportExcel';
import { survey } from '@/lib/apiService';
import HourVehicleTable from './HourVehicleTable';
import MonthlyVehicleTable from './monthlyTable';
import DaysVehicleTable from './DaysVehicleTable';
import YearlyVehicleTable from './YearVehicletable';

const formatDateToInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const now = new Date();
const today = formatDateToInput(now);
const yesterdayDate = new Date(now);
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterday = formatDateToInput(yesterdayDate);
const month = String(now.getMonth() + 1).padStart(2, '0');
const year = now.getFullYear();

const tabLabels = {
  hourly: 'Per Jam',
  monthly: 'Bulanan',
  dailyMonth: 'Harian (Bulan)',
  dailyRange: 'Harian (Range)',
  yearly: 'Tahunan'
};

const FilterDataHandler = ({ activeTab, filters, setFilters, onFetch }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex gap-2 flex-wrap items-end">
      {activeTab === 'hourly' && (
        <label className="form-control w-full max-w-xs">
          <div className="label"><span className="label-text">Tanggal</span></div>
          <input type="date" name="dateInput" value={filters.dateInput} onChange={handleChange} className="input input-bordered input-sm" />
        </label>
      )}

      {activeTab === 'monthly' && (
        <label className="form-control w-full max-w-xs">
          <div className="label"><span className="label-text">Tahun</span></div>
          <input type="number" name="selectedYear" value={filters.selectedYear} onChange={handleChange} className="input input-bordered input-sm" />
        </label>
      )}

      {(activeTab === 'dailyMonth') && (
        <>
          <label className="form-control w-full max-w-xs">
            <div className="label"><span className="label-text">Bulan</span></div>
            <input type="number" name="selectedMonth" min="1" max="12" value={filters.selectedMonth} onChange={handleChange} className="input input-bordered input-sm" />
          </label>
          <label className="form-control w-full max-w-xs">
            <div className="label"><span className="label-text">Tahun</span></div>
            <input type="number" name="selectedYear" value={filters.selectedYear} onChange={handleChange} className="input input-bordered input-sm" />
          </label>
        </>
      )}

      {activeTab === 'dailyRange' && (
        <>
          <label className="form-control w-full max-w-xs">
            <div className="label"><span className="label-text">Mulai</span></div>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} className="input input-bordered input-sm" />
          </label>
          <label className="form-control w-full max-w-xs">
            <div className="label"><span className="label-text">Selesai</span></div>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} className="input input-bordered input-sm" />
          </label>
        </>
      )}

      {activeTab === 'yearly' && (
        <label className="form-control w-full max-w-xs">
          <div className="label"><span className="label-text">Tahun Awal</span></div>
          <input type="number" name="selectedYear" value={filters.selectedYear} onChange={handleChange} className="input input-bordered input-sm" />
        </label>
      )}

      <button onClick={onFetch} className="px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200  bg-[#232f61] text-white mt-8">Ambil Data</button>
    </div>
  );
};

export const ExportDataHandler = ({ activeTab, data, filters, classification }) => {
  if (!data || data.length === 0) return null;

  switch (activeTab) {
    case 'hourly':
      return <ExportButton vehicleData={data} fileName='Data_Kendaraan_perjam' classification={classification} />;
    case 'monthly':
      return <ExportMonthButton monthlyData={data} fileName="Data-Bulanan" selectedYear={filters.selectedYear} />;
    case 'dailyMonth':
    case 'dailyRange':
      return <ExportDayButton dailyData={data} fileName={`Data-Harian-${activeTab}`} type={activeTab} />;
    case 'yearly':
      return <ExportYearButton yearlyData={data} fileName="Data-Tahunan" />;
    default:
      return null;
  }
};

export function VehicleTable ({ activeCamera, activeInterval, activePendekatan, activePergerakan, activeClassification }) {
  const [activeTab, setActiveTab] = useState('hourly');
  const [vehicleData, setVehicleData] = useState([]);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const [filters, setFilters] = useState({
    dateInput: formatDateToInput(now),
    selectedMonth: String(now.getMonth() + 1).padStart(2, '0'),
    selectedYear: String(now.getFullYear()),
    startDate: formatDateToInput(now),
    endDate: formatDateToInput(now),
  });

  const fetchSurvey = async () => {
    if ((!activeCamera && activeCamera !== 0) || activeCamera === 'undefined') return toast.error("Pilih simpang terlebih dahulu untuk memuat data.");
    setLoading(true);
    try {
      const res = await survey.getAll(
        activeCamera,
        filters.dateInput.replace(/-/g, '/'),
        activeInterval,
        activePendekatan,
        activeClassification,
        activeTab,
        activePergerakan,
        filters.selectedMonth,
        filters.selectedYear,
        filters.startDate,
        filters.endDate
      );
      setVehicleData(res?.data?.vehicleData || res?.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Box Filter & Navigation */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Laporan Berdasarkan</h3>
            <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 rounded-xl border border-gray-100 w-fit">
              {Object.keys(tabLabels).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setVehicleData([]); // Reset data saat ganti tab agar user harus klik 'Tampilkan' lagi
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 
                      ${activeTab === tab
                      ? 'bg-[#232f61] text-white shadow-md'
                      : 'text-gray-500 hover:bg-white hover:text-[#232f61]'}`}
                >
                  {tabLabels[tab]}
                </button>
              ))}
            </div>
          </div>

          <ExportDataHandler
            activeTab={activeTab}
            data={vehicleData}
            filters={filters}
            classification={activeClassification}
          />
        </div>

        <FilterDataHandler
          activeTab={activeTab}
          filters={filters}
          setFilters={setFilters}
          onFetch={fetchSurvey}
          loading={loading}
        />
      </div>

      {/* Area Tabel */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-24 gap-4">
            <span className="loading loading-spinner loading-lg text-[#232f61]"></span>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-widest animate-pulse">Menyiapkan Data...</p>
          </div>
        ) : (Array.isArray(vehicleData) ? vehicleData.length > 0 : (vehicleData && Object.keys(vehicleData).length > 0)) ? (
          <div className="p-4 overflow-x-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'hourly' && <HourVehicleTable vehicleData={vehicleData} classification={activeClassification} />}
            {activeTab === 'monthly' && <MonthlyVehicleTable monthlyData={vehicleData} selectedYear={filters.selectedYear} />}
            {(activeTab === 'dailyMonth' || activeTab === 'dailyRange') && (
              <DaysVehicleTable
                monthlyData={vehicleData}
                type={activeTab}
                startDate={filters.startDate}
                endDate={filters.endDate}
                setStartDate={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                setEndDate={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                selectedYear={filters.selectedYear}
                selectedMonth={filters.selectedMonth}
                setSelectedMonth={(month) => setFilters(prev => ({ ...prev, selectedMonth: month }))}
                setSelectedYear={(year) => setFilters(prev => ({ ...prev, selectedYear: year }))}
              />
            )}
            {activeTab === 'yearly' && <YearlyVehicleTable yearlyData={vehicleData} />}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-24 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <p className="text-gray-400 text-sm font-medium">Klik tombol <span className="text-[#232f61] font-bold">"Tampilkan Data"</span><br />untuk memuat informasi survei.</p>
          </div>
        )}
      </div>
    </div>
  );
}