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
  Filler
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
  Filler
);

const TrafficIntervalChart = ({ rawResponse }) => {
  const chartData = useMemo(() => {
    if (!rawResponse) return { labels: [], datasets: [] };

    // Mengambil label langsung dari field "jam" (ex: 00:00-00:15)
    const labels = rawResponse.data.map(item => item.jam);
    const dataIn = rawResponse.data.map(item => item.total_IN);
    const dataOut = rawResponse.data.map(item => item.total_OUT);

    return {
      labels,
      datasets: [
        {
          label: 'Total Masuk (IN)',
          data: dataIn,
          borderColor: '#4ADE80',
          backgroundColor: 'rgba(74, 222, 128, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'Total Keluar (OUT)',
          data: dataOut,
          borderColor: '#BF3D3D',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
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
        labels: { usePointStyle: true, boxWidth: 10, padding: 20}
      },
      title: {
        display: true,
        text: 'Analisis Arus Lalu Lintas per Interval 15 Menit',
        align: 'start',
        font: { size: 18, weight: 'bold' },
        padding: { bottom: 30 }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: { display: true },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
          font: { size: 11 }
        }
      },
      y: {
        beginAtZero: true,
        border: { display: true },
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          font: { size: 11 }
        }
      }
    },
  };

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="h-[450px]">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

export default TrafficIntervalChart;