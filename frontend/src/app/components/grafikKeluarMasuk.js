"use client";
import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const VehicleChart = ({ rawData, category = "in" }) => {
  // Fungsi untuk memproses data mentah dari parent
  const processedData = useMemo(() => {
    if (!rawData || !rawData.labels) return { labels: [], values: [] };

    const aggregation = {};

    // Menggabungkan nilai berdasarkan label yang sama
    rawData.labels.forEach((label, index) => {
      const value = rawData.values[index] || 0;
      if (aggregation[label]) {
        aggregation[label] += value;
      } else {
        aggregation[label] = value;
      }
    });

    // Mengurutkan dari yang terbesar ke terkecil
    const sortedEntries = Object.entries(aggregation).sort((a, b) => b[1] - a[1]);

    return {
      labels: sortedEntries.map(entry => entry[0]),
      values: sortedEntries.map(entry => entry[1]),
    };
  }, [rawData]);

  const data = {
    labels: processedData.labels,
    datasets: [
      {
        label: 'Jumlah Unit',
        data: processedData.values,
        backgroundColor: category === "out" ? 'rgba(239, 68, 68, 0.62)' : 'rgba(16, 185, 129, 0.62)',
        borderColor: category === "out" ? 'rgba(185, 28, 28, 1)' : 'rgba(5, 150, 105, 1)',
        borderWidth: 1,
        borderRadius: 8,
        maxBarThickness: 48,
        barPercentage: 1,
        categoryPercentage: 0.95,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        reverse: category === "in" ? true : false,
        beginAtZero: true,
        ticks: {
          callback: (value) => Number(value || 0).toLocaleString('id-ID'),
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
      },
      y: {
        position: category === "out" ? 'right' : 'left',
        ticks: {
          autoSkip: false,
          color: '#334155',
          font: {
            size: 12,
            weight: '400',
          },
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
      },
    },
  };

  return (
    <div className="w-full p-2">
      <div style={{ height: `${processedData.labels.length * 44 + 120}px`, minHeight: '420px' }}>
        <Bar options={options} data={data} />
      </div>
    </div>
  );
};

export default VehicleChart;