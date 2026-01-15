'use client';

import React from 'react';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { vehicles } from '@/lib/apiAccess';
import { cameras } from '@/lib/apiService';
import { exportTrafficMatrixByFilter } from '@/utils/exportTrafficMatrixByFilter';
import { useAuth } from "@/app/context/authContext";

const TrafficMatrixByFilter = forwardRef(({ simpangId, dateInput, simpangName }, ref) => {
  const { isAdmin } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interval, setInterval] = useState('1hour');
  const [exporting, setExporting] = useState(false);
  const [statusLog, setStatusLog] = useState(null);
  const [cameraId, setCameraId] = useState(null);

  const fetchData = async (selectedInterval = interval) => {
    if (!simpangId || !dateInput) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await vehicles.getTrafficMatrixByFilter(simpangId, dateInput, selectedInterval);
      setData(response.data.data);
      
      // Fetch camera for this simpang
      try {
        const cameraRes = await cameras.getAll();
        const cameraData = Array.isArray(cameraRes?.data?.cameras) ? cameraRes.data.cameras : [];
        const camera = cameraData.find(c => c.ID_Simpang === simpangId);
        if (camera) {
          setCameraId(camera.id);
          // Fetch status log for this camera
          const statusRes = await cameras.getStatusLog(camera.id, dateInput);

          setStatusLog(statusRes.data);
        }
      } catch (statusErr) {
        console.warn('Error fetching camera status:', statusErr);
      }
    } catch (err) {
      setError(err.message || 'Error fetching data');
      console.error('Error fetching traffic matrix by filter:', err);
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
      await exportTrafficMatrixByFilter(data, data.simpang_id, dateInput, interval, statusLog, simpangName);
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
        <span>Data tidak tersedia</span>
      </div>
    );
  }

  const timeSlots = Object.keys(data.slots || {}).sort();
  const movements = ['Belok Kiri', 'Lurus', 'Belok Kanan'];
  const directions = ['barat', 'selatan', 'timur', 'utara'];
  
  // Function to get time period name for a time slot
  const getTimePeriodName = (timeSlot) => {
    if (!data.timePeriods) return '';
    for (const [periodName, timeRange] of Object.entries(data.timePeriods)) {
      const [start, end] = timeRange.split(' - ');
      const slotStart = timeSlot.split('-')[0];
      if (slotStart >= start && slotStart <= end) {
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
  const getAggregatedValue = (period, movement, direction, category) => {
    let total = 0;
    groupedByPeriod[period].forEach(timeSlot => {
      total += data.slots[timeSlot]?.[movement]?.[direction]?.[category] || 0;
    });
    return total;
  };

  // Helper function to get status for a time slot
  // Aggregates status from all 5-minute entries within the time slot
  const getStatusForTimeSlot = (timeSlot) => {
    if (!statusLog || !statusLog.timeline_5min) return null;
    
    // timeSlot format: "00:00-00:59" or "07:00-07:04" or "07:00-07:29" depending on interval
    const [slotStart, slotEnd] = timeSlot.split('-');
    
    // Convert times to minutes since midnight for comparison
    const parseTimeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const startMinutes = parseTimeToMinutes(slotStart);
    const endMinutes = parseTimeToMinutes(slotEnd);
    
    // Check if any status entry in this time slot is active (status = 1)
    let hasActive = false;
    let hasInactive = false;
    
    statusLog.timeline_5min.forEach(entry => {
      // entry.time format: "HH:MM:SS"
      const [hours, minutes] = entry.time.split(':').map(Number);
      const entryMinutes = hours * 60 + minutes;
      
      // Check if this entry falls within the time slot
      if (entryMinutes >= startMinutes && entryMinutes <= endMinutes) {
        if (entry.status === 1) {
          hasActive = true;
        } else if (entry.status === 0) {
          hasInactive = true;
        }
      }
    });
    
    // Return 1 if any camera is active, 0 if all are inactive, null if no data
    if (hasActive) return 1;
    if (hasInactive) return 0;
    return null;
  };
  
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
              disabled={loading || !isAdmin}
            >
              <option value="5min">5 Menit</option>
              <option value="15min">15 Menit</option>
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
                  Status
                </th>
                <th rowSpan={2} className="border border-base-100 text-sm font-medium p-2 text-center">
                  Jenis
                </th>
                {movements.map((movement) => (
                  <th key={movement} colSpan={directions.length + 1} className="border border-base-100 text-sm font-medium p-2 text-center">
                    {movement}
                  </th>
                ))}
              </tr>
              <tr>
                {/* <th className="border border-base-100 font-medium p-2 text-center bg-gray-50"></th>
                <th className="border border-base-100 font-medium p-2 text-center bg-gray-50"></th>
                <th className="border border-base-100 font-medium p-2 text-center bg-gray-50"></th> */}
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
                            <div className="text-xs font-bold text-blue-600">{getTimePeriodName(timeSlot)}</div>
                          </td>
                        )}
                        {isFirstCategory && (
                          <td rowSpan={vehicleCategories.length} className="border border-base-300 text-xs text-center font-bold p-2 align-middle">
                            {timeSlot}
                          </td>
                        )}
                        {isFirstCategory && (
                          <td rowSpan={vehicleCategories.length} className={`border border-base-300 text-xs text-center font-bold p-2 align-middle ${
                            getStatusForTimeSlot(timeSlot) === 1 ? 'bg-green-200' : getStatusForTimeSlot(timeSlot) === 0 ? 'bg-red-200' : 'bg-gray-200'
                          }`}>
                            <span className="text-xs font-bold">
                              {getStatusForTimeSlot(timeSlot) === 1 ? '✓ Aktif' : getStatusForTimeSlot(timeSlot) === 0 ? '✗ Tidak Aktif' : '-'}
                            </span>
                          </td>
                        )}
                        <td className="border border-base-300 text-xs text-left p-2 font-medium">{category}</td>
                        {movements.map((movement) => (
                          <React.Fragment key={movement}>
                            {directions.map((direction) => {
                              const value = data.slots[timeSlot]?.[movement]?.[direction]?.[category] || 0;
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
                                  total += data.slots[timeSlot]?.[movement]?.[dir]?.[category] || 0;
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
                    <td className="border border-base-300 text-xs text-center font-bold p-2"></td>
                    <td></td>
                    {movements.map((movement) => (
                      <React.Fragment key={movement}>
                        {directions.map((direction) => {
                          let subtotal = 0;
                          vehicleCategories.forEach((category) => {
                            subtotal += data.slots[timeSlot]?.[movement]?.[direction]?.[category] || 0;
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
                                subtotal += data.slots[timeSlot]?.[movement]?.[dir]?.[category] || 0;
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
                <td className="border border-base-300 text-xs text-center font-bold p-2"></td>
                <td className="border border-base-300 text-xs text-center font-bold p-2"></td>
                <td className="border border-base-300 text-xs text-center font-bold p-2"></td>
                <td className="border border-base-300 text-xs text-center font-bold p-2">
                  GRAND TOTAL
                </td>
                {movements.map((movement) => (
                  <React.Fragment key={movement}>
                    {directions.map((direction) => {
                      let grandTotal = 0;
                      timeSlots.forEach((timeSlot) => {
                        vehicleCategories.forEach((category) => {
                          grandTotal += data.slots[timeSlot]?.[movement]?.[direction]?.[category] || 0;
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
                              grandTotal += data.slots[timeSlot]?.[movement]?.[dir]?.[category] || 0;
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

TrafficMatrixByFilter.displayName = 'TrafficMatrixByFilter';

export default TrafficMatrixByFilter;
