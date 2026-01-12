'use client';

import React from 'react';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { vehicles } from '@/lib/apiAccess';

const TrafficMatrixByHours = forwardRef(({ simpangId, dateInput }, ref) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!simpangId || !dateInput) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await vehicles.getTrafficMatrixByHours(simpangId, dateInput);
      console.log('Traffic Matrix by Hours response:', response.data);
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Error fetching data');
      console.error('Error fetching traffic matrix by hours:', err);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refetchData: fetchData
  }));

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

  if (!data || !data.arahPergerakanByHour) {
    return (
      <div className="">
        <span>Data tidak tersedia</span>
      </div>
    );
  }

  const timeSlots = Object.keys(data.arahPergerakanByHour).sort();
  const movements = ['Belok Kiri', 'Lurus', 'Belok Kanan'];
  const directions = ['barat', 'selatan', 'timur', 'utara'];
  
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

  return (
    <div className="w-full">
      {/* Header Info */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Simpang ID:</span>
            <p className="font-semibold">{data.simpang_id}</p>
          </div>
          <div>
            <span className="text-gray-600">Tanggal:</span>
            <p className="font-semibold">{data.date}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="table-auto border-collapse border border-base-300 w-full text-xs table-xs">
          <thead className="bg-base-300">
            <tr>
              <th colSpan={2} className="border border-base-100 text-sm font-medium p-2 text-center">
                Waktu & Jenis
              </th>
              {movements.map((movement) => (
                <th key={movement} colSpan={directions.length + 1} className="border border-base-100 text-sm font-medium p-2 text-center">
                  {movement}
                </th>
              ))}
            </tr>
            <tr>
              <th colSpan={2} className="border border-base-100 font-medium p-2 text-center bg-gray-50"></th>
              {movements.map((movement) => (
                <React.Fragment key={movement}>
                  {directions.map((direction) => (
                    <th key={`${movement}-${direction}`} className="border border-base-100 font-medium p-2 text-center">
                      {direction === 'barat' && 'B'}
                      {direction === 'selatan' && 'S'}
                      {direction === 'timur' && 'T'}
                      {direction === 'utara' && 'U'}
                    </th>
                  ))}
                  <th key={`${movement}-total`} className="border border-base-100 font-medium p-2 text-center bg-gray-100">
                    Total
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot, timeIdx) => (
              <React.Fragment key={timeSlot}>
                {vehicleCategories.map((category, catIdx) => {
                  const isFirstCategory = catIdx === 0;
                  return (
                    <tr key={`${timeSlot}-${category}`} className={(timeIdx + catIdx) % 2 === 0 ? 'bg-base-200' : 'bg-base-100'}>
                      {isFirstCategory && (
                        <td rowSpan={vehicleCategories.length} className="border border-base-300 text-xs text-center font-bold p-2 align-middle">
                          {timeSlot}
                        </td>
                      )}
                      <td className="border border-base-300 text-xs text-left p-2 font-medium">{category}</td>
                      {movements.map((movement) => (
                        <React.Fragment key={movement}>
                          {directions.map((direction) => {
                            const value = data.arahPergerakanByHour[timeSlot]?.[movement]?.[direction]?.[category] || 0;
                            return (
                              <td key={`${timeSlot}-${movement}-${direction}-${category}`} className="border border-base-300 text-xs text-center p-2">
                                {value.toLocaleString('id-ID')}
                              </td>
                            );
                          })}
                          <td key={`${timeSlot}-${movement}-total-${category}`} className="border border-base-300 text-xs text-center font-semibold p-2 bg-gray-50">
                            {(() => {
                              let total = 0;
                              directions.forEach((dir) => {
                                total += data.arahPergerakanByHour[timeSlot]?.[movement]?.[dir]?.[category] || 0;
                              });
                              return total.toLocaleString('id-ID');
                            })()}
                          </td>
                        </React.Fragment>
                      ))}
                    </tr>
                  );
                })}
                {/* Subtotal row untuk jam ini */}
                <tr className="bg-base-300 font-semibold">
                  <td colSpan={2} className="border border-base-300 text-xs text-center font-bold p-2">
                    Subtotal {timeSlot}
                  </td>
                  {movements.map((movement) => (
                    <React.Fragment key={movement}>
                      {directions.map((direction) => {
                        let subtotal = 0;
                        vehicleCategories.forEach((category) => {
                          subtotal += data.arahPergerakanByHour[timeSlot]?.[movement]?.[direction]?.[category] || 0;
                        });
                        return (
                          <td key={`subtotal-${timeSlot}-${movement}-${direction}`} className="border border-base-300 text-xs text-center p-2">
                            {subtotal.toLocaleString('id-ID')}
                          </td>
                        );
                      })}
                      <td key={`subtotal-${timeSlot}-${movement}-total`} className="border border-base-300 text-xs text-center p-2 bg-yellow-100">
                        {(() => {
                          let subtotal = 0;
                          directions.forEach((dir) => {
                            vehicleCategories.forEach((category) => {
                              subtotal += data.arahPergerakanByHour[timeSlot]?.[movement]?.[dir]?.[category] || 0;
                            });
                          });
                          return subtotal.toLocaleString('id-ID');
                        })()}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              </React.Fragment>
            ))}
            {/* Grand Total row */}
            <tr className="bg-blue-300 font-bold">
              <td colSpan={2} className="border border-base-300 text-xs text-center font-bold p-2">
                GRAND TOTAL
              </td>
              {movements.map((movement) => (
                <React.Fragment key={movement}>
                  {directions.map((direction) => {
                    let grandTotal = 0;
                    timeSlots.forEach((timeSlot) => {
                      vehicleCategories.forEach((category) => {
                        grandTotal += data.arahPergerakanByHour[timeSlot]?.[movement]?.[direction]?.[category] || 0;
                      });
                    });
                    return (
                      <td key={`grand-${movement}-${direction}`} className="border border-base-300 text-xs text-center p-2">
                        {grandTotal.toLocaleString('id-ID')}
                      </td>
                    );
                  })}
                  <td key={`grand-${movement}-total`} className="border border-base-300 text-xs text-center p-2 bg-blue-100">
                    {(() => {
                      let grandTotal = 0;
                      timeSlots.forEach((timeSlot) => {
                        directions.forEach((dir) => {
                          vehicleCategories.forEach((category) => {
                            grandTotal += data.arahPergerakanByHour[timeSlot]?.[movement]?.[dir]?.[category] || 0;
                          });
                        });
                      });
                      return grandTotal.toLocaleString('id-ID');
                    })()}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});

TrafficMatrixByHours.displayName = 'TrafficMatrixByHours';

export default TrafficMatrixByHours;
