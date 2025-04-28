"use client"
import React, { useState, useEffect } from 'react';
import monthlyData from '@/app/data/DataTableDaysMonth.json';

const MonthlyVehicleTable = () => {
  const [vehicleData, setVehicleData] = useState({
    dailyData: [],
    lhrkData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real application, you might fetch this data from an API
    // For now, we'll use the static JSON data
    setVehicleData(monthlyData);
    setLoading(false);

    // Uncomment this code if you want to fetch from an API instead
    // const fetchData = async () => {
    //   try {
    //     const response = await axios.get('/api/monthly-vehicle-data');
    //     setVehicleData(response.data);
    //     setLoading(false);
    //   } catch (err) {
    //     setError('Gagal memuat data. Silakan coba lagi nanti.');
    //     setLoading(false);
    //   }
    // };
    // fetchData();
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

  // Generate rows for monthly data
  const generateMonthlyRows = () => {
    let rows = [];

    // Accessing the correct structure for dailyData
    vehicleData.dailyData?.map((monthItem, index) => {
      rows.push(
        <tr key={`month-${index}`} className={index % 2 === 0 ? 'bg-base-200' : 'bg-base-100'}>
          <td className="border border-base-300 text-sm text-center">{monthItem.month}</td>
          <td className="border border-base-300 text-sm text-center">{monthItem.workDays}</td>
          <td className="border border-base-300 text-sm text-center">{monthItem.monthlyTotal?.sm || 0}</td>
          <td className="border border-base-300 text-sm text-center">{monthItem.monthlyTotal?.mp || 0}</td>
          <td className="border border-base-300 text-sm text-center">{monthItem.monthlyTotal?.aup || 0}</td>
          <td className="border border-base-300 text-sm text-center">{monthItem.monthlyTotal?.trMp || 0}</td>
          <td className="border border-base-300 text-sm text-center">{monthItem.monthlyTotal?.bs || 0}</td>
          <td className="border border-base-300 text-sm text-center">{monthItem.monthlyTotal?.ts || 0}</td>
          <td className="border border-base-300 text-sm text-center">{monthItem.monthlyTotal?.bb || 0}</td>
          <td className="border border-base-300 text-sm text-center">{monthItem.monthlyTotal?.tb || 0}</td>
          <td className="border border-base-300 text-sm text-center">{monthItem.monthlyTotal?.gandengSemitrailer || 0}</td>
          <td className="border border-base-300 text-sm text-center">{monthItem.monthlyTotal?.ktb || 0}</td>
          <td className="border border-base-300 text-sm text-center">{monthItem.monthlyTotal?.total || 0}</td>
        </tr>
      );
    });

    // Add total row (Tahun)
    const yearlyData = calculateYearlyTotal();
    rows.push(
      <tr key="year-total" className="bg-base-300 font-medium">
        <td className="border border-base-300 text-sm text-center">Tahun</td>
        <td className="border border-base-300 text-sm text-center">260</td>
        <td className="border border-base-300 text-sm text-center">{yearlyData.sm}</td>
        <td className="border border-base-300 text-sm text-center">{yearlyData.mp}</td>
        <td className="border border-base-300 text-sm text-center">{yearlyData.aup}</td>
        <td className="border border-base-300 text-sm text-center">{yearlyData.trMp}</td>
        <td className="border border-base-300 text-sm text-center">{yearlyData.bs}</td>
        <td className="border border-base-300 text-sm text-center">{yearlyData.ts}</td>
        <td className="border border-base-300 text-sm text-center">{yearlyData.bb}</td>
        <td className="border border-base-300 text-sm text-center">{yearlyData.tb}</td>
        <td className="border border-base-300 text-sm text-center">{yearlyData.gandengSemitrailer}</td>
        <td className="border border-base-300 text-sm text-center">{yearlyData.ktb}</td>
        <td className="border border-base-300 text-sm text-center">{yearlyData.total}</td>
      </tr>
    );

    // Add divider row
    rows.push(
      <tr key="divider-row">
        <td colSpan={13} className="border border-base-300 font-semibold text-sm text-center bg-base-200">
          Lalu Lintas Harian Rata-Rata (kend/bulan)
        </td>
      </tr>
    );

    // Add LHRK data rows
    vehicleData.lhrkData?.map((lhrk, index) => {
      rows.push(
        <tr key={`lhrk-${index}`} className={index % 2 === 0 ? 'bg-base-200' : 'bg-base-100'}>
          <td colSpan={2} className="border border-base-300 text-sm text-center">{lhrk.period}</td>
          <td className="border border-base-300 text-sm text-center">{lhrk.data?.sm || 0}</td>
          <td className="border border-base-300 text-sm text-center">{lhrk.data?.mp || 0}</td>
          <td className="border border-base-300 text-sm text-center">{lhrk.data?.aup || 0}</td>
          <td className="border border-base-300 text-sm text-center">{lhrk.data?.trMp || 0}</td>
          <td className="border border-base-300 text-sm text-center">{lhrk.data?.bs || 0}</td>
          <td className="border border-base-300 text-sm text-center">{lhrk.data?.ts || 0}</td>
          <td className="border border-base-300 text-sm text-center">{lhrk.data?.bb || 0}</td>
          <td className="border border-base-300 text-sm text-center">{lhrk.data?.tb || 0}</td>
          <td className="border border-base-300 text-sm text-center">{lhrk.data?.gandengSemitrailer || 0}</td>
          <td className="border border-base-300 text-sm text-center">{lhrk.data?.ktb || 0}</td>
          <td className="border border-base-300 text-sm text-center">{lhrk.data?.total || 0}</td>
        </tr>
      );
    });

    // Calculate LHRKT (Total LHRK)
    const lhrkTotal = calculateLHRKTotal();
    
    // Add LHRK total row
    rows.push(
      <tr key="lhrk-total" className="bg-base-300 font-medium">
        <td colSpan={2} className="border border-base-300 text-sm text-center">LHRKT</td>
        <td className="border border-base-300 text-sm text-center">{lhrkTotal.sm}</td>
        <td className="border border-base-300 text-sm text-center">{lhrkTotal.mp}</td>
        <td className="border border-base-300 text-sm text-center">{lhrkTotal.aup}</td>
        <td className="border border-base-300 text-sm text-center">{lhrkTotal.trMp}</td>
        <td className="border border-base-300 text-sm text-center">{lhrkTotal.bs}</td>
        <td className="border border-base-300 text-sm text-center">{lhrkTotal.ts}</td>
        <td className="border border-base-300 text-sm text-center">{lhrkTotal.bb}</td>
        <td className="border border-base-300 text-sm text-center">{lhrkTotal.tb}</td>
        <td className="border border-base-300 text-sm text-center">{lhrkTotal.gandengSemitrailer}</td>
        <td className="border border-base-300 text-sm text-center">{lhrkTotal.ktb}</td>
        <td className="border border-base-300 text-sm text-center">{lhrkTotal.total}</td>
      </tr>
    );

    return rows;
  };

  // Calculate yearly totals
  const calculateYearlyTotal = () => {
    const totals = {
      sm: 0, mp: 0, aup: 0, trMp: 0, bs: 0, ts: 0, bb: 0, tb: 0, gandengSemitrailer: 0, ktb: 0, total: 0
    };

    vehicleData.dailyData?.forEach(month => {
      Object.keys(totals).forEach(key => {
        totals[key] += month.monthlyTotal?.[key] || 0;
      });
    });

    return totals;
  };

  // Calculate LHRK totals
  const calculateLHRKTotal = () => {
    const totals = {
      sm: 0, mp: 0, aup: 0, trMp: 0, bs: 0, ts: 0, bb: 0, tb: 0, gandengSemitrailer: 0, ktb: 0, total: 0
    };
    
    let totalDays = 0;
    
    vehicleData.lhrkData?.forEach(lhrk => {
      totalDays += lhrk.daysInPeriod || 0;
      
      Object.keys(totals).forEach(key => {
        totals[key] += lhrk.data?.[key] || 0;
      });
    });
    
    // Calculate average if there are days
    if (totalDays > 0) {
      Object.keys(totals).forEach(key => {
        totals[key] = Math.round(totals[key] / vehicleData.lhrkData?.length);
      });
    }
    
    return totals;
  };

  return (
    <div className="mx-auto p-4 overflow-x-auto">
      <table className="table-auto border-collapse border border-base-300 w-full">
        <thead>
          <tr className="bg-base-300">
            <th rowSpan={3} className="border border-base-100 text-sm font-medium">
              Waktu
            </th>
            <th rowSpan={3} className="border border-base-100 text-sm font-medium">
              Jumlah hari kerja<br />dalam satu bulan<br />(hari)
            </th>
            <th colSpan={9} className="border border-base-100 text-sm font-medium text-center">
              Kendaraan Bermotor
            </th>
            <th rowSpan={1} className="border border-base-100 text-sm font-medium text-center">
              Kend. Tak<br />Bermotor
            </th>
            <th rowSpan={3} className="border border-base-100 text-sm font-medium text-center">
              Total<br />Kendaraan
            </th>
          </tr>
          <tr className="bg-base-300">
            <th rowSpan={2} className="border border-base-100 text-sm font-medium text-center">SM</th>
            <th colSpan={3} className="border border-base-100 text-sm font-medium text-center">MP</th>
            <th colSpan={2} className="border border-base-100 text-sm font-medium text-center">KS</th>
            <th rowSpan={2} className="border border-base-100 text-sm font-medium text-center">BB</th>
            <th colSpan={2} className="border border-base-100 text-sm font-medium text-center">TB</th>
            <th rowSpan={2} className="border border-base-100 text-sm font-medium">KTB</th>
          </tr>
          <tr className="bg-base-300">
            <th className="border border-base-100 text-sm font-medium">MP</th>
            <th className="border border-base-100 text-sm font-medium">AUP</th>
            <th className="border border-base-100 text-sm font-medium">TR</th>
            <th className="border border-base-100 text-sm font-medium">BS</th>
            <th className="border border-base-100 text-sm font-medium">TS</th>
            <th className="border border-base-100 text-sm font-medium">TB</th>
            <th className="border border-base-100 text-sm font-medium">Gandeng /<br />Semitrailer</th>
          </tr>
        </thead>
        <tbody>
          {generateMonthlyRows()}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyVehicleTable;