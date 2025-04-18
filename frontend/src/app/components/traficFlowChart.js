// app/components/TrafficFlowChart.jsx
"use client";
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function TrafficFlowChart({ trafficData }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!trafficData || !chartRef.current) return;

    // Extract data from props
    const { hours, north, south, east, west } = trafficData;
    
    // Calculate average of all directions
    const averageData = hours.map((_, idx) => {
      return (north[idx] + south[idx] + east[idx] + west[idx]) / 4;
    });
    
    // Calculate highest 15 minutes values (simulated as 20% higher than hourly average)
    const peakData = averageData.map(val => val * 1.2);

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hours,
        datasets: [
          {
            label: 'LJR (Rata-Rata)',
            data: averageData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
          },
          {
            label: '4 x V 15 menit tertinggi',
            data: peakData,
            backgroundColor: 'rgba(255, 99, 132, 0.0)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            pointRadius: 0,
          },
          {
            label: 'Utara',
            data: north,
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            hidden: true,
            tension: 0.4,
            pointRadius: 2,
          },
          {
            label: 'Selatan',
            data: south,
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            hidden: true,
            tension: 0.4,
            pointRadius: 2,
          },
          {
            label: 'Timur',
            data: east,
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            hidden: true,
            tension: 0.4,
            pointRadius: 2,
          },
          {
            label: 'Barat',
            data: west,
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
            hidden: true,
            tension: 0.4,
            pointRadius: 2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false,
            text: 'Lalu Lintas Jam-Jaman Rata-Rata',
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              boxWidth: 15,
              color: '#D3D3D3'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Waktu',
              font: {
                weight: 'bold'
              },
              padding: {
                top: 10
              },
              color: '#D3D3D3'
            },
            ticks: {
              color: '#D3D3D3'
            },
            grid: {
              display: false
            }
          },
          y: {
            title: {
              display: true,
              text: 'Kendal/Jam',
              font: {
                weight: 'bold'
              },
              color: '#D3D3D3'
            },
            ticks: {
              color: '#D3D3D3'
            },
            beginAtZero: true,
            grid: {
              color: 'rgba(200, 200, 200, 0.2)'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [trafficData]);

  return (
    <div className="w-full h-full bg-base-100 py-10 px-5 rounded-2xl shadow-xs overflow-x-auto">
      <div className="h-96 not-xl:w-fit min-w-full">
        <canvas ref={chartRef} className="w-full h-full"></canvas>
      </div>
    </div>
  );
}