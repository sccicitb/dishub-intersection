import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ClassificationChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!data || data.length === 0 || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');

    // Mengurutkan berdasarkan total volume agar grafik terlihat rapi (descending)
    const sortedData = [...data].sort((a, b) => {
        const totalA = (a.total_IN || 0) + (a.total_OUT || 0);
        const totalB = (b.total_IN || 0) + (b.total_OUT || 0);
        return totalB - totalA;
    });
    
    const labels = sortedData.map(item => item.code || item.name);
    const dataIn = sortedData.map(item => item.total_IN || 0);
    const dataOut = sortedData.map(item => item.total_OUT || 0);

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'MASUK',
            data: dataIn,
            backgroundColor: '#4ADE80', // Hijau sesuai style kamu
            borderRadius: 4,
            barThickness: 20, // Sedikit lebih ramping agar ketika berdampingan tetap tebal (total 40px+ per grup)
            borderSkipped: false,
          },
          {
            label: 'KELUAR',
            data: dataOut,
            backgroundColor: '#BF3D3D', // Merah sesuai style kamu
            borderRadius: 4,
            barThickness: 20,
            borderSkipped: false,
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
                usePointStyle: true,
                pointStyle: 'rectRounded',
                padding: 15,
                font: { size: 12, family: "'Inter', sans-serif", weight: '600' }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            titleColor: '#1e293b',
            titleFont: { size: 14, weight: 'bold' },
            bodyColor: '#475569',
            bodyFont: { size: 13 },
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            callbacks: {
              title: (context) => {
                 const code = context[0].label;
                 const item = sortedData.find(d => (d.code || d.name) === code);
                 return item ? item.name : code;
              },
              label: (context) => ` ${context.dataset.label}: ${Number(context.raw).toLocaleString('id-ID')} Unit`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#f1f5f9', drawBorder: false },
            ticks: { color: '#94a3b8', font: { size: 11 } }
          },
          y: {
            grid: { display: false },
            ticks: {
              font: { size: 12, weight: '600' },
              color: '#334155',
              padding: 10
            }
          }
        },
        interaction: { mode: 'nearest', axis: 'y', intersect: false },
        layout: { padding: { right: 20, top: 10 } }
      }
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [data]);

  const totalKendaraan = data?.reduce((acc, curr) => acc + (curr.total_IN || 0) + (curr.total_OUT || 0), 0) || 0;

  return (
    <div className="bg-slate-50/50 p-4 lg:p-6 rounded-[2rem] border border-slate-100">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col h-full min-h-[750px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Komposisi Kendaraan</h3>
              <p className="text-sm text-slate-400">Arus Masuk & Keluar Berdasarkan Klasifikasi</p>
            </div>
            <div className="bg-blue-50 text-[#232f61] px-3 py-1 rounded-2xl border border-blue-100 shadow-sm">
                <span className="text-sm font-black opacity-60 block">Total Volume</span>
                <span className="text-lg font-black leading-none">
                    {totalKendaraan.toLocaleString('id-ID')} <small className="text-[9px] font-bold">UNIT</small>
                </span>
            </div>
        </div>
        
        <div className="flex-grow w-full relative">
            {!data || data.length === 0 ? (
                 <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-medium italic">
                    Data tidak ditemukan...
                 </div>
            ) : (
                 <canvas ref={chartRef}></canvas>
            )}
        </div>
      </div>
    </div>
  );
};

export default ClassificationChart;