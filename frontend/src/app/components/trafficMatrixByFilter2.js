'use client';

import React from 'react';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { vehicles } from '@/lib/apiAccess';
import { cameras } from '@/lib/apiService';
import { exportTrafficMatrixByFilter } from '@/utils/exportTrafficMatrixByFilter';
import { useAuth } from "@/app/context/authContext";

const FullTrafficTable = forwardRef(({ simpangId, dateInput, simpangName }, ref) => {
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
    'Gandeng/ Semitrailer',
    'Kendaraan Tidak Bermotor',
  ];

  const vehicleCategoriesLabel = [
    'SM',
    'MP',
    'AUP',
    'TR',
    'BS',
    'TS',
    'TB',
    'BB',
    'GS',
    'KTB',
  ];

  const directionStyles = {
    barat: {
      header: "bg-slate-200 text-slate-800",
      subHeader: "bg-slate-100",
      body: "bg-slate-50/30"
    },
    selatan: {
      header: "bg-slate-200 text-slate-800",
      subHeader: "bg-slate-200",
      body: "bg-slate-50/30"
    },
    timur: {
      header: "bg-slate-200 text-slate-800",
      subHeader: "bg-slate-100",
      body: "bg-slate-50/30"
    },
    utara: {
      header: "bg-slate-200 text-slate-800",
      subHeader: "bg-slate-200",
      body: "bg-slate-50/30"
    },
  };

  const allCategories = [...vehicleCategories, 'Total'];
  const allCategoriesHeading = [...vehicleCategoriesLabel, 'Total'];

  return (
    <div className="w-full space-y-4">
      {/* Bagian Filter/Header Tabel */}
      <div className="flex justify-between items-center bg-white p-3 border border-gray-200 rounded-sm">
        <div className="flex items-center gap-4">
          <select
            value={interval}
            onChange={handleIntervalChange}
            className="select select-sm text-xs focus:ring-0"
          >
            <option value="15min">15 Menit</option>
            <option value="1hour">1 Jam</option>
          </select>
          {loading && <span className="loading loading-spinner loading-xs text-gray-400"></span>}
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || !data}
          className="btn btn-sm bg-green-600 text-white text-xs rounded-sm hover:bg-green-600/80 disabled:bg-gray-400"
        >
          {exporting ? 'Exporting...' : 'Export Excel'}
        </button>
      </div>

      {/* TABEL UTAMA */}
      <div className="overflow-x-auto shadow-sm">
        <table className="text-[11px] text-center w-full">
          <thead>
            {/* BARIS 1: ARAH (UTARA, TIMUR, DST), Status */}
            <tr className="bg-white">
              <th rowSpan={3} className="font-medium leading-tight sticky -left-1 z-10 bg-gray-100 border-2 px-2 py-2 min-w-[100px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Waktu
              </th>
              <th rowSpan={3} className="font-medium leading-tight sticky left-[95px] z-10 bg-gray-100 border-2 px-2 py-2 min-w-[80px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Status Kamera
              </th>
              {directions.map((dir) => (
                <th key={dir} colSpan={33}
                  className={`border-2 px-2 py-3 text-sm capitalize ${directionStyles[dir].header}`}>
                  {dir}
                </th>
              ))}
            </tr>

            {/* BARIS 2: PERGERAKAN (KIRI, LURUS, KANAN) */}
            <tr className="bg-gray-50">
              {directions.map((dir) => (
                <React.Fragment key={`${dir}-move`}>
                  {movements.map((move) => (
                    <th key={`${dir}-${move}`} colSpan={11} className="border-2 capitalize-2 py-1 font-bold">
                      {move}
                    </th>
                  ))}
                </React.Fragment>
              ))}
            </tr>

            {/* BARIS 3: JENIS KENDARAAN */}
            <tr className="bg-gray-100">
              {directions.map((dir) => (
                <React.Fragment key={`${dir}-type-head`}>
                  {movements.map((move) => (
                    <React.Fragment key={`${dir}-${move}-types`}>
                      {allCategoriesHeading.map((cat) => (
                        <th key={cat} className="border-2 px-0.5 py-3 font-medium leading-tight min-w-[60px] break-words text-gray-600">
                          {cat}
                        </th>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white">
            {timeSlots.map((timeKey) => {
              const cameraStatus = getStatusForTimeSlot(timeKey);

              return (
                <tr key={timeKey} className="hover:bg-gray-50 transition-colors">
                  {/* KOLOM WAKTU STICKY */}
                  <td className="sticky -left-1 z-10 bg-gray-50 border-2 px-2 py-2 font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    {timeKey}
                  </td>

                  {/* KOLOM STATUS STICKY */}
                  <td className={`sticky left-[95px] min-w-[100px] z-10 border-2 px-2 py-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${cameraStatus === 1 ? 'bg-emerald-50' : cameraStatus === 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-center gap-2">
                      {cameraStatus === 1 ? (
                        <>
                          {/* <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span> */}
                          <span className="text-[10px] font-medium text-emerald-700">Aktif</span>
                        </>
                      ) : cameraStatus === 0 ? (
                        <>
                          {/* <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span> */}
                          <span className="text-[10px] font-medium text-red-700">Tidak Aktif</span>
                        </>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Tidak Ada Data</span>
                      )}
                    </div>
                  </td>

                  {/* RENDER DATA DARI API */}
                  {directions.map((dir) => (
                    <React.Fragment key={`${timeKey}-${dir}`}>
                      {movements.map((move) => (
                        <React.Fragment key={`${timeKey}-${dir}-${move}`}>
                          {allCategories.map((cat) => {
                            const val = data.slots[timeKey]?.[move]?.[dir]?.[cat] ?? 0;
                            const isTotal = cat === "Total";

                            return (
                              <td
                                key={cat}
                                className={`border-2 px-1 py-2 ${isTotal ? 'bg-gray-100 font-bold' : ''}`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="text-[10px] text-gray-500 italic mt-2">
        * Menampilkan data berdasarkan interval {interval}. Gunakan scroll horizontal untuk melihat semua arah.
      </div>
    </div>
  );
});

export default FullTrafficTable;