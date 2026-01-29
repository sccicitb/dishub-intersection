"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { vehicles } from '@/lib/apiAccess';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrafficTrendComponent = ({ category = "in", dateRange = {}, id_simpang = 2, nama_simpang = "" }) => {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const categoryLabel = category === 'in' ? 'IN' : 'OUT';
  
  const { startDate = "", endDate = "" } = dateRange;
  
  const categoryTrafficOpt = (cat) => {
    switch (cat) {
      case 'in':
        return 'masuk';
      case 'out':
        return 'keluar';
      default:
        return 'masuk';
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Panggil API (Simpang 4 sesuai response contoh)
      const response = await vehicles.getVehicleDetailByHour(id_simpang, startDate, endDate, '1hour');

      if (response.status === 200) {
        setApiData(response.data); // Simpan seluruh objek response
      } else {
        setError("Gagal mengambil data dari server");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, category, id_simpang]);

  // Mapping Data khusus untuk format Array di dalam Slot
  const chartData = useMemo(() => {
    if (!apiData || !apiData.slots) return null;

    const labels = Object.keys(apiData.slots);

    // Mapping singkatan API ke Nama Label yang Bagus
    const vehicleMapping = [
      { key: 'SM', label: 'Sepeda Motor', color: '#3b82f6' },
      { key: 'MP', label: 'Mobil Penumpang', color: '#ef4444' },
      { key: 'AUP', label: 'Angkutan Umum', color: '#10b981' },
      { key: 'TR', label: 'Truk Ringan', color: '#f59e0b' },
      { key: 'BS', label: 'Bus Sedang', color: '#8b5cf6' },
      { key: 'TS', label: 'Truk Sedang', color: '#ec4899' },
      { key: 'BB', label: 'Bus Besar', color: '#06b6d4' },
      { key: 'GANDENG', label: 'Gandeng', color: '#b91c1c' },
      { key: 'KTB', label: 'Kendaraan Tak Bermotor', color: '#4d7c0f' }
    ];

    return {
      labels,
      datasets: vehicleMapping.map((v) => ({
        label: v.label,
        data: labels.map(slotKey => {
          const directions = apiData.slots[slotKey]; // Ini adalah Array [{arah: 'north', IN: {...}}, ...]
          // Jumlahkan nilai kategori (misal: SM) dari semua arah yang ada di array
          return directions.reduce((sum, item) => sum + (item[categoryLabel][v.key] || 0), 0);
        }),
        borderColor: v.color,
        backgroundColor: v.color + '20', // transparansi 20%
        tension: 0.3,
        pointRadius: 2,
        fill: false,
      }))
    };
  }, [apiData]);

  // Handle Loading & Error sebelum merender Options agar tidak crash
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <span className="loading loading-bars loading-lg text-primary"></span>
    </div>
  );

  if (error || !apiData) return (
    <div className="alert alert-error">
      <span>Error: {error || "Data kosong"}</span>
    </div>
  );

  const optionsLine = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, font: { size: 10 }, usePointStyle: true }
      },
      title: {
        display: true,
        text: `Trend Kendaraan Masuk (${[categoryLabel]}) - Simpang ${String(apiData.simpang_id).charAt(0).toUpperCase() + String(apiData.simpang_id).slice(1)} ${nama_simpang !== "Semua Simpang" ? `- ${nama_simpang}` : ''} `,
        font: { size: 16 }
      },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Jumlah Unit' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="card bg-base-200 border border-base-200">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <div>{apiData.date}</div>
        </div>

        <div className="h-[400px] w-full">
          <Line options={optionsLine} data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default TrafficTrendComponent;