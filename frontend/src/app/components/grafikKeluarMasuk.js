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
        backgroundColor: category === "out" ? '#BF3D3D' : '#4ADE80',
        borderRadius: 4,
        barThickness: 25, // Sesuai permintaan awal (thickness 25)
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
        display: true,
        text: 'Visualisasi Data Kendaraan ' + (category === "in" ? 'Masuk' : 'Keluar'),
        font: { size: 16 }
      },
    },
    scales: {
      x: {
        // border: {
        //   display: false,
        // },
        reverse: category === "in" ? true : false,
        beginAtZero: true,

      },
      y: {
        //   border: {
        //     display: false,
        //   },
        position: category === "out" ? 'right' : 'left',
        ticks: { autoSkip: false },

      },
    },
  };

  return (
    <div className="w-full p-4 ">
      <div style={{ height: `${processedData.labels.length * 40 + 100}px`, minHeight: '400px' }}>
        <Bar options={options} data={data} />
      </div>
    </div>
  );
};

export default VehicleChart;