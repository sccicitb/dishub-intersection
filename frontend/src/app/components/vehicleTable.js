"use client";

import React, { useState, useEffect } from 'react';
import HourVehicleTable from '@/app/components/HourVehicleTable';
import MonthlyVehicleTable from '@/app/components/monthlyTable';
import DaysVehicleTable from '@/app/components/DaysVehicleTable';
import YearVehicleTable from '@/app/components/YearVehicletable';
import dataTableRaw from '@/data/DataTableYear.json';
import { maps, survey } from '@/lib/apiService';

const VehicleTable = ({ activeCamera, activeInterval }) => {
  const [activeTab, setActiveTab] = useState('hour');
  const [vehicleData, setVehicleData] = useState([]);

  const formatDateToInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateToYMDForAPI = (dateStr) => {
    return dateStr.replace(/-/g, '/');
  };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [dateInput, setDateInput] = useState(formatDateToInput(yesterday));

  const fetchSurvey = async (active, date, activeInterval) => {
    try {
      const res = await survey.getAll(active.slice(active.indexOf('n') + 1), date, activeInterval);
      const datafetch = res?.data?.vehicleData || [];
      setVehicleData(datafetch);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeCamera) {
      fetchSurvey(activeCamera.slice(activeCamera.indexOf('n') + 1), formatDateToYMDForAPI(dateInput));
    }
  }, []);

  useEffect(() => {
    if (activeCamera) {
      fetchSurvey(activeCamera, formatDateToYMDForAPI(dateInput), activeInterval);
    }
  }, [dateInput, activeCamera, activeInterval]);

  return (
    <div className="mx-auto">
      <h2 className="text-xl font-bold mb-4">Data Pemantauan Kendaraan</h2>

      <div className="tabs tabs-boxed mb-4 gap-4 flex">
        <div className="flex gap-5 items-center">
          <label className="mr-2 font-medium">Pilih Tanggal:</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
          />
        </div>
        <button
          className={`btn tab ${activeTab === 'hour' ? 'tab-active bg-[#314385]/80 border-none text-white ' : ''}`}
          onClick={() => setActiveTab('hour')}
        >
          Data Harian Per Hari
        </button>
        <button
          className={`btn tab ${activeTab === 'monthly' ? 'tab-active bg-[#314385]/80 border-none text-white ' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Data Bulanan
        </button>
        <button
          className={`btn tab ${activeTab === 'days' ? 'tab-active bg-[#314385]/80 border-none text-white ' : ''}`}
          onClick={() => setActiveTab('days')}
        >
          Data Harian
        </button>
        <button
          className={`btn tab ${activeTab === 'years' ? 'tab-active bg-[#314385]/80 border-none text-white ' : ''}`}
          onClick={() => setActiveTab('years')}
        >
          Data Tahunan
        </button>
      </div>

      {activeTab === 'hour' && (
        <div className="rounded-lg">
          <HourVehicleTable vehicleData={vehicleData} />
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="rounded-lg">
          <MonthlyVehicleTable />
        </div>
      )}

      {activeTab === 'days' && (
        <div className="rounded-lg">
          <DaysVehicleTable />
        </div>
      )}

      {activeTab === 'years' && (
        <div className="rounded-lg">
          <YearVehicleTable />
        </div>
      )}
    </div>
  );
};

export default VehicleTable;