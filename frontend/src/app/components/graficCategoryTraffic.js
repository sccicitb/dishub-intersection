"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import { vehicles } from '@/lib/apiAccess';

// Registrasi Chart.js
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

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

const TrafficDashboard = ({ category = "masuk" }) => {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const changeCategoryTitle = (cat) => {
    switch (cat) {
      case 'masuk':
        return 'Analisis Volume Kendaraan Masuk Per Jam';
      case 'keluar':
        return 'Analisis Volume Kendaraan Keluar Per Jam';
      default:
        return 'Analisis Volume Kendaraan Per Jam';
    }
  };


  // Contoh response API (statis untuk ilustrasi) 

  const fetchData = async () => {
    try {
      const apiResponse = {
        success: true,
        data: {
          simpang_id: "7",
          date: "2026-01-08",
          interval: "1hour",
          processingTime: "53ms",
          slotCount: 24,
          slots: {
            "00:00-00:59": {
              "Belok Kiri": { "Total": { "Sepeda Motor": 10, "Mobil Penumpang": 5, "Angkutan Umum": 2, "Truk Ringan": 1, "Bus Sedang": 0, "Truk Sedang": 0, "Truk Berat": 0, "Bus Besar": 0, "Gandeng/Semitrailer": 0, "Kendaraan Tidak Bermotor": 1, "Total": 19 } },
              "Lurus": { "Total": { "Sepeda Motor": 40, "Mobil Penumpang": 20, "Angkutan Umum": 5, "Truk Ringan": 2, "Bus Sedang": 1, "Truk Sedang": 0, "Truk Berat": 0, "Bus Besar": 0, "Gandeng/Semitrailer": 0, "Kendaraan Tidak Bermotor": 0, "Total": 68 } },
              "Belok Kanan": { "Total": { "Sepeda Motor": 15, "Mobil Penumpang": 8, "Angkutan Umum": 1, "Truk Ringan": 0, "Bus Sedang": 0, "Truk Sedang": 0, "Truk Berat": 0, "Bus Besar": 0, "Gandeng/Semitrailer": 0, "Kendaraan Tidak Bermotor": 2, "Total": 26 } }
            },
            "01:00-01:59": {
              "Belok Kiri": { "Total": { "Sepeda Motor": 5, "Mobil Penumpang": 2, "Angkutan Umum": 0, "Truk Ringan": 0, "Bus Sedang": 0, "Truk Sedang": 0, "Truk Berat": 0, "Bus Besar": 0, "Gandeng/Semitrailer": 0, "Kendaraan Tidak Bermotor": 0, "Total": 7 } },
              "Lurus": { "Total": { "Sepeda Motor": 20, "Mobil Penumpang": 10, "Angkutan Umum": 2, "Truk Ringan": 1, "Bus Sedang": 0, "Truk Sedang": 0, "Truk Berat": 0, "Bus Besar": 0, "Gandeng/Semitrailer": 0, "Kendaraan Tidak Bermotor": 0, "Total": 33 } },
              "Belok Kanan": { "Total": { "Sepeda Motor": 8, "Mobil Penumpang": 4, "Angkutan Umum": 0, "Truk Ringan": 0, "Bus Sedang": 0, "Truk Sedang": 0, "Truk Berat": 0, "Bus Besar": 0, "Gandeng/Semitrailer": 0, "Kendaraan Tidak Bermotor": 0, "Total": 12 } }
            },
            // ... (data jam 02:00 sampai 23:59 mengikuti pola ini)
          }
        }
      };
      setLoading(true);
      // Contoh pemanggilan: simpang_id=7, date=2026-01-08
      const response = await vehicles.getTrafficMatrixByFilter('4', '2026-01-09', '1hour');
      console.log(response.data.data)

      if (response.data.success === true) {
        setApiData(response.data.data);
      } else {
        setApiData(apiResponse.data)
        setError("Gagal memuat data dari server");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    if (!apiData || !apiData.slots) return null;

    const labels = Object.keys(apiData.slots);
    const categories = [
      "Sepeda Motor", "Mobil Penumpang", "Angkutan Umum",
      "Truk Ringan", "Bus Sedang", "Truk Sedang",
      "Truk Berat", "Bus Besar", "Gandeng/Semitrailer",
      "Kendaraan Tidak Bermotor"
    ];

    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#ec4899', '#06b6d4', '#71717a', '#b91c1c', '#4d7c0f'
    ];

    return {
      labels,
      datasets: categories.map((cat, index) => ({
        label: cat,
        data: labels.map(slotKey => {
          const s = apiData.slots[slotKey];
          // Menjumlahkan kategori yang sama dari semua arah (Kiri + Lurus + Kanan)
          return (s["Belok Kiri"].Total[cat] || 0) +
            (s["Lurus"].Total[cat] || 0) +
            (s["Belok Kanan"].Total[cat] || 0);
        }),
        borderColor: colors[index],
        backgroundColor: colors[index] + '33',
        tension: 0.4,
        pointRadius: 3,
        fill: false,
      }))
    };
  }, [apiData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-slate-500 animate-pulse">Sedang mengambil data lalu lintas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg max-w-2xl mx-auto mt-10">
        <span>{error}</span>
        <button onClick={fetchData} className="btn btn-sm">Coba Lagi</button>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, usePointStyle: true, padding: 20 }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
      title: {
        display: true,
        text: `Analisis Volume Kendaraan Per Jam - Simpang ${apiData.simpang_id}`,
        font: { size: 18, weight: 'bold' }
      }
    },
    scales: {
      x: {
        stacked: true, // Membuat bar menumpuk agar mudah melihat total volume
        grid: { display: false }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: { display: true, text: 'Jumlah Kendaraan' }
      }
    }
  };

  const optionsLine = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, padding: 20, font: { size: 11 } }
      },
      title: {
        display: true,
        text: `${changeCategoryTitle(category ?? "masuk")} (${apiData.date})`,
        font: { size: 16 },
        style: { fontWeight: 'bold', marginBottom: '20px'}
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Jumlah Kendaraan' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div className="p-1">
      <div className="mx-auto">

        {/* Chart Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <div className="h-[500px] md:w-full">
            {/* <Bar options={options} data={chartData} /> */}
            <Line options={optionsLine} data={chartData} />
          </div>
        </div>

        {/* Summary Table (DaisyUI) */}
        {/* <div className="mt-8 overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-100">
          <table className="table table-zebra w-full">
            <thead className="bg-gray-800 text-white text-center">
              <tr>
                <th>Jam</th>
                <th>Sepeda Motor</th>
                <th>Mobil</th>
                <th>Truk/Bus</th>
                <th>Total Volume</th>
              </tr>
            </thead>
            <tbody className="text-center font-medium">
              {Object.keys(apiData.slots).map((slot) => {
                const s = apiData.slots[slot];
                // Hitung total ringkasan per baris tabel
                const totalMotor = (s["Belok Kiri"].Total["Sepeda Motor"] + s["Lurus"].Total["Sepeda Motor"] + s["Belok Kanan"].Total["Sepeda Motor"]);
                const totalMobil = (s["Belok Kiri"].Total["Mobil Penumpang"] + s["Lurus"].Total["Mobil Penumpang"] + s["Belok Kanan"].Total["Mobil Penumpang"]);
                const totalBesar = (s["Belok Kiri"].Total["Truk Berat"] + s["Lurus"].Total["Truk Berat"] + s["Belok Kanan"].Total["Truk Berat"] + s["Belok Kiri"].Total["Bus Besar"] + s["Lurus"].Total["Bus Besar"] + s["Belok Kanan"].Total["Bus Besar"]);
                
                const grandTotal = s["Belok Kiri"].Total.Total + s["Lurus"].Total.Total + s["Belok Kanan"].Total.Total;

                return (
                  <tr key={slot}>
                    <td className="font-bold text-gray-600">{slot}</td>
                    <td>{totalMotor}</td>
                    <td>{totalMobil}</td>
                    <td>{totalBesar}</td>
                    <td className="text-blue-600 font-bold">{grandTotal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div> */}
      </div>
    </div>
  );
};

export default TrafficDashboard;