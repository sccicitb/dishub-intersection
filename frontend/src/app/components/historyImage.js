"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

const FlowHistory = ({ location }) => {
  const [flowHistory, setFlowHistory] = useState([]);
  const [filter, setFilter] = useState({
    simpang: "",
    date: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  function capitalizeText(string) {
    if (!string || typeof string !== "string") return "";
    return string
      .split("_")
      .map(part =>
        part
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ")
      )
      .join("_");
  }

  const { flowData, latestFlow: socketLatest } = useSocket();

  useEffect(() => {
    if (socketLatest) {
      setLatestFlow(socketLatest);
      // Optionally append to history
      setFlowHistory(prev => [socketLatest, ...prev].slice(0, 100));
    }
  }, [socketLatest]);

  const loadFlowHistory = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (location) params.append("simpang", location);
      if (filter.simpang) params.append("simpang", filter.simpang);
      if (filter.date) params.append("date", filter.date);
      
      const response = await fetch(`/api/flow-history?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setFlowHistory(data.results || []);
      
    } catch (err) {
      console.error("Failed to fetch flow history:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlowHistory();
  }, [location, filter.simpang, filter.date]);

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadFlowHistory();
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString || 'Unknown date';
    }
  };

  return (
    <div className="bg-base-300 p-5 m-2 rounded-xl">
      <h2 className="text-xl font-bold mb-4">Riwayat Flow Data {location ? `- ${capitalizeText(location)}` : 'Semua Simpang'}</h2>
      
      {/* Filter Form */}
      <form onSubmit={handleFilterSubmit} className="mb-4">
        <div className="flex flex-wrap gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Simpang:</label>
            <input
              type="text"
              name="simpang"
              value={filter.simpang}
              onChange={handleFilterChange}
              className="p-2 border rounded"
              placeholder="e.g. SIMPANG_X"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal:</label>
            <input
              type="date"
              name="date"
              value={filter.date}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            />
          </div>
          
          <div className="self-end">
            <button
              type="submit"
              className="p-2 bg-blue-500 text-base-300 rounded"
            >
              Filter
            </button>
          </div>
        </div>
      </form>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {latestFlow && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded-lg">
          <h3 className="font-bold text-green-800 mb-2">📡 Live Update Terbaru:</h3>
          <p><strong>Simpang:</strong> {latestFlow.ID_Simpang}</p>
          <p><strong>Arah:</strong> {latestFlow.tipe_pendekat} {latestFlow.arah_per_kelas ? Object.keys(latestFlow.arah_per_kelas)[0] : ''}</p>
          <p><strong>Total Kendaraan:</strong> {latestFlow.total_vehicles || 'N/A'}</p>
          <p className="text-sm text-green-700"><em>{new Date(latestFlow.waktu).toLocaleString('id-ID')}</em></p>
        </div>
      )}

      {loading ? (
        <p>Loading flow history...</p>
      ) : flowHistory.length === 0 ? (
        <p>Tidak ada data flow ditemukan</p>
      ) : (
        <div>
          <p className="mb-2">Ditemukan {flowHistory.length} records</p>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Simpang</th>
                  <th>Arah</th>
                  <th>Total Kendaraan</th>
                  <th>waktu</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {flowHistory.slice(0, 50).map((flow, index) => (
                  <tr key={index}>
                    <td>{capitalizeText(flow.ID_Simpang)}</td>
                    <td>{flow.direction}</td>
                    <td className="font-bold">{flow.total_vehicles}</td>
                    <td>{formatDate(flow.waktu)}</td>
                    <td className="text-xs">{flow.source || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowHistory;
