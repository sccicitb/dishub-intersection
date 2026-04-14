"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { vehicleSummary } from "@/lib/apiService";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BASE_DIRECTIONS = ["North", "South", "East", "West"];

const normalizeDirection = (value = "") => String(value).trim().toLowerCase();

const formatNumber = (value) => {
  const safeValue = Number(value) || 0;
  return new Intl.NumberFormat("id-ID").format(safeValue);
};

const getNiceAxisBound = (maxAbsValue) => {
  const safeMax = Math.max(1, Number(maxAbsValue) || 0);
  const padded = safeMax * 1.1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(padded)));
  return Math.ceil(padded / magnitude) * magnitude;
};

export default function MasukKeluarDirectionBarChart({
  rows = [],
  simpangId,
  startDate,
  endDate,
  autoFetch = true,
  title = "Kendaraan Masuk vs Keluar per Arah",
  height = 400,
  directionKey = "Direction_To",
  masukKey = "Kendaraan_Masuk",
  keluarKey = "Kendaraan_Keluar",
  showLegend = true,
}) {
  const [fetchedRows, setFetchedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const useApi = autoFetch && simpangId && startDate && endDate;

  useEffect(() => {
    let mounted = true;

    const fetchRows = async () => {
      if (!useApi) {
        setFetchedRows([]);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await vehicleSummary.getMasukKeluarBySimpang(
          simpangId,
          startDate,
          endDate
        );

        if (!mounted) return;
        setFetchedRows(Array.isArray((simpangId === "semua" ? response?.data?.summary_per_arah : response?.data?.data ) || []) ? (simpangId === "semua" ? response?.data?.summary_per_arah : response?.data?.data ) : []);
      } catch (err) {
        if (!mounted) return;
        setFetchedRows([]);
        setError(err?.response?.data?.message || "Gagal mengambil data masuk/keluar.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRows();

    return () => {
      mounted = false;
    };
  }, [useApi, simpangId, startDate, endDate]);

  const chartRows = useApi
    ? fetchedRows
    : Array.isArray(rows)
      ? rows
      : [];

  const processed = useMemo(() => {
    const mapByDirection = {
      north: { masuk: 0, keluar: 0 },
      south: { masuk: 0, keluar: 0 },
      east: { masuk: 0, keluar: 0 },
      west: { masuk: 0, keluar: 0 },
    };

    chartRows.forEach((item) => {
      const direction = normalizeDirection(item?.[directionKey]);
      if (!mapByDirection[direction]) return;

      mapByDirection[direction].masuk += Number(item?.[masukKey]) || 0;
      mapByDirection[direction].keluar += Number(item?.[keluarKey]) || 0;
    });

    const labels = BASE_DIRECTIONS;
    const masukValues = labels.map((label) => {
      const key = normalizeDirection(label);
      return -(mapByDirection[key]?.masuk || 0);
    });
    const keluarValues = labels.map((label) => {
      const key = normalizeDirection(label);
      return mapByDirection[key]?.keluar || 0;
    });

    return { labels, masukValues, keluarValues };
  }, [chartRows, directionKey, masukKey, keluarKey]);

  const data = {
    labels: processed.labels,
    datasets: [
      {
        label: "Masuk",
        data: processed.masukValues,
        grouped: false,
        backgroundColor: "rgba(16, 185, 129, 0.62)",
        borderColor: "rgba(5, 150, 105, 1)",
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 40,
        barPercentage: 0.9,
        categoryPercentage: 0.85,
      },
      {
        label: "Keluar",
        data: processed.keluarValues,
        grouped: false,
        backgroundColor: "rgba(239, 68, 68, 0.62)",
        borderColor: "rgba(185, 28, 28, 1)",
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 40,
        barPercentage: 0.9,
        categoryPercentage: 0.85,
      },
    ],
  };

  const xAxisBound = useMemo(() => {
    const masukMax = Math.max(...processed.masukValues.map((v) => Math.abs(v)), 0);
    const keluarMax = Math.max(...processed.keluarValues.map((v) => Math.abs(v)), 0);
    return getNiceAxisBound(Math.max(masukMax, keluarMax));
  }, [processed.masukValues, processed.keluarValues]);

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 5,
        bottom: 5,
      },
    },
    plugins: {
      legend: { display: showLegend, position: "top" },
      title: {
        display: Boolean(title),
        text: title,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const raw = Number(ctx.raw) || 0;
            return `${ctx.dataset.label}: ${formatNumber(Math.abs(raw))}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        min: -xAxisBound,
        max: xAxisBound,
        grace: 0,
        ticks: {
          callback: (value) => formatNumber(Math.abs(value)),
          font: {
            weight: '400',
          },
        },
        grid: {
          color: (ctx) => (ctx.tick.value === 0 ? "rgba(15, 23, 42, 0.35)" : "rgba(148, 163, 184, 0.2)"),
          lineWidth: (ctx) => (ctx.tick.value === 0 ? 1.5 : 1),
        },
        title: {
          display: true,
          text: "Jumlah Kendaraan",
        },
      },
      y: {
        stacked: false,
        offset: true,
        ticks: {
          font: {
            weight: '400',
          },
        },
        title: {
          display: true,
          text: "Arah",
        },
      },
    },
  };

  return (
    <div className="w-full rounded-lg border border-slate-200/70 bg-white/60 p-4 backdrop-blur-[1px]">
      {loading ? (
        <div className="flex h-full min-h-[160px] items-center justify-center text-sm text-gray-500">
          Memuat data grafik...
        </div>
      ) : null}
      {!loading && error ? (
        <div className="flex h-full min-h-[160px] items-center justify-center text-sm text-red-600">
          {error}
        </div>
      ) : null}
      {!loading && !error ? <div style={{ height }} >
        <Bar data={data} options={options} />
      </div> : null}
    </div>
  );
}
