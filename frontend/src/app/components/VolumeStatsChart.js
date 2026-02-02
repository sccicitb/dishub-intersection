"use client";
import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getRequest } from '@/lib/apiService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function VolumeStatsChart() {
    // Default to a single day
    const [selectedDate, setSelectedDate] = useState('2026-01-29');
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [detailedView, setDetailedView] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Format for API: YYYY-MM-DD HH:mm:ss
            // Single day from 00:00:00 to 23:59:59
            const start = `${selectedDate} 00:00:00`;
            const end = `${selectedDate} 23:59:59`;

            const res = await getRequest(`/audit/volume-stats?startDate=${start}&endDate=${end}`);
            
            if (res?.data) {
                setStats(res.data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); // Run once on mount

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    const exportToExcel = () => {
        if (stats.length === 0) return;

        // Create CSV content
        const headers = ['Waktu', 'Total Lalin Per Menit', 'Volume Arah Lengkap', 'Volume Arah Parsial', 'Volume Arah NULL'];
        const csvRows = [
            headers.join(','),
            ...stats.map(row => [
                row.Menit,
                row.Total_Lalin_Per_Menit || 0,
                row.Volume_Arah_Lengkap || 0,
                row.Volume_Arah_Parsial || 0,
                row.Volume_Arah_NULL || 0
            ].join(','))
        ];
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `volume-stats-${selectedDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToStyledExcel = async () => {
        if (stats.length === 0) return;

        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Volume Stats');

        // Add headers with styling
        worksheet.columns = [
            { header: 'Waktu', key: 'waktu', width: 20 },
            { header: 'Total Lalin Per Menit', key: 'total', width: 25 },
            { header: 'Volume Arah Lengkap', key: 'lengkap', width: 25 },
            { header: 'Volume Arah Parsial', key: 'parsial', width: 25 },
            { header: 'Volume Arah NULL', key: 'null', width: 22 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        // Add data rows
        stats.forEach(row => {
            worksheet.addRow({
                waktu: row.Menit,
                total: row.Total_Lalin_Per_Menit || 0,
                lengkap: row.Volume_Arah_Lengkap || 0,
                parsial: row.Volume_Arah_Parsial || 0,
                null: row.Volume_Arah_NULL || 0
            });
        });

        // Add borders to all cells
        worksheet.eachRow({ includeEmpty: false }, (row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Generate buffer and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `volume-stats-${selectedDate}.xlsx`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const chartData = {
        labels: stats.map(d => {
             // Show only time for cleaner x-axis if dates are same, else show date time
             const date = new Date(d.Menit);
             return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }),
        datasets: [
            {
                label: 'Total Lalin / Menit',
                data: stats.map(d => d.Total_Lalin_Per_Menit),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                barPercentage: 1.0,
                categoryPercentage: 1.0,
            },
            {
                label: 'Vol Arah Lengkap',
                data: stats.map(d => d.Volume_Arah_Lengkap),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                barPercentage: 1.0,
                categoryPercentage: 1.0,
            },
            {
                label: 'Vol Arah Parsial',
                data: stats.map(d => d.Volume_Arah_Parsial),
                borderColor: 'rgb(251, 191, 36)',
                backgroundColor: 'rgba(251, 191, 36, 0.5)',
                barPercentage: 1.0,
                categoryPercentage: 1.0,
            },
            {
                label: 'Vol Arah NULL',
                data: stats.map(d => d.Volume_Arah_NULL),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                barPercentage: 1.0,
                categoryPercentage: 1.0,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Statistik Volume Lalu Lintas per Menit',
            },
            tooltip: {
                callbacks: {
                    title: (context) => {
                        return stats[context[0].dataIndex]?.Menit;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div className="p-6 relative bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Statistik Volume Lalu Lintas</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 mb-8 items-end bg-gray-50 p-4 rounded-md">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Pilih Tanggal (Satu Hari Penuh)</label>
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input input-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="flex">
                    <button 
                        type="submit" 
                        className="btn btn-sm bg-indigo-900 text-white rounded-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Memuat...' : 'Terapkan Filter'}
                    </button>
                    
                    {stats.length > 0 && (
                        <div className="ml-4 flex items-center gap-4">
                            {/* <div className="text-sm text-gray-600">
                                Memuat {stats.length} titik data
                            </div> */}
                            <button
                                type="button"
                                onClick={() => setDetailedView(!detailedView)}
                                className="btn btn-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                            >
                                {detailedView ? '📊 Tampilan Ringkas' : '🔍 Tampilan Detail'}
                            </button>
                            <button
                                type="button"
                                onClick={exportToExcel}
                                className="btn btn-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                            >
                                Export CSV
                            </button>
                            <button
                                type="button"
                                onClick={exportToStyledExcel}
                                className="btn btn-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                            >
                                Export Excel
                            </button>
                        </div>
                    )}
                </div>
            </form>

            <div className={`h-[500px] w-full ${detailedView ? 'overflow-x-auto' : ''}`}>
                {stats.length > 0 ? (
                    <div style={{ height: '100%', width: detailedView ? `${Math.max(stats.length * 3, 2000)}px` : '100%' }}>
                        <Bar options={options} data={chartData} />
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-md">
                        {loading ? 'Mengambil data...' : 'Tidak ada data untuk ditampilkan. Silakan sesuaikan filter.'}
                    </div>
                )}
            </div>
        </div>
    );
}
