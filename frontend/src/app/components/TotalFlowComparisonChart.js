"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const toNumber = (value) => Number(value) || 0;

export default function TotalFlowComparisonChart({
  diyData = [],
  simpangData = [],
  simpangName = "Simpang",
}) {
  const diy = diyData?.[0] || {};
  const simpang = simpangData?.[0] || {};

  const labels = useMemo(() => ["DIY", simpangName], [simpangName]);

  const chartData = useMemo(() => {
    const masukDIY = toNumber(diy.masuk);
    const keluarDIY = toNumber(diy.keluar);
    const masukSimpang = toNumber(simpang.masuk);
    const keluarSimpang = toNumber(simpang.keluar);

    return {
      labels,
      datasets: [
        {
          label: "Masuk",
          data: [masukDIY, masukSimpang],
          backgroundColor: "rgba(16, 185, 129, 0.62)",
          borderColor: "rgba(5, 150, 105, 1)",
          borderWidth: 1,
          borderRadius: 8,
          barPercentage: 0.7,
          categoryPercentage: 0.7,
        },
        {
          label: "Keluar",
          data: [keluarDIY, keluarSimpang],
          backgroundColor: "rgba(239, 68, 68, 0.62)",
          borderColor: "rgba(185, 28, 28, 1)",
          borderWidth: 1,
          borderRadius: 8,
          barPercentage: 0.7,
          categoryPercentage: 0.7,
        },
      ],
    };
  }, [diy.masuk, diy.keluar, simpang.masuk, simpang.keluar, labels]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${toNumber(ctx.raw).toLocaleString("id-ID")}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => toNumber(value).toLocaleString("id-ID"),
        },
      },
    },
  };

  return (
    <div className="bg-base-200/90 p-4 rounded-3xl backdrop-blur-sm shadow-gray-200">
      <div className="w-full p-4 rounded-2xl bg-white shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">
          Perbandingan Total Kendaraan Keluar-Masuk DIY vs {simpangName}
        </h3>
        <p className="text-sm text-slate-500 mb-3">
          Menampilkan total kendaraan Masuk dan Keluar antara DIY dan simpang yang dipilih.
        </p>
        <div className="h-72">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}
