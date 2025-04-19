// app/components/grafikRoad.jsx
"use client";
import { useEffect, useState } from 'react';
import TrafficFlowChart from './traficFlowChart';
import { vehicles } from '@/lib/apiAccess';
export default function GrafikRoad() {
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        setLoading(true);
        
        // Fetch hourly data
        const hourlyResponse = await vehicles.getByJam();
        const hourlyData = hourlyResponse;
        
        // Fetch 15-minute data
        const minuteResponse = await vehicles.getByMinute();
        const minuteData = minuteResponse;
        
        if (hourlyData.status === 200 && minuteData.status === 200) {
          // Format data for the chart
          const formattedData = formatTrafficData(hourlyData.data.data, minuteData.data.data);
          setTrafficData(formattedData);
        } else {
          throw new Error("Failed to fetch traffic data");
        }
      } catch (err) {
        console.error("Error fetching traffic data:", err);
        setError("Failed to load traffic data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrafficData();
  }, []);

  // Format API data for the chart component
  const formatTrafficData = (hourlyData, minuteData) => {
    // Create hours array (0-23)
    const hours = hourlyData.map(item => `${item.jam}:00`);
    
    // Extract IN and OUT data
    const inData = hourlyData.map(item => parseInt(item.total_IN));
    const outData = hourlyData.map(item => parseInt(item.total_OUT));
    
    const north = inData.map(val => Math.round(val * 0.3));  // 30% of IN traffic
    const south = outData.map(val => Math.round(val * 0.3)); // 30% of OUT traffic
    const east = inData.map(val => Math.round(val * 0.2));   // 20% of IN traffic
    const west = outData.map(val => Math.round(val * 0.2));  // 20% of OUT traffic
    
    // Find the peak 15-minute values for each hour
    const peakData = findPeak15MinData(minuteData);
    
    return {
      hours,
      north,
      south,
      east,
      west,
      inData,
      outData,
      peakData
    };
  };

  // Calculate peak 15-minute values for each hour
  const findPeak15MinData = (minuteData) => {
    const peakValues = {};
    
    // Group data by hour
    minuteData.forEach(item => {
      const hour = item.jam;
      const inValue = parseInt(item.total_IN);
      
      if (!peakValues[hour] || inValue > peakValues[hour]) {
        peakValues[hour] = inValue;
      }
    });
    
    // Convert to array matching the hours order
    return Array.from({ length: 24 }, (_, i) => peakValues[i] ? peakValues[i] * 4 : 0);
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-medium mb-4 text-center">Lalu Lintas Jam-Jaman Rata-Rata</h2>
      
      {loading ? (
        <div className="w-full h-96 flex items-center justify-center bg-base-100 rounded-lg">
          <p className="text-white">Loading data...</p>
        </div>
      ) : error ? (
        <div className="w-full h-96 flex items-center justify-center bg-base-100 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <TrafficFlowChart trafficData={trafficData} />
      )}
    </div>
  );
}