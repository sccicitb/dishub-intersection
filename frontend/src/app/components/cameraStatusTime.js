"use client";

import React, { useState, useEffect } from "react";
import { cameras } from "@/lib/apiService";

// Fungsi bantu untuk menghasilkan slot waktu setiap 5 menit
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
};

// Fungsi untuk mengubah timeline_5min array menjadi status map
const getStatusMapFromTimeline = (timelineData) => {
  if (!Array.isArray(timelineData)) return {};

  const statusMap = {};
  
  timelineData.forEach((item) => {
    if (item.time) {
      // Extract HH:MM from time (format: HH:MM:SS)
      const timeKey = item.time.substring(0, 5);
      statusMap[timeKey] = item.status;
    }
  });

  return statusMap;
};

const CameraStatusTimeline = ({ cameraId, selectedDate }) => {
  const [statusData, setStatusData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cameraId || !selectedDate) return;

    const fetchCameraStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await cameras.getStatusLog(cameraId, selectedDate);
        

        
        if (response?.data) {

          setStatusData(response.data);
        } else {
          setStatusData({});
        }
      } catch (err) {
        console.error('Error fetching camera status:', err);
        setError('Gagal memuat data status kamera');
        setStatusData({});
      } finally {
        setLoading(false);
      }
    };

    fetchCameraStatus();
  }, [cameraId, selectedDate]);

  const statusPer5Min = getStatusMapFromTimeline(statusData.timeline_5min || []);
  const slots = generateTimeSlots(); // 288 slot

  return (
    <div className="p-3">
      <h2 className="text-[14px] font-semibold mb-2">
        Timeline Status Kamera per 5 Menit (WIB)
      </h2>
      
      {loading && (
        <div className="text-sm text-gray-500">Memuat data...</div>
      )}
      
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
      
      {!loading && !error && (
        <>
          <div className="flex w-full">
            {slots.map((slot) => {
              const status = statusPer5Min[slot];
              // status 1 = aktif (hijau), status 0 = tidak aktif (merah), undefined = tidak ada data (abu-abu)
              let bgColor = "bg-gray-500"; // default tidak ada data
              if (status === 1) bgColor = "bg-green-500"; // kamera aktif
              else if (status === 0) bgColor = "bg-red-500"; // kamera tidak aktif
              else if (status === null) bgColor = "bg-gray-500"; // kamera tidak aktif

              return (
                <div
                  key={slot}
                  title={`${slot} - Status: ${status !== undefined ? status === 1 ? 'Aktif' : 'Tidak Aktif' : "Tidak ada data"}`}
                  className={`${bgColor} w-2 h-5`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] mt-1 text-gray-600 font-mono">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:55</span>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraStatusTimeline;
