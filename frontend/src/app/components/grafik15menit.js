"use client";
import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const TrafficIntervalChart = ({ rawResponse }) => {
  const chartData = useMemo(() => {
    if (!rawResponse) return { labels: [], datasets: [] };

    const labels = rawResponse.data.map(item => item.jam);
    const dataIn = rawResponse.data.map(item => item.total_IN);
    const dataOut = rawResponse.data.map(item => item.total_OUT);

    return {
      labels,
      datasets: [
        {
          label: 'Masuk',
          data: dataIn,
          borderColor: 'rgba(5, 150, 105, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.40)',
          fill: true,
          tension: 0.1,
          pointHoverRadius: 5,
          borderWidth: 2,
        },
        {
          label: 'Keluar',
          data: dataOut,
          borderColor: 'rgba(185, 28, 28, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.10)',
          fill: true,
          tension: 0.1,
          pointHoverRadius: 5,
          borderWidth: 2,
        },
      ],
    };
  }, [rawResponse]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { usePointStyle: true, boxWidth: 10, padding: 20 },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString('id-ID')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 12,
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: {
          font: { size: 11 },
          callback: (value) => Number(value).toLocaleString('id-ID'),
        },
      },
    },
  };

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-700 mb-1">
        Analisis Arus Lalu Lintas per Interval 15 Menit
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Total kendaraan masuk dan keluar per interval 15 menit dalam periode aktif.
      </p>
      <div className="h-96">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

export default TrafficIntervalChart;