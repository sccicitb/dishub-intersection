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

export default function ClassificationFlowBarChart({
  data = [],
  title = "Komposisi Kendaraan",
  subtitle = "Arus masuk dan keluar berdasarkan klasifikasi",
  height = 520,
}) {
  const rows = Array.isArray(data) ? data : [];

  const processed = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      const totalA = toNumber(a?.total_IN) + toNumber(a?.total_OUT);
      const totalB = toNumber(b?.total_IN) + toNumber(b?.total_OUT);
      return totalB - totalA;
    });

    const labels = sorted.map((item) => item?.code || item?.name || "-");
    const masuk = sorted.map((item) => toNumber(item?.total_IN));
    const keluar = sorted.map((item) => toNumber(item?.total_OUT));
    const total = sorted.reduce((acc, item) => acc + toNumber(item?.total_IN) + toNumber(item?.total_OUT), 0);

    return { sorted, labels, masuk, keluar, total };
  }, [rows]);

  const chartData = {
    labels: processed.labels,
    datasets: [
      {
        label: "Masuk",
        data: processed.masuk,
        backgroundColor: "rgba(16, 185, 129, 0.62)",
        borderColor: "rgba(5, 150, 105, 1)",
        borderWidth: 1,
        borderRadius: 8,
        barPercentage: 1,
        categoryPercentage: 0.95,
        maxBarThickness: 52,
      },
      {
        label: "Keluar",
        data: processed.keluar,
        backgroundColor: "rgba(239, 68, 68, 0.62)",
        borderColor: "rgba(185, 28, 28, 1)",
        borderWidth: 1,
        borderRadius: 8,
        barPercentage: 1,
        categoryPercentage: 0.95,
        maxBarThickness: 52,
      },
    ],
  };

  const options = {
    indexAxis: "x",
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 8,
        right: 12,
        bottom: 8,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const code = context?.[0]?.label;
            const found = processed.sorted.find((item) => (item?.code || item?.name) === code);
            return found?.name || code;
          },
          label: (ctx) => `${ctx.dataset.label}: ${toNumber(ctx.raw).toLocaleString("id-ID")} Unit`,
        },
      },
    },
    scales: {
      x: {
        offset: true,
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: {
            weight: '400',
          },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.2)",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => toNumber(value).toLocaleString("id-ID"),
          font: {
            weight: '400',
          },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.2)",
        },
      },
    },
  };

  return (
    <div className="bg-base-200/90 p-4 rounded-3xl backdrop-blur-sm shadow-gray-200">
      <div className="w-full p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight text-center sm:text-left">{title}</h3>
            <p className="text-sm text-slate-400 font-medium text-center sm:text-left">{subtitle}</p>
          </div>
          <div className="bg-blue-50 text-[#232f61] px-3 py-1 rounded-2xl border border-blue-100 shadow-sm">
            <span className="text-sm font-black opacity-60 block">Total Volume</span>
            <span className="text-lg font-black leading-none">
              {processed.total.toLocaleString("id-ID")} <small className="text-[9px] font-bold">UNIT</small>
            </span>
          </div>
        </div>

        {processed.labels.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-slate-300 font-medium italic">
            Data tidak ditemukan...
          </div>
        ) : (
          <div style={{ height }}>
            <Bar data={chartData} options={options} />
          </div>
        )}
      </div>
    </div>
  );
}
