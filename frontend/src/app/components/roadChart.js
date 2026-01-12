// app/components/grafikRoad.jsx
"use client";
import { useEffect, useState } from 'react';
import TrafficFlowChart from '@/app/components/trafficChart';
import { vehicles } from '@/lib/apiAccess';

export default function GrafikRoad({ filter = 'day', simpang_id = 'semua', startDate = null, endDate = null }) {
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        setLoading(true);
  
        // getRataPerJam hanya support preset filters (day/week/month/year), tidak support customrange
        // Jadi untuk customrange, hanya fetch getRataPer15Menit
        let hourlyResponse, hourlyData;
        
        if (filter === 'customrange') {
          // Skip getRataPerJam untuk customrange, gunakan null
          hourlyData = null;
        } else {
          hourlyResponse = await vehicles.getByJam(filter, simpang_id);
          hourlyData = hourlyResponse.data?.data;
        }
        
        const minuteResponse = await vehicles.getByMinute(filter, simpang_id, filter === 'customrange' ? startDate : null, filter === 'customrange' ? endDate : null);
        const minuteData = minuteResponse.data?.data;
  
        // console.log("Hourly data:", hourlyData);
        // console.log("Minute data:", minuteData);
  
        if (Array.isArray(minuteData)) {
          // Jika hourlyData kosong, gunakan minuteData saja
          const formattedData = hourlyData && Array.isArray(hourlyData) 
            ? formatTrafficData(hourlyData, minuteData)
            : formatTrafficDataFromMinute(minuteData);
          setTrafficData(formattedData || []);
        } else {
          throw new Error("Minute data is not available");
        }
      } catch (err) {
        console.error("Error fetching traffic data:", err);
        setError("Failed to load traffic data. Please try again later.");
        setTrafficData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrafficData();
  }, [filter, simpang_id, startDate, endDate]);

  // Format API data for the chart component

  const formatTrafficData = (hourlyData, minuteData) => {
    try {
      if (!hourlyData || hourlyData.length === 0 || !minuteData || minuteData.length === 0) {
        console.warn("Empty data received from API");
        return null;
      }
      
      // Urutkan data berdasarkan jam untuk memastikan konsistensi
      const sortedHourlyData = [...hourlyData].sort((a, b) => parseInt(a.jam) - parseInt(b.jam));
      
      // Buat array 24 jam (0-23)
      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      
      // Inisialisasi array dengan nilai 0
      const inData = Array(24).fill(0);
      const outData = Array(24).fill(0);
      
      // Isi array dengan data dari API
      sortedHourlyData.forEach(item => {
        const jam = parseInt(item.jam);
        if (jam >= 0 && jam < 24) {
          inData[jam] = parseInt(item.total_IN) || 0;
          outData[jam] = parseInt(item.total_OUT) || 0;
        }
      });
      
      const north = inData.map(val => Math.round(val * 0.3));  // 30% of IN traffic
      const south = outData.map(val => Math.round(val * 0.3)); // 30% of OUT traffic
      const east = inData.map(val => Math.round(val * 0.2));   // 20% of IN traffic
      const west = outData.map(val => Math.round(val * 0.2));  // 20% of OUT traffic
      
      // Hitung peak 15-minute values untuk setiap jam
      const peakData = findPeak15MinData(minuteData);
      
      // Pastikan semua data valid dan tidak null/undefined
      const validatedPeakData = peakData.map(val => isNaN(val) ? 0 : val);
      
      // // Log the final formatted data to debug
      // console.log("Formatted data:", {
      //   hours,
      //   inData,
      //   outData,
      //   peakData: validatedPeakData
      // });
      
      return {
        hours,
        north,
        south,
        east,
        west,
        inData,
        outData,
        peakData: validatedPeakData
      };
    } catch (err) {
      console.error("Error formatting traffic data:", err);
      return null;
    }
  };

  // Format traffic data dari minute data saja (untuk customrange)
  const formatTrafficDataFromMinute = (minuteData) => {
    try {
      if (!minuteData || minuteData.length === 0) {
        console.warn("Empty minute data received");
        return null;
      }

      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      const inData = Array(24).fill(0);
      const outData = Array(24).fill(0);

      // Aggregate minute data by hour
      minuteData.forEach(item => {
        const jam = parseInt(item.jam);
        if (jam >= 0 && jam < 24) {
          inData[jam] += parseInt(item.total_IN) || 0;
          outData[jam] += parseInt(item.total_OUT) || 0;
        }
      });

      const north = inData.map(val => Math.round(val * 0.3));
      const south = outData.map(val => Math.round(val * 0.3));
      const east = inData.map(val => Math.round(val * 0.2));
      const west = outData.map(val => Math.round(val * 0.2));

      const peakData = findPeak15MinData(minuteData);
      const validatedPeakData = peakData.map(val => isNaN(val) ? 0 : val);

      return {
        hours,
        north,
        south,
        east,
        west,
        inData,
        outData,
        peakData: validatedPeakData
      };
    } catch (err) {
      console.error("Error formatting minute data:", err);
      return null;
    }
  };

  // Calculate peak 15-minute values for each hour
  const findPeak15MinData = (minuteData) => {
    try {
      const peakValues = Array(24).fill(0);
      
      // Group data by hour
      minuteData.forEach(item => {
        const hour = parseInt(item.jam);
        if (hour >= 0 && hour < 24) {
          const inValue = parseInt(item.total_IN) || 0;
          
          if (inValue > peakValues[hour]) {
            peakValues[hour] = inValue;
          }
        }
      });
      
      // Multiply by 4 to get hourly rate
      return peakValues.map(val => val * 4);
    } catch (err) {
      console.error("Error calculating peak data:", err);
      return Array(24).fill(0);
    }
  };

  if (!trafficData || !Array.isArray(trafficData.hours)) return null;

  return (
    <div className="w-full">
      <h2 className="text-xl font-medium mt-4 text-center">Lalu Lintas Jam-Jaman Rata-Rata</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-96">
          <p className="text-red-500">{error}</p>
        </div>
      ) : !trafficData ? (
        <div className="flex justify-center items-center h-96">
          <p className="text-yellow-500">Data tidak tersedia</p>
        </div>
      ) : (
        <TrafficFlowChart trafficData={trafficData} />
      )}
    </div>
  );
}