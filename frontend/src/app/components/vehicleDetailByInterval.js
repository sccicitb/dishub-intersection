'use client';

import React from 'react';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getRequest } from '@/lib/apiService';
import { exportVehicleDetailByInterval } from '@/utils/exportVehicleDetailByInterval';

const VehicleDetailByInterval = forwardRef(({ simpangId, dateInput, simpangName }, ref) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interval, setInterval] = useState('1hour');
  const [exporting, setExporting] = useState(false);

  // Vehicle category mapping - sesuai dengan API response
  const vehicleCategoryMap = {
    'SM': 'Sepeda Motor',
    'MP': 'Mobil Penumpang',
    'AUP': 'Angkutan Umum',
    'TR': 'Truk Ringan',
    'BS': 'Bus Sedang',
    'TS': 'Truk Sedang',
    'TB': 'Truk Berat',
    'BB': 'Bus Besar',
    'GANDENG': 'Gandeng/Semitrailer',
    'KTB': 'Kendaraan Tidak Bermotor',
  };

  const directionMap = {
    'north': 'utara',
    'south': 'selatan',
    'east': 'timur',
    'west': 'barat',
  };

  const fetchData = async (selectedInterval = interval) => {
    if (!simpangId || !dateInput) return;

    try {
      setLoading(true);
      setError(null);

      let url = '';
      if (selectedInterval === '5min') {
        url = `/vehicles/detail-by-5min?simpang_id=${simpangId}&date=${dateInput}`;
      } else if (selectedInterval === '10min') {
        url = `/vehicles/detail-by-10min?simpang_id=${simpangId}&date=${dateInput}`;
      } else if (selectedInterval === '30min') {
        url = `/vehicles/detail-by-30min?simpang_id=${simpangId}&date=${dateInput}`;
      } else {
        url = `/vehicles/detail-by-hour?simpang_id=${simpangId}&date=${dateInput}`;
      }

      const response = await getRequest(url);
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Error fetching data');
      console.error('Error fetching vehicle detail by interval:', err);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refetchData: () => fetchData(interval)
  }));

  const handleIntervalChange = (e) => {
    const newInterval = e.target.value;
    setInterval(newInterval);
    fetchData(newInterval);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportVehicleDetailByInterval(data, data.simpang_id, dateInput, interval);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Gagal export data');
    } finally {
      setExporting(false);
    }
  };

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="">
        <span>Data tidak Tersedia</span>
      </div>
    );
  }

  const timeSlots = Object.keys(data.slots || {}).sort();
  const directions = ['north', 'south', 'east', 'west'];
  const movements = ['IN', 'OUT'];
  
  // Extract vehicle categories dari first slot untuk dynamic categories
  let vehicleCategories = Object.keys(vehicleCategoryMap);
  if (timeSlots.length > 0 && data.slots[timeSlots[0]]?.data?.north?.IN) {
    vehicleCategories = Object.keys(data.slots[timeSlots[0]].data.north.IN).filter(key => key !== 'total');
  }

  // Function to get time period name for a time slot
  const getTimePeriodName = (timeSlot) => {
    if (!data.time_periods) return '';
    
    // Check from slots data directly
    if (data.slots[timeSlot]?.time_period) {
      return data.slots[timeSlot].time_period;
    }
    
    // Fallback: parse from hour range
    const [slotStart] = timeSlot.split('-');
    const slotHour = parseInt(slotStart.split(':')[0]);
    for (const [periodName, range] of Object.entries(data.time_periods)) {
      if (slotHour >= range.start && slotHour < range.end) {
        return periodName;
      }
    }
    return '';
  };

  // Group timeSlots by timePeriod
  const groupedByPeriod = {};
  timeSlots.forEach(slot => {
    const period = getTimePeriodName(slot);
    if (!groupedByPeriod[period]) {
      groupedByPeriod[period] = [];
    }
    groupedByPeriod[period].push(slot);
  });

  const timePeriods = Object.keys(groupedByPeriod);

  // Function to get aggregated value for a period
  const getAggregatedValue = (period, direction, movement, category) => {
    let total = 0;
    groupedByPeriod[period].forEach(timeSlot => {
      total += data.slots[timeSlot]?.data?.[direction]?.[movement]?.[category] || 0;
    });
    return total;
  };

  // Function to get value for a time slot
  const getSlotValue = (timeSlot, direction, movement, category) => {
    const value = data.slots[timeSlot]?.data?.[direction]?.[movement]?.[category];
    return value || 0;
  };

  return (
    <div className="w-full">
      {/* Header Info */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Simpang:</span>
            <p className="font-semibold">{simpangName} ({data.simpang_id})</p>
          </div>
          <div>
            <span className="text-gray-600">Tanggal:</span>
            <p className="font-semibold">{data.date}</p>
          </div>
          <div>
            <span className="text-gray-600">Interval:</span>
            <select
              value={interval}
              onChange={handleIntervalChange}
              className="select select-bordered select-sm w-full"
              disabled={loading}
            >
              <option value="5min">5 Menit</option>
              <option value="10min">10 Menit</option>
              <option value="30min">30 Menit</option>
              <option value="1hour">1 Jam (Default)</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {!loading && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <div className="p-4 border-b border-base-300 flex justify-end">
            <button
              onClick={handleExport}
              disabled={exporting || !data}
              className="btn btn-sm bg-green-600/90 text-white hover:bg-green-600"
            >
              {exporting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Exporting...
                </>
              ) : (
                'Export Excel'
              )}
            </button>
          </div>
          <table className="table-auto border-collapse border border-base-300 w-full text-xs table-xs">
            <thead className="bg-base-300">
              <tr>
                <th rowSpan={2} className="border border-base-100 text-sm font-medium p-2 text-center">
                  Periode
                </th>
                <th rowSpan={2} className="border border-base-100 text-sm font-medium p-2 text-center">
                  Jam
                </th>
                <th rowSpan={2} className="border border-base-100 text-sm font-medium p-2 text-center">
                  Jenis
                </th>
                {directions.map((direction) => (
                  <th key={direction} colSpan={movements.length + 1} className="border border-base-100 text-sm font-medium p-2 text-center">
                    {directionMap[direction].toUpperCase()}
                  </th>
                ))}
              </tr>
              <tr>
                {directions.map((direction) => (
                  <React.Fragment key={direction}>
                    {movements.map((movement) => (
                      <th key={`${direction}-${movement}`} className="border border-base-100 font-medium p-2 text-center">
                        {movement}
                      </th>
                    ))}
                    <th key={`${direction}-total`} className="border border-base-100 font-medium p-2 text-center bg-gray-100">
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
                            <div className="text-xs font-bold text-blue-600">{getTimePeriodName(timeSlot)}</div>
                          </td>
                        )}
                        {isFirstCategory && (
                          <td rowSpan={vehicleCategories.length} className="border border-base-300 text-xs text-center font-bold p-2 align-middle">
                            {timeSlot}
                          </td>
                        )}
                        <td className="border border-base-300 text-xs text-left p-2 font-medium">{vehicleCategoryMap[category]}</td>
                        {directions.map((direction) => (
                          <React.Fragment key={direction}>
                            {movements.map((movement) => {
                              const value = getSlotValue(timeSlot, direction, movement, category);
                              return (
                                <td key={`${timeSlot}-${direction}-${movement}-${category}`} className="border border-base-300 text-xs text-center p-2">
                                  {value.toLocaleString('id-ID')}
                                </td>
                              );
                            })}
                            <td key={`${timeSlot}-${direction}-total-${category}`} className="border border-base-300 text-xs text-center font-semibold p-2 bg-gray-50">
                              {(() => {
                                let total = 0;
                                movements.forEach((mov) => {
                                  total += getSlotValue(timeSlot, direction, mov, category);
                                });
                                return total.toLocaleString('id-ID');
                              })()}
                            </td>
                          </React.Fragment>
                        ))}
                      </tr>
                    );
                  })}
                  {/* Subtotal row */}
                  <tr className="bg-base-300 font-semibold">
                    <td className="border border-base-300 text-xs text-center font-bold p-2"></td>
                    <td className="border border-base-300 text-xs text-center font-bold p-2">
                      Subtotal {timeSlot}
                    </td>
                    <td></td>
                    {directions.map((direction) => (
                      <React.Fragment key={direction}>
                        {movements.map((movement) => {
                          let subtotal = 0;
                          vehicleCategories.forEach((category) => {
                            subtotal += getSlotValue(timeSlot, direction, movement, category);
                          });
                          return (
                            <td key={`subtotal-${timeSlot}-${direction}-${movement}`} className="border border-base-300 text-xs text-center p-2">
                              {subtotal.toLocaleString('id-ID')}
                            </td>
                          );
                        })}
                        <td key={`subtotal-${timeSlot}-${direction}-total`} className="border border-base-300 text-xs text-center p-2 bg-yellow-100">
                          {(() => {
                            let subtotal = 0;
                            movements.forEach((mov) => {
                              vehicleCategories.forEach((category) => {
                                subtotal += getSlotValue(timeSlot, direction, mov, category);
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
                <td colSpan={3} className="border border-base-300 text-xs text-center font-bold p-2">
                  GRAND TOTAL
                </td>
                {directions.map((direction) => (
                  <React.Fragment key={direction}>
                    {movements.map((movement) => {
                      let grandTotal = 0;
                      timeSlots.forEach((timeSlot) => {
                        vehicleCategories.forEach((category) => {
                          grandTotal += getSlotValue(timeSlot, direction, movement, category);
                        });
                      });
                      return (
                        <td key={`grand-${direction}-${movement}`} className="border border-base-300 text-xs text-center p-2">
                          {grandTotal.toLocaleString('id-ID')}
                        </td>
                      );
                    })}
                    <td key={`grand-${direction}-total`} className="border border-base-300 text-xs text-center p-2 bg-blue-100">
                      {(() => {
                        let grandTotal = 0;
                        timeSlots.forEach((timeSlot) => {
                          movements.forEach((mov) => {
                            vehicleCategories.forEach((category) => {
                              grandTotal += getSlotValue(timeSlot, direction, mov, category);
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
      )}
    </div>
  );
});

VehicleDetailByInterval.displayName = 'VehicleDetailByInterval';

export default VehicleDetailByInterval;
