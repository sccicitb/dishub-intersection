"use client";

import React from "react";

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

// Fungsi untuk mengambil status per 5 menit
const getStatusPer5Minutes = (dataArray) => {
  if (!Array.isArray(dataArray)) return {};

  const statusMap = {};

  dataArray.forEach((item) => {
    const date = new Date(item.recorded_at);
    const hour = date.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      hourCycle: "h23",
    });
    const minute = date.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      minute: "2-digit",
    });

    const roundedMinute = (Math.floor(parseInt(minute) / 5) * 5)
      .toString()
      .padStart(2, "0");
    const timeSlot = `${hour}:${roundedMinute}`;

    const status = item.status === 1 ? 1 : 0;

    // Simpan status jika belum ada atau status 1 (error) lebih prioritas
    if (!(timeSlot in statusMap) || status === 1) {
      statusMap[timeSlot] = status;
    }
  });

  return statusMap;
};

const filterLogsByDate = (logs, targetDate) => {
  if (!Array.isArray(logs) || !targetDate) return [];

  const targetDateStr = new Date(targetDate).toISOString().split("T")[0];

  return logs.filter((log) => {
    if (!log.recorded_at) return false;
    const logDateStr = new Date(log.recorded_at).toISOString().split("T")[0];
    return logDateStr === targetDateStr;
  });
};

const CameraStatusTimeline = ({ cameraStatusData = [], selectedDate = null }) => {
  const filteredData = selectedDate
    ? filterLogsByDate(cameraStatusData, selectedDate)
    : cameraStatusData;

  const statusPer5Min = getStatusPer5Minutes(filteredData);
  const slots = generateTimeSlots(); // 288 slot

  return (
    <div className="p-3">
      <h2 className="text-[14px] font-semibold mb-2">
        Timeline Status Kamera per 5 Menit (WIB)
      </h2>
      <div className="flex w-full">
        {slots.map((slot) => {
          const status = statusPer5Min[slot];
          let bgColor = "bg-red-500"; // default mati (tidak ada data)
          if (status === 0) bgColor = "bg-green-500"; // kamera hidup
          else if (status === 1) bgColor = "bg-yellow-400"; // kamera error / status 1

          return (
            <div
              key={slot}
              title={`${slot} - Status: ${status !== undefined ? status === 0 ? 'Menyala' : 'Mati' : "tidak ada data"}`}
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
    </div>
  );
};

export default CameraStatusTimeline;
