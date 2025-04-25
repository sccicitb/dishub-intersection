import React, { useState } from 'react';
import VehicleMonitoringTable from '@/app/components/vehicleMonitoringTable';
import MonthlyVehicleTable from '@/app/components/monthlyTable';

const VehicleTable = () => {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'monthly'

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Data Pemantauan Kendaraan</h2>
      
      <div className="tabs tabs-boxed mb-4">
        <a 
          className={`tab ${activeTab === 'daily' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          Data Harian
        </a>
        <a 
          className={`tab ${activeTab === 'monthly' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Data Bulanan
        </a>
      </div>
      
      {activeTab === 'daily' && (
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Data Harian Kendaraan</h3>
          <VehicleMonitoringTable />
        </div>
      )}
      
      {activeTab === 'monthly' && (
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Data Bulanan Kendaraan</h3>
          <MonthlyVehicleTable />
        </div>
      )}
    </div>
  );
};

export default VehicleTable;