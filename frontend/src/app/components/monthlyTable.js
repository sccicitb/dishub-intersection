import React, { useState, useEffect } from 'react';
import monthlyData from '@/app/data/monthlyDataTable.json';

const MonthlyVehicleTable = () => {
  const [vehicleData, setVehicleData] = useState({
    monthlyData: [],
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

    vehicleData.monthlyData.map((month, index) => {
      rows.push(
        <tr key={`month-${index}`} className={index % 2 === 0 ? 'bg-base-200' : 'bg-base-100'}>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{month.month}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{month.workDays}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{month.data.sm || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{month.data.mp || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{month.data.aup || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{month.data.trMp || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{month.data.bs || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{month.data.ts || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{month.data.bb || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{month.data.tb || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{month.data.gandengSemitrailer || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{month.data.ktb || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{month.data.total || ''}</td>
        </tr>
      );
    });

    // Add total row (Tahun)
    rows.push(
      <tr key="year-total" className="bg-base-300 font-medium">
        <td className="border border-base-300 px-2 py-1 text-sm text-center">Tahun</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center">260</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
      </tr>
    );

    // Add divider row
    rows.push(
      <tr key="divider-row">
        <td colSpan={13} className="border border-base-300 font-semibold px-2 py-1 text-sm text-center bg-base-200">
          Lalu Lintas Harian Rata-Rata (kend/bulan)
        </td>
      </tr>
    );

    // Add LHRK data rows
    vehicleData.lhrkData.map((lhrk, index) => {
      rows.push(
        <tr key={`lhrk-${index}`} className={index % 2 === 0 ? 'bg-base-200' : 'bg-base-100'}>
          <td colSpan={2} className="border border-base-300 px-2 py-1 text-sm text-center">{lhrk.period}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrk.data.sm || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrk.data.mp || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrk.data.aup || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrk.data.trMp || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrk.data.bs || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrk.data.ts || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrk.data.bb || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrk.data.tb || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrk.data.gandengSemitrailer || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrk.data.ktb || ''}</td>
          <td className="border border-base-300 px-2 py-1 text-sm text-center">{lhrk.data.total || ''}</td>
        </tr>
      );
    });

    // Add LHRK total row
    rows.push(
      <tr key="lhrk-total" className="bg-base-300 font-medium">
        <td colSpan={2} className="border border-base-300 px-2 py-1 text-sm text-center">LHRKT</td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
        <td className="border border-base-300 px-2 py-1 text-sm text-center"></td>
      </tr>
    );

    return rows;
  };

  return (
    <div className="mx-auto p-4 overflow-x-auto">
      <table className="table-auto border-collapse border border-base-300 w-full">
        <thead>
          <tr className="bg-base-300">
            <th rowSpan={3} className="border border-base-100 px-2 py-1 text-sm font-medium">
              Waktu
            </th>
            <th rowSpan={3} className="border border-base-100 px-2 py-1 text-sm font-medium">
              Jumlah hari kerja<br />dalam satu bulan<br />(hari)
            </th>
            <th colSpan={9} className="border border-base-100 px-2 py-1 text-sm font-medium text-center">
              Kendaraan Bermotor
            </th>
            <th rowSpan={1} className="border border-base-100 px-2 py-1 text-sm font-medium text-center">
              Kend. Tak<br />Bermotor
            </th>
            <th rowSpan={3} className="border border-base-100 px-2 py-1 text-sm font-medium text-center">
              Total<br />Kendaraan
            </th>
          </tr>
          <tr className="bg-base-300">
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium text-center">SM</th>
            <th colSpan={3} className="border border-base-100 px-2 py-1 text-sm font-medium text-center">MP</th>
            <th colSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium text-center">KS</th>
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium text-center">BB</th>
            <th colSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium text-center">TB</th>
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">KTB</th>
          </tr>
          <tr className="bg-base-300">
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">MP</th>
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">AUP</th>
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">TR</th>
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">BS</th>
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">TS</th>
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">TB</th>
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">Gandeng /<br />Semitrailer</th>
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