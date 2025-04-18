// components/CameraStatusTimeline.jsx
"use client";
import { useState } from 'react';

export default function CameraStatusTimeline({ cameraStatusData }) {
  const [tooltipInfo, setTooltipInfo] = useState({ visible: false, text: '', position: 0 });
  
  // Fungsi untuk mendapatkan warna berdasarkan status
  const getStatusColor = (status) => {
    if (status === true) return 'bg-green-500';
    if (status === false) return 'bg-red-500';
    return 'bg-gray-300'; // Untuk status null atau undefined
  };

  // Handle mouse over untuk menampilkan tooltip
  const handleMouseOver = (event, segment) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = event.clientX - rect.left;
    
    const startHour = new Date(segment.start).getHours();
    const endHour = new Date(segment.end).getHours();
    const status = segment.status ? 'Menyala' : 'Mati';
    
    setTooltipInfo({
      visible: true,
      text: `${startHour}:00 - ${endHour}:00: Kamera ${status}`,
      position: position
    });
  };

  // Handle mouse out untuk menyembunyikan tooltip
  const handleMouseOut = () => {
    setTooltipInfo({ ...tooltipInfo, visible: false });
  };

  return (
    <div className="w-full bg-base-100/90 p-4 rounded-2xl shadow-xs">
      {/* <h2 className="text-xl font-medium mb-4">Status Kamera 24 Jam</h2> */}
      
      <div className="relative w-full h-5 bg-gray-200 rounded-lg overflow-hidden flex">
        {cameraStatusData.map((segment, index) => {
          // Hitung persentase lebar berdasarkan durasi
          const startHour = new Date(segment.start).getHours();
          const endHour = new Date(segment.end).getHours();
          const duration = endHour - startHour;
          const widthPercent = (duration / 24) * 100;
          
          return (
            <div
              key={index}
              className={`h-full cursor-pointer ${getStatusColor(segment.status)}`}
              style={{ width: `${widthPercent}%` }}
              onMouseOver={(e) => handleMouseOver(e, segment)}
              onMouseOut={handleMouseOut}
            ></div>
          );
        })}
        
        {tooltipInfo.visible && (
          <div 
            className="absolute bottom-full mb-2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap"
            style={{ left: `${tooltipInfo.position}px`, transform: 'translateX(-50%)' }}
          >
            {tooltipInfo.text}
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:59</span>
      </div>
      
      {/* <div className="flex items-center mt-4 gap-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
          <span className="text-sm">Kamera Menyala</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
          <span className="text-sm">Kamera Mati</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-300 rounded-sm mr-2"></div>
          <span className="text-sm">Tidak Aktif</span>
        </div>
      </div> */}
    </div>
  );
}