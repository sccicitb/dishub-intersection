"use client";

import { useEffect, useState } from "react";

export default function RecentVehicle({ customCSS, data }) {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    if (data?.message?.detections?.length > 0) {
      setVehicles(prev => {
         // Limit list size to prevent memory issues if running long
         const newList = [
          ...prev,
          { 
            data: data.message.detections, 
            image: data.message.image_url, 
            timestamp: data.message.timestamp, 
            id_simpang: data.message.id_simpang 
          }
        ];
        // Keep last 100 items
        if (newList.length > 100) return newList.slice(newList.length - 100);
        return newList;
      });
    }
  }, [data]);

  return (
    <div className={`flex w-2/3 not-lg:w-full flex-col bg-white overflow-hidden ${customCSS || 'h-96'}`}>
      <div className="py-3 font-semibold text-lg">
        Riwayat Deteksi Terkini
      </div>
      <div className="overflow-auto flex-1 p-0">
        <table className="table border-2 h-full table-xs w-full table-pin-rows">
          <thead >
            <tr>
              <th className="border-2 text-center">Waktu</th>
              <th className="border-2 text-center">Simpang</th>
              <th className="border-2 text-center">Deteksi</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-[12px] text-gray-500">
                  Menunggu data deteksi...
                </td>
              </tr>
            ) : (
              vehicles.slice().reverse().map((event, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="align-top">
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold">
                        {event.timestamp ? new Date(event.timestamp).toLocaleTimeString('id-ID', { hour12: false }) : '-'}
                      </span>
                      <span className="text-gray-500 scale-90 origin-top-left">
                        {event.timestamp ? new Date(event.timestamp).toLocaleDateString('id-ID') : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="align-top text-xs">
                    {event.id_simpang || '-'}
                  </td>
                  <td className="align-top">
                   <div className="flex flex-col gap-1">
                      {event.data.map((item, i) => (
                        <span key={i} className="badge badge-ghost badge-xs gap-1 h-auto py-0.5 text-xs text-left justify-start">
                           <span className="font-semibold">{item.class}</span> 
                           <span className="text-gray-500 font-normal">({item.dari_arah})</span>
                        </span>
                      ))}
                   </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}