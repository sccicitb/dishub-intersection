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

export default function MasukKeluarDirectionBarChart({
  rows = [],
  simpangId,
  startDate,
  endDate,
  autoFetch = true,
  title = "Kendaraan Masuk vs Keluar per Arah",
  height = 360,
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
        setFetchedRows(Array.isArray(response?.data?.data) ? response.data.data : []);
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
        backgroundColor: "rgba(16, 185, 129, 0.85)",
        borderColor: "rgba(5, 150, 105, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: "Keluar",
        data: processed.keluarValues,
        backgroundColor: "rgba(239, 68, 68, 0.85)",
        borderColor: "rgba(185, 28, 28, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
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
        ticks: {
          callback: (value) => formatNumber(Math.abs(value)),
        },
        title: {
          display: true,
          text: "Jumlah Kendaraan",
        },
      },
      y: {
        stacked: false,
        title: {
          display: true,
          text: "Arah",
        },
      },
    },
  };

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-4">
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
      {!loading && !error ? <div style={{ height }}>
        <Bar data={data} options={options} />
      </div> : null}
    </div>
  );
}
