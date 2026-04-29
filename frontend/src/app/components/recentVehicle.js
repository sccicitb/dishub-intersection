"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { maps } from "@/lib/apiService";

const resolveSocketUrl = () => {
  const envSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (envSocketUrl) return envSocketUrl;

  const envBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envBackendUrl) return envBackendUrl;

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:9090";
};


export default function RecentVehicle ({ customCSS }) {
  const [vehicles, setVehicles] = useState([]);
  const [simpangMap, setSimpangMap] = useState({});

  useEffect(() => {
    maps.getAllSimpang().then(res => {
      const map = {};
      const rawData = Array.isArray(res.data.simpang) ? res.data.simpang : (Array.isArray(res.data) ? res.data : []);
      rawData.forEach(s => {
        const id = s.id; 
        map[id] = s.Nama_Simpang;
      });

      setSimpangMap(map);
    }).catch(err => {
      console.error("Gagal mengambil data simpang:", err);
    });
  }, []);

  useEffect(() => {
    const socket = io(resolveSocketUrl(), {
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      console.log("✅ Connected to websocket:", socket.id);
    });

    socket.on("flow_update", (data) => {
      if (!data) return;

      const detectionList = data.detections || [];

      setVehicles(prev => {
        const newList = [
          ...prev,
          {
            data: detectionList,
            timestamp: data.waktu,
            id_simpang: data.ID_Simpang
          }
        ];

        // Simpan 100 riwayat terakhir saja
        return newList.length > 100 ? newList.slice(newList.length - 100) : newList;
      });
    });

    socket.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className={`flex w-2/3 min-h-full not-lg:w-full flex-col bg-white overflow-hidden shadow-sm border-2 border-gray-300 rounded-lg ${customCSS || 'h-96'}`}>
      <div className="py-3 px-4 font-semibold text-lg border-b bg-gray-50 flex justify-between items-center">
        <span>Riwayat Deteksi Terkini</span>
        <span className="badge badge-success badge-xs">Realtime</span>
      </div>

      <div className="overflow-auto flex-1 p-0">
        <table className="table table-xs w-full table-pin-rows border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-b border-r text-center py-2 w-24">Waktu</th>
              <th className="border-b border-r text-center w-20">Simpang</th>
              <th className="border-b text-center">Deteksi Kendaraan</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-10 text-gray-400 italic">
                  Menunggu transmisi data dari sensor...
                </td>
              </tr>
            ) : (
              // slice().reverse() agar data terbaru selalu di paling atas
              vehicles.slice().reverse().map((event, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors">
                  <td className="align-top border-b border-r p-2">
                    <div className="flex flex-col text-center">
                      <span className="font-bold text-blue-700">
                        {event.timestamp ? event.timestamp.split(' ')[1] : '-'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {event.timestamp ? event.timestamp.split(' ')[0] : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="align-top border-b border-r text-center font-medium p-2 text-nowrap">
                    {/* {event.id_simpang} */}
                    {simpangMap[event.id_simpang] ? `${simpangMap[event.id_simpang]}` : ""}
                  </td>
                  <td className="align-top border-b p-2">
                    <div className="flex flex-wrap gap-1">
                      {event.data.length > 0 ? (
                        event.data.map((item, i) => (
                          <span
                            key={i}
                            className="badge badge-ghost border-gray-300 gap-1 h-auto py-2 px-2 text-[11px] font-medium uppercase"
                          >
                            <span className="text-blue-600">{item.class}</span>
                            <span className="text-gray-400 font-normal lowercase italic text-[9px]">
                              ({item.dari_arah})
                            </span>
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-400 italic text-center w-full">Tidak ada objek terdeteksi</span>
                      )}
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