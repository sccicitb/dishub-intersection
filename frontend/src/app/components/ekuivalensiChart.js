import React, { useEffect, useRef, useState } from 'react';
import * as Chart from 'chart.js';

// Register ALL Chart.js components including LineController
Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.PointElement,
  Chart.LineElement,
  Chart.LineController,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend
);

const RainfallChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load and process data
  useEffect(() => {
    // Using fallback data since we can't import external JSON files
    const fallbackData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Utara',
          data: [180, 220, 250, 280, 320, 300, 280, 260, 240, 200, 180, 160],
          borderColor: '#FFC107',
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Timur',
          data: [160, 180, 200, 240, 280, 320, 340, 320, 280, 240, 200, 170],
          borderColor: '#17A2B8',
          backgroundColor: 'rgba(23, 162, 184, 0.1)',
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Selatan',
          data: [200, 240, 280, 300, 280, 260, 240, 220, 200, 180, 160, 140],
          borderColor: '#28A745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Barat',
          data: [140, 160, 180, 200, 220, 240, 260, 280, 300, 280, 240, 200],
          borderColor: '#DC3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Total',
          data: [680, 800, 910, 1020, 1100, 1120, 1120, 1080, 1020, 900, 780, 670],
          borderColor: '#6C757D',
          backgroundColor: 'rgba(108, 117, 125, 0.2)',
          borderWidth: 3,
          fill: true
        }
      ]
    };

    const processedData = {
      labels: fallbackData.labels,
      datasets: fallbackData.datasets.map(dataset => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: dataset.borderColor,
        backgroundColor: dataset.backgroundColor,
        tension: 0.4,
        pointRadius: 1,
        borderWidth: dataset.borderWidth || 2,
        fill: dataset.fill || false,
      }))
    };

    setChartData(processedData);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!chartData || loading || !chartRef.current) {
      return;
    }

    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '',
          font: {
            size: 16,
            weight: 'bold',
          },
          padding: 20,
        },
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Waktu',
            font: {
              size: 14,
            },
          },
          grid: {
            display: false,
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Kend / Jam',
            font: {
              size: 14,
            },
          },
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
    };

    try {
      chartInstance.current = new Chart.Chart(ctx, {
        type: 'line',
        data: chartData,
        options: options,
      });
    } catch (error) {
      console.error('Error creating chart:', error);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, loading]);

  // Calculate averages for display cards
  const calculateAverage = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) return 0;
    return Math.round(data.reduce((sum, val) => sum + val, 0) / data.length);
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData || !chartData.datasets) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600">Error: No chart data available</p>
            <p className="text-sm text-gray-500 mt-2">Please check your data structure</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px] lg:max-w-[700px] max-w-6xl mx-auto p-6 rounded-lg">
        <div className="relative h-96 w-full">
          <canvas ref={chartRef} className="w-full h-full"></canvas>
        </div>
      </div>
    </div>
  );

};

export default RainfallChart;