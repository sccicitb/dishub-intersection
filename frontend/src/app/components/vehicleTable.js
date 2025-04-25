import React, { useState } from 'react';
import DaysVehicleTable from '@/app/components/daysTable';
import MonthlyVehicleTable from '@/app/components/monthlyTable';

const VehicleTable = () => {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'monthly'

  return (
    <div className="mx-auto">
      <h2 className="text-xl font-bold mb-4">Data Pemantauan Kendaraan</h2>
      
      <div className="tabs tabs-boxed mb-4 gap-4 flex">
        <button 
          className={`btn tab ${activeTab === 'daily' ? 'tab-active bg-[#7585C1]/80 border-none text-white ' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          Data Harian
        </button>
        <button 
          className={`btn tab ${activeTab === 'monthly' ? 'tab-active bg-[#7585C1]/80 border-none text-white ' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Data Bulanan
        </button>
      </div>
      
      {activeTab === 'daily' && (
        <div className="rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Data Harian Kendaraan</h3>
          <DaysVehicleTable />
        </div>
      )}
      
      {activeTab === 'monthly' && (
        <div className="rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Data Bulanan Kendaraan</h3>
          <MonthlyVehicleTable />
        </div>
      )}
    </div>
  );
};

export default VehicleTable;