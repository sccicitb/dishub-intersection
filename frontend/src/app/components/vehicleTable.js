import React, { useState } from 'react';
import HourVehicleTable from '@/app/components/HourVehicleTable';
import MonthlyVehicleTable from '@/app/components/monthlyTable';
import DaysVehicleTable from './DaysVehicleTable';

const VehicleTable = () => {
  const [activeTab, setActiveTab] = useState('hour'); // 'daily' or 'monthly'

  return (
    <div className="mx-auto">
      <h2 className="text-xl font-bold mb-4">Data Pemantauan Kendaraan</h2>
      
      <div className="tabs tabs-boxed mb-4 gap-4 flex">
        <button 
          className={`btn tab ${activeTab === 'hour' ? 'tab-active bg-[#7585C1]/80 border-none text-white ' : ''}`}
          onClick={() => setActiveTab('hour')}
        >
          Data Harian Per Jam
        </button>
        <button 
          className={`btn tab ${activeTab === 'monthly' ? 'tab-active bg-[#7585C1]/80 border-none text-white ' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Data Bulanan
        </button>
        <button 
          className={`btn tab ${activeTab === 'days' ? 'tab-active bg-[#7585C1]/80 border-none text-white ' : ''}`}
          onClick={() => setActiveTab('days')}
        >
          Data Harian
        </button>
      </div>
      
      {activeTab === 'hour' && (
        <div className="rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Data Harian Kendaraan</h3>
          <HourVehicleTable />
        </div>
      )}
      
      {activeTab === 'monthly' && (
        <div className="rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Data Bulanan Kendaraan</h3>
          <MonthlyVehicleTable />
        </div>
      )}

      {activeTab === 'days' && (
        <div className="rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Data Bulanan Kendaraan</h3>
          <DaysVehicleTable />
        </div>
      )}
    </div>
  );
};

export default VehicleTable;