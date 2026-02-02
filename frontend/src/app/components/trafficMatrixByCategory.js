'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { vehicles } from '@/lib/apiAccess';
import SimpangVisualization from './simpangVisualization';
import { exportTrafficMatrixByCategory } from '@/utils/exportTrafficMatrix';

const TrafficMatrixByCategory = forwardRef(({ simpangId, simpangName }, ref) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const fetchData = async () => {
    if (!simpangId || !startDate || !endDate) return;
    
    try {
      setLoading(true);
      setError(null);

      // Validate date range
      if (new Date(startDate) > new Date(endDate)) {
        throw new Error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      }

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

  useEffect(() => {
    fetchData();
  }, [simpangId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

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
      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input input-sm input-bordered focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input input-sm input-bordered focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Memuat...' : 'Tampilkan Data'}
            </button>
            {data && (
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="btn btn-sm bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300"
              >
                {exporting ? 'Exporting...' : 'Export Excel'}
              </button>
            )}
          </div>
        </div>

        {data && (
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">Info:</span> Data dari {data.start_date} sampai {data.end_date} | Lokasi: {simpangName || simpangId}
          </div>
        )}
      </form>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {error && (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && !data && (
        <div className="text-center py-12 text-gray-500">
          Pilih tanggal dan klik &quot;Tampilkan Data&quot; untuk melihat data
        </div>
      )}

      {!loading && !error && data && data.arahPergerakan && (
        <>
      {/* Simpang Visualization */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-[#232f61] mb-4">Visualisasi Pergerakan Simpang</h3>
        <div className="overflow-x-auto">
          <SimpangVisualization data={data} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-auto border-2 w-full text-xs table-xs">
          <thead className="bg-base-300">
            <tr>
              <th rowSpan={3} className="border-2 text-sm font-medium p-2 min-w-[100px] text-center align-middle">
                Jenis Kendaraan
              </th>
              {movements.map((movement) => (
                <th key={movement} colSpan={4} className="border-2 text-sm font-medium p-2 text-center">
                  {movement}
                </th>
              ))}
               {movements.map((movement) => (
                <th key={`${movement}-total`} rowSpan={directionNames.length + 1} className="border-2 font-medium p-2 text-center bg-gray-100">
                  Total
                </th>
              ))}
              </tr>
            <tr>
              {movements.map((movement) =>
                directionNames.map((direction) => (
                  <th key={`${movement}-${direction}`} className="border-2 font-medium p-2 text-center">
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
                <td className="border-2 text-xs text-center font-medium p-2">{category}</td>
                {movements.map((movement) =>
                  directionNames.map((direction) => {
                    const value = data.arahPergerakan[movement]?.[direction]?.[category] || 0;
                    return (
                      <td key={`${movement}-${direction}-${category}`} className="border-2 text-xs text-center p-2">
                        {value.toLocaleString('id-ID')}
                      </td>
                    );
                  })
                )}
                {movements.map((movement) => {
                  const total = data.arahPergerakan[movement]?.Total?.[category] || 0;
                  return (
                    <td key={`${movement}-total-${category}`} className="border-2 text-xs text-center font-semibold p-2 bg-gray-50">
                      {total.toLocaleString('id-ID')}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Total row */}
            <tr className="bg-base-300 font-bold">
              <td className="border-2 text-xs text-center font-bold p-2">Total</td>
              {movements.map((movement) =>
                directionNames.map((direction) => {
                  const value = data.arahPergerakan[movement]?.[direction]?.Total || 0;
                  return (
                    <td key={`total-${movement}-${direction}`} className="border-2 text-xs text-center p-2">
                      {value.toLocaleString('id-ID')}
                    </td>
                  );
                })
              )}
              {movements.map((movement) => {
                const total = data.arahPergerakan[movement]?.Total?.Total || 0;
                return (
                  <td key={`total-${movement}-total`} className="border-2 text-xs text-center p-2 bg-blue-100">
                    {total.toLocaleString('id-ID')}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
        </>
      )}
    </div>
  );
});

TrafficMatrixByCategory.displayName = 'TrafficMatrixByCategory';

export default TrafficMatrixByCategory;
