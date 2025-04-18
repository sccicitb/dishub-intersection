// app/components/grafikRoad.jsx
"use client";
import { useEffect, useState } from 'react';
import TrafficFlowChart from './traficFlowChart';

export default function GrafikRoad() {
  const [trafficData, setTrafficData] = useState(null);
  
  useEffect(() => {
    // Sample traffic data - replace with actual data or API call
    const sampleData = {
      hours: ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00"],
      north: [420, 530, 580, 490, 510, 550, 620, 680, 720, 650, 600, 550, 480, 420, 390, 410, 380],
      south: [380, 450, 510, 470, 490, 520, 580, 640, 680, 610, 560, 510, 440, 380, 350, 370, 340],
      east: [320, 380, 420, 400, 410, 430, 480, 520, 550, 500, 470, 440, 380, 340, 310, 330, 300],
      west: [350, 410, 460, 430, 450, 470, 530, 570, 610, 550, 510, 480, 410, 370, 340, 360, 330]
    };
    
    setTrafficData(sampleData);
  }, []);

  return (
    <div className="w-full">
      <h2 className="text-xl font-medium mb-4 text-center">Lalu Lintas Jam-Jaman Rata-Rata</h2>
      
      {trafficData ? (
        <TrafficFlowChart trafficData={trafficData} />
      ) : (
        <div className="w-full h-96 flex items-center justify-center bg-gray-900 rounded-lg">
          <p className="text-white">Loading data...</p>
        </div>
      )}
    </div>
  );
}