'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { vehicles } from '@/lib/apiAccess';
import SimpangVisualization from './simpangVisualization';
import { exportTrafficMatrixByCategory } from '@/utils/exportTrafficMatrix';

const TrafficMatrixByCategory = forwardRef(({ simpangId, startDate, endDate, onFetch, simpangName }, ref) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    if (!simpangId || !startDate || !endDate) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await vehicles.getTrafficMatrixByCategory(simpangId, startDate, endDate);
      // console.log('Traffic Matrix by Category response:', response.data);
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Error fetching data');
      // console.error('Error fetching traffic matrix by category:', err);
    } finally {
      setLoading(false);
    }
  };

  // Expose refetchData method ke parent component via ref
  useImperativeHandle(ref, () => ({
    refetchData: fetchData
  }));

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportTrafficMatrixByCategory(data, simpangId, {
        start_date: startDate,
        end_date: endDate
      }, simpangName);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (!data || !data.arahPergerakan) {
    return (
      <div>
        <span>Data tidak tersedia</span>
      </div>
    );
  }

  // Vehicle categories to display
  const vehicleCategories = [
    'Sepeda Motor',
    'Mobil Penumpang',
    'Angkutan Umum',
    'Truk Ringan',
    'Bus Sedang',
    'Truk Sedang',
    'Truk Berat',
    'Bus Besar',
    'Gandeng/Semitrailer',
    'Kendaraan Tidak Bermotor',
  ];

  const directionNames = ['barat', 'selatan', 'timur', 'utara'];
  const movements = Object.keys(data.arahPergerakan);

  return (
    <div className="w-full">
      {/* Header Info */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex justify-between w-full items-start">
          <div className="grid grid-cols-2 gap-4 text-sm flex-1">
            <div>
              <span className="text-gray-600">Simpang:</span>
              <p className="font-semibold">{simpangName} ({data.simpang_id})</p>
            </div>
            <div>
              <span className="text-gray-600">Tanggal:</span>
              <p className="font-semibold">{data.date_range.start_date}</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn btn-sm bg-green-600/90 text-white hover:bg-green-600"
            >
            {exporting ? (
              <>
                <span className="animate-spin">⏳</span>
                Exporting...
              </>
            ) : (
              'Export Excel'
            )}
          </button>
        </div>
      </div>

      {/* Simpang Visualization */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-[#232f61] mb-4">Visualisasi Pergerakan Simpang</h3>
        <div className="overflow-x-auto">
          <SimpangVisualization data={data} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="table-auto border-collapse border border-base-300 w-full text-xs table-xs">
          <thead className="bg-base-300">
            <tr>
              <th rowSpan={3} className="border border-base-100 text-sm font-medium p-2 min-w-[100px] text-center align-middle">
                Jenis Kendaraan
              </th>
              {movements.map((movement) => (
                <th key={movement} colSpan={4} className="border border-base-100 text-sm font-medium p-2 text-center">
                  {movement}
                </th>
              ))}
               {movements.map((movement) => (
                <th key={`${movement}-total`} rowSpan={directionNames.length + 1} className="border border-base-100 font-medium p-2 text-center bg-gray-100">
                  Total
                </th>
              ))}
              </tr>
            <tr>
              {movements.map((movement) =>
                directionNames.map((direction) => (
                  <th key={`${movement}-${direction}`} className="border border-base-100 font-medium p-2 text-center">
                    {direction === 'barat' && 'B'}
                    {direction === 'selatan' && 'S'}
                    {direction === 'timur' && 'T'}
                    {direction === 'utara' && 'U'}
                  </th>
                ))
              )}
             
            </tr>
          </thead>
          <tbody>
            {vehicleCategories.map((category, idx) => (
              <tr key={category} className={idx % 2 === 0 ? 'bg-base-200' : 'bg-base-100'}>
                <td className="border border-base-300 text-xs text-center font-medium p-2">{category}</td>
                {movements.map((movement) =>
                  directionNames.map((direction) => {
                    const value = data.arahPergerakan[movement]?.[direction]?.[category] || 0;
                    return (
                      <td key={`${movement}-${direction}-${category}`} className="border border-base-300 text-xs text-center p-2">
                        {value.toLocaleString('id-ID')}
                      </td>
                    );
                  })
                )}
                {movements.map((movement) => {
                  const total = data.arahPergerakan[movement]?.Total?.[category] || 0;
                  return (
                    <td key={`${movement}-total-${category}`} className="border border-base-300 text-xs text-center font-semibold p-2 bg-gray-50">
                      {total.toLocaleString('id-ID')}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Total row */}
            <tr className="bg-base-300 font-bold">
              <td className="border border-base-300 text-xs text-center font-bold p-2">Total</td>
              {movements.map((movement) =>
                directionNames.map((direction) => {
                  const value = data.arahPergerakan[movement]?.[direction]?.Total || 0;
                  return (
                    <td key={`total-${movement}-${direction}`} className="border border-base-300 text-xs text-center p-2">
                      {value.toLocaleString('id-ID')}
                    </td>
                  );
                })
              )}
              {movements.map((movement) => {
                const total = data.arahPergerakan[movement]?.Total?.Total || 0;
                return (
                  <td key={`total-${movement}-total`} className="border border-base-300 text-xs text-center p-2 bg-blue-100">
                    {total.toLocaleString('id-ID')}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});

TrafficMatrixByCategory.displayName = 'TrafficMatrixByCategory';

export default TrafficMatrixByCategory;
