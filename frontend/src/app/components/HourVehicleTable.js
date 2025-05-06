// components HourVehicleTable.jsx
import React, { useState, useEffect } from 'react';
import dataTable from '@/app/data/DataTableHour.json';

const HourVehicleTable = () => {
  const [vehicleData, setVehicleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     const response = await axios.get('/api/vehicle-data');
    //     setVehicleData(response.data.vehicleData);
    //     setLoading(false);
    //   } catch (err) {
    //     setError('Gagal memuat data. Silakan coba lagi nanti.');
    //     setLoading(false);
    //   }
    // };
    setVehicleData(dataTable.vehicleData);

    // fetchData();
  }, []);

  // if (loading) {
  //   return <div className="flex justify-center p-8">
  //     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //   </div>;
  // }

  // if (error) {
  //   return <div className="bg-red-200 border border-red-400 text-red-700 px-4 py-3 rounded">
  //     {error}
  //   </div>;
  // }

  // Generate rows berdasarkan data dari API
  const generateRows = () => {
    let rows = [];
    let rowCount = 0;

    vehicleData.forEach((periodData, periodIndex) => {
      periodData.timeSlots.forEach((slot, timeIndex) => {
        rows.push(
          <tr key={`row-${rowCount}`} className={rowCount % 2 === 0 ? 'bg-base-200' : 'bg-base-100'}>
            {/* Period name only on first time slot */}
            {timeIndex === 0 ? (
              <td rowSpan={periodData.timeSlots.length} className="border-r border-t border-b border-base-300 px-2 py-1 text-sm font-medium text-center align-middle">
                {periodData.period}
              </td>
            ) : null}
            <td className={`border border-base-300 px-2 py-1 text-sm text-center ${slot.status === 1 ? 'bg-green-400' : 'bg-red-400'}`}>{''}</td>
            {/* Time slot */}
            <td className="border border-base-300 px-2 py-1 text-sm text-center whitespace-nowrap">
              {slot.time}
            </td>

            {/* Vehicle data columns */}
            <td className="border border-base-300 px-2 py-1 text-sm text-center">{slot.data.sm || ''}</td>
            <td className="border border-base-300 px-2 py-1 text-sm text-center">{slot.data.mp || ''}</td>
            <td className="border border-base-300 px-2 py-1 text-sm text-center">{slot.data.aup || ''}</td>
            <td className="border border-base-300 px-2 py-1 text-sm text-center">{slot.data.trMp || ''}</td>
            <td className="border border-base-300 px-2 py-1 text-sm text-center">{slot.data.tr || ''}</td>
            <td className="border border-base-300 px-2 py-1 text-sm text-center">{slot.data.bs || ''}</td>
            <td className="border border-base-300 px-2 py-1 text-sm text-center">{slot.data.ts || ''}</td>
            <td className="border border-base-300 px-2 py-1 text-sm text-center">{slot.data.bb || ''}</td>
            <td className="border border-base-300 px-2 py-1 text-sm text-center">{slot.data.tb || ''}</td>
            <td className="border border-base-300 px-2 py-1 text-sm text-center">
              {slot.data.gandengSemitrailer || ''}
            </td>
            <td className="border border-base-300 px-2 py-1 text-sm text-center">{slot.data.ktb || ''}</td>
            <td className="border border-base-300 px-2 py-1 text-sm text-center">{slot.data.total || ''}</td>
          </tr>
        );
        
        rowCount++;
      });

      // Add dividing row after the third period (Siang)
      if (periodIndex === 2) {
        rows.push(
          <tr key={`divider-${periodIndex}`}>
            <td colSpan={14} className="border border-base-300 font-semibold px-2 py-1 text-sm text-center bg-base-200">
              Lalu Lintas Jam-Jaman Rata-Rata 4 x VR (omit teringgi) (kend/jam)
            </td>
          </tr>
        );
      }
    });

    return rows;
  };

  return (
    <div className="mx-auto p-4 overflow-x-auto">
      <table className="table-auto border-collapse border border-base-300 w-full">
        <thead>
          <tr className="bg-base-300">
            <th rowSpan={3} className="border border-base-100 px-2 py-1 text-sm font-medium">
              Periode
            </th>
            <th rowSpan={3} className="border border-base-100 px-2 py-1 text-sm font-medium">
              Status Camera
            </th>
            <th colSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              Waktu
            </th>
            <th colSpan={8} className="border border-base-100 px-2 py-1 text-sm font-medium">
              Kendaraan Bermotor (Lih. kend/jam)
            </th>
            <th colSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              Kend. Tak Bermotor
            </th>
            <th rowSpan={3} className="border border-base-100 px-2 py-1 text-sm font-medium">
              Total<br />(Lih. kend/jam)
            </th>
          </tr>
          <tr className="bg-base-300">
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              Interval<br />15 menit
            </th>
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              SM
            </th>
            <th colSpan={3} className="border border-base-100 px-2 py-1 text-sm font-medium">
              MP
            </th>
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              TR
            </th>
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              BS
            </th>
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              TS
            </th>
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              BB
            </th>
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              TB
            </th>
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              Gandeng /<br />Semitrailer
            </th>
            <th rowSpan={2} className="border border-base-100 px-2 py-1 text-sm font-medium">
              KTB
            </th>
          </tr>
          <tr className="bg-base-300">
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">MP</th>
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">AUP</th>
            <th className="border border-base-100 px-2 py-1 text-sm font-medium">TR</th>
          </tr>
        </thead>
        <tbody>
          {generateRows()}
        </tbody>
      </table>
    </div>
  );
};

export default HourVehicleTable;