// import { useEffect, useRef } from 'react';
// import Chart from 'chart.js/auto';

// export default function HorizontalBarChart({ positionText, chartData }) {
//   const chartRef = useRef(null);
//   const chartInstance = useRef(null);

//   useEffect(() => {
//     // Bersihkan chart instance sebelumnya jika ada
//     if (chartInstance.current) {
//       chartInstance.current.destroy();
//     }

//     // Data untuk chart
//     const data = {
//       labels: chartData?.labels || ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
//       datasets: [
//         {
//           data: chartData?.values || [22.333, 22.333, 22.333, 22.333, 22.333],
//           backgroundColor: chartData?.color || '#4ade80', // Warna untuk bar
//           barThickness: chartData?.thickness || 30,
//         },
//       ],
//     };


//     // Konfigurasi chart
//     const config = {
//       type: 'bar',
//       data: data,
//       options: {
//         indexAxis: 'y', // Membuat bar menjadi horizontal
//         plugins: {
//           legend: {
//             display: false, // Sembunyikan legend
//           },
//           tooltip: {
//             enabled: true,
//           },
//           datalabels: {
//             display: false, // Sembunyikan label data internal
//           },
//         },
//         scales: {
//           x: {
//             grid: {
//               display: false,
//             },
//             ticks: {
//               display: false, // Sembunyikan ticks di sumbu X
//             },
//             border: {
//               display: false,
//             },
//             // Mengatur posisi bar dimulai dari kiri
//             reverse: positionText, // Membalik arah sumbu X sehingga nilai dimulai dari kanan ke kiri
//           },
//           y: {
//             grid: {
//               display: false,
//             },
//             ticks: {
//               color: '#1f2937',
//               font: {
//                 size: 14,
//               },
//               callback: function(value, index) {
//                 // Format untuk label di sumbu Y
//                 return `(22.5%) 22.333`;
//               },
//               align: 'end', // Menyelaraskan teks ke kanan
//               mirror: false, // Membalikkan posisi label
//             },
//             border: {
//               display: false,
//             },
//             position: positionText ? 'left' : 'right', // Memindahkan sumbu Y sesuai dengan prop positionText
//           },
//         },
//         responsive: true,
//         maintainAspectRatio: false,
//       },
//     };

//     // Buat chart baru
//     const ctx = chartRef.current.getContext('2d');
//     chartInstance.current = new Chart(ctx, config);

//     // Cleanup function
//     return () => {
//       if (chartInstance.current) {
//         chartInstance.current.destroy();
//       }
//     };
//   }, [positionText]); // Dependency array termasuk positionText agar chart di-update ketika prop berubah

//   return (
//     <div className="w-full max-w-lg">
//       <div className="h-64 bg-gray-50 p-4 rounded-lg">
//         <canvas ref={chartRef}></canvas>
//       </div>
//     </div>
//   );
// }

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function HorizontalBarChart({ positionText, chartData }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Bersihkan chart instance sebelumnya jika ada
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Gunakan data dari props atau fallback ke default jika tidak ada
    const data = {
      labels: chartData?.labels || ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
      datasets: [
        {
          data: chartData?.values || [22.333, 22.333, 22.333, 22.333, 22.333],
          backgroundColor: chartData?.color || '#4ade80',
          barThickness: chartData?.thickness || 30,
        },
      ],
    };

    // Konfigurasi chart
    const config = {
      type: 'bar',
      data: data,
      options: {
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context) {
                const label = chartData?.tooltipLabels?.[context.dataIndex] || '';
                return `${label}: ${context.raw} ${chartData?.format || ''}`;
              }
            }
          },
          datalabels: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              display: false,
            },
            border: {
              display: false,
            },
            reverse: positionText,
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#1f2937',
              font: {
                size: 14,
              },
              callback: function(value, index) {
                const dataValue = data.datasets[0].data[index];
                const percent = chartData?.percentages ? chartData.percentages[index] : '22.5%';
                const vehicleType = chartData?.vehicleTypes ? chartData.vehicleTypes[index] : '';
                
                // Hanya teks untuk label di Chart.js - icon akan ditampilkan via React
                return `${vehicleType} (${percent}) ${dataValue}`;
              },
              align: 'end',
              mirror: false,
            },
            border: {
              display: false,
            },
            position: positionText ? 'left' : 'right',
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    };

    // Buat chart baru
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, config);

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [positionText, chartData]);

  return (
    <div className="w-[90%] max-w-lg mx-auto">
      <div className="h-64 p-4 rounded-lg relative">
        <canvas ref={chartRef}></canvas>
        
        {/* Render ikon-ikon di sepanjang sumbu Y di sebelah label */}
        {chartData?.iconComponents && (
          <div className={`absolute inset-y-0 ${positionText ? ' -right-5 ' : ' -left-5 text-right '} flex flex-col justify-evenly pt-6 pb-3 pointer-events-none`}>
            {chartData.iconComponents.map((IconComponent, index) => (
              <div key={index} className="text-gray-600">
                {IconComponent && <IconComponent size={22} />}
              </div>
            ))}
          </div>
        )}
        {chartData?.directionRoad && (
          <div className={`absolute inset-y-0 ${positionText ? ' 2xl:-right-12  xl:text-center right-8 not-xl:shadow-accent-content text-gray-800' : 'left-8 text-left not-xs:shadow-accent-content text-gray-800 2xl:-left-12 not-xl:text-right '} flex flex-col justify-evenly pt-6 pb-3 pointer-events-none`}>
            {chartData.directionRoad.map((dataDirect, index) => (
              <div key={index}>
                {dataDirect}
              </div>
            ))}
          </div>
        )}
        
        {/* Render judul/ikon tengah
        {chartData?.centerIconComponent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center">
              <div className="text-lg font-medium">Kendaraan</div>
              <div className="text-sm text-gray-500">{chartData.centerTitle}</div>
              <div className="mt-2 text-gray-600">
                {chartData.centerIconComponent}
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}

// import { useState } from 'react';
// import { FaBicycle, FaCar, FaBus, FaTruck } from 'react-icons/fa';

// export default function BidirectionalBarChart() {
//   const [chartData] = useState([
//     {
//       label: 'Sepeda',
//       iconType: FaBicycle,
//       iconColor: "#ff7e00", // orange
//       leftValue: 22.333,
//       leftPercent: 22.5,
//       rightValue: 22.333,
//       rightPercent: 22.5,
//       leftColor: '#4ade80', // hijau
//       rightColor: '#ef4444', // merah
//     },
//     {
//       label: 'Mobil',
//       iconType: FaCar,
//       iconColor: "#22c55e", // green
//       leftValue: 22.333,
//       leftPercent: 22.5,
//       rightValue: 22.333,
//       rightPercent: 22.5,
//       leftColor: '#4ade80',
//       rightColor: '#ef4444',
//     },
//     {
//       label: 'Bus',
//       iconType: FaBus,
//       iconColor: "#1e3a8a", // dark blue
//       leftValue: 22.333,
//       leftPercent: 22.5,
//       rightValue: 22.333,
//       rightPercent: 22.5,
//       leftColor: '#4ade80',
//       rightColor: '#ef4444',
//     },
//     {
//       label: 'Truk',
//       iconType: FaTruck,
//       iconColor: "#dc2626", // red
//       leftValue: 22.333,
//       leftPercent: 22.5,
//       rightValue: 22.333,
//       rightPercent: 22.5,
//       leftColor: '#4ade80',
//       rightColor: '#ef4444',
//     },
//   ]);

//   // Menghitung nilai maksimum untuk skala
//   const maxValue = Math.max(
//     ...chartData.flatMap(item => [item.leftValue, item.rightValue])
//   );

//   return (
//     <div className="w-full bg-blue-50 p-6">
//       <div className="w-full max-w-4xl mx-auto">
//         {chartData.map((item, index) => {
//           const Icon = item.iconType;
//           return (
//             <div key={index} className="flex items-center justify-center my-5">
//               {/* Left value */}
//               <div className="w-32 text-right pr-2">
//                 <span className="text-sm font-medium text-gray-700">
//                   ({item.leftPercent}%) {item.leftValue}
//                 </span>
//               </div>
              
//               {/* Left bar */}
//               <div className="w-48">
//                 <div 
//                   className="h-6 rounded-md"
//                   style={{ 
//                     backgroundColor: item.leftColor,
//                     width: '100%'
//                   }}
//                 />
//               </div>
              
//               {/* Icon */}
//               <div className="flex justify-center items-center mx-2">
//                 <Icon size={24} color={item.iconColor} />
//               </div>
              
//               {/* Right bar */}
//               <div className="w-48">
//                 <div 
//                   className="h-6 rounded-md"
//                   style={{ 
//                     backgroundColor: item.rightColor,
//                     width: '100%'
//                   }}
//                 />
//               </div>
              
//               {/* Right value */}
//               <div className="w-32 pl-2">
//                 <span className="text-sm font-medium text-gray-700">
//                   ({item.rightPercent}%) {item.rightValue}
//                 </span>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }