"use client";

import React, { useState, useEffect } from 'react';
import HourVehicleTable from '@/app/components/HourVehicleTable';
import MonthlyVehicleTable from '@/app/components/monthlyTable';
import DaysVehicleTable from '@/app/components/DaysVehicleTable';
import YearVehicleTable from '@/app/components/YearVehicletable';
import dataTableRaw from '@/app/data/DataTableYear.json';

const VehicleTable = () => {
  // const [dataTable, setDataTable] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('hour'); // 'daily' or 'monthly'

  // useEffect(() => {
  //   try {
  //     // Di sini kita bisa memproses data jika diperlukan sebelum diteruskan ke komponen
  //     setDataTable(dataTableRaw);
  //     setLoading(false);
  //   } catch (err) {
  //     setError('Terjadi kesalahan saat memuat data');
  //     setLoading(false);
  //   }
  // }, []);

  // if (loading) {
  //   return (
  //     <div className="flex justify-center p-8 my-2">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="bg-red-200 border border-red-400 text-red-700 px-4 py-3 rounded my-2" >
  //       {error}
  //     </div>
  //   );
  // }

  return (
    <div className="mx-auto">
      <h2 className="text-xl font-bold mb-4">Data Pemantauan Kendaraan</h2>
      
      <div className="tabs tabs-boxed mb-4 gap-4 flex">
        <button 
          className={`btn tab ${activeTab === 'hour' ? 'tab-active bg-[#314385]/80 border-none text-white ' : ''}`}
          onClick={() => setActiveTab('hour')}
        >
          Data Harian Per Jam
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
          <HourVehicleTable />
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