"use client";

import { useEffect, useState } from "react";
// import ruangan from "@/app/data/ruangan.json";
// import gedungData from "@/app/data/gedung.json";
// import typeCamera from "@/app/data/typeCamera.json";
// import map from "@/app/data/floor.json";
// import { redirect } from "next/navigation";
import { useAuth } from "@/app/context/authContext";

import LintasChart from "@/app/components/lintasChart";
import { FaCar, FaTruck, FaBus, FaMotorcycle, FaBicycle } from "react-icons/fa";
import { FaArrowRightToBracket, FaArrowRightFromBracket } from "react-icons/fa6";
import TotalChart from "@/app/components/totalChart";
import MapComponent from "@/app/components/map";
import GrafikRoad from "@/app/components/roadChart";
import CameraStatusTimeline from "@/app/components/cameraStatusTime";

export default function Home() {
  // const { setLoading } = useAuth();

  const [activeFilter, setActiveFilter] = useState('day'); // Default to 'day' (Hari Ini)
  const [activeFilterSection2, setActiveFilterSection2] = useState('day');
  // const [chartData, setChartData] = useState(null);
  // const [isLoading, setIsLoading] = useState(true);

  const incomingVehicles = {
      labels: ['Mobil', 'Truk', 'Bus', 'Motor', 'Sepeda'],
      values: [342, 127, 89, 523, 64],
      percentages: ['30%', '11%', '8%', '46%', '5%'],
      vehicleTypes: ['Mobil', 'Truk', 'Bus', 'Motor', 'Sepeda'],
      iconComponents: [FaCar, FaTruck, FaBus, FaMotorcycle, FaBicycle],
      centerIconComponent: <FaArrowRightToBracket size={28} className="text-green-500" />,
      centerTitle: "Masuk",
      tooltipLabels: ['Mobil masuk', 'Truk masuk', 'Bus masuk', 'Motor masuk', 'Sepeda masuk'],
      color: '#4ade80',
      thickness: 25,
      format: 'unit'
    };
  
    // Data untuk kendaraan keluar
    const outgoingVehicles = {
      labels: ['Mobil', 'Truk', 'Bus', 'Motor', 'Sepeda'],
      values: [315, 118, 76, 498, 59],
      percentages: ['30%', '11%', '7%', '47%', '5%'],
      vehicleTypes: ['Mobil', 'Truk', 'Bus', 'Motor', 'Sepeda'],
      iconComponents: [FaCar, FaTruck, FaBus, FaMotorcycle, FaBicycle],
      centerIconComponent: <FaArrowRightFromBracket size={28} className="text-red-500" />,
      centerTitle: "Keluar",
      tooltipLabels: ['Mobil keluar', 'Truk keluar', 'Bus keluar', 'Motor keluar', 'Sepeda keluar'],
      color: '#BF3D3D',
      thickness: 25,
      format: 'unit'
    };
  
    const incomingVehiclesBar2 = {
      labels: ['Utara', 'Selatan', 'Timur', 'Barat'],
      values: [342, 127, 89, 523, 64],
      percentages: ['30%', '11%', '8%', '46%', '5%'],
      directionRoad: ['Utara', 'Selatan', 'Timur', 'Barat'],
      centerIconComponent: <FaArrowRightToBracket size={28} className="text-green-500" />,
      centerTitle: "Masuk",
      tooltipLabels: ['Utara masuk', 'Selatan masuk', 'Timur masuk', 'Barat masuk'],
      color: '#4ade80',
      thickness: 25,
      format: 'unit'
    };
  
    // Data untuk kendaraan keluar
    const outgoingVehiclesBar2 = {
      labels: ['Utara', 'Selatan', 'Timur', 'Barat'],
      values: [315, 118, 76, 498, 59],
      percentages: ['30%', '11%', '7%', '47%', '5%'],
      directionRoad: ['Utara', 'Selatan', 'Timur', 'Barat'],
      centerIconComponent: <FaArrowRightFromBracket size={28} className="text-red-500" />,
      centerTitle: "Keluar",
      tooltipLabels: ['Mobil keluar', 'Selatan keluar', 'Timur keluar', 'Barat keluar', 'Sepeda keluar'],
      color: '#BF3D3D',
      thickness: 25,
      format: 'unit'
    };
  
      const cameraStatusData = [
        // Interval 00:00 - 06:00 (Kamera menyala)
        { 
          start: new Date('2023-01-01T00:00:00').getTime(), 
          end: new Date('2023-01-01T06:00:00').getTime(), 
          status: true  // Menyala - Hijau
        },
        { 
          start: new Date('2023-01-01T06:00:00').getTime(), 
          end: new Date('2023-01-01T08:00:00').getTime(), 
          status: false  // Mati - Merah
        },
        { 
          start: new Date('2023-01-01T08:00:00').getTime(), 
          end: new Date('2023-01-01T12:00:00').getTime(), 
          status: true  // Menyala - Hijau
        },
        { 
          start: new Date('2023-01-01T12:00:00').getTime(), 
          end: new Date('2023-01-01T14:00:00').getTime(), 
          status: false  // Mati - Merah
        },
        { 
          start: new Date('2023-01-01T14:00:00').getTime(), 
          end: new Date('2023-01-01T18:00:00').getTime(), 
          status: true  // Menyala - Hijau
        },
        { 
          start: new Date('2023-01-01T18:00:00').getTime(), 
          end: new Date('2023-01-01T24:00:00').getTime(), 
          status: null  // Tidak aktif - Abu-abu
        }
      ];
      
      const handleFilterChange = (filter) => {
        setActiveFilter(filter);
      };
      const handleFilterSection2 = (filter) => {
        setActiveFilterSection2(filter);
      };
  return (
    <div className="p-4 text-base-700 flex flex-col items-center gap-8 overflow-y-hidden">
      <div className="w-[90%] bg-blue-950/90 text-center p-1.5 text-sm font-semibold text-white rounded-2xl">Jumlah Total Kendaraan</div>
      <div className="w-[90%]">
        <div className="flex flex-wrap gap-2 mb-8 justify-start">
          <button
            onClick={() => handleFilterChange('day')}
            className={`px-3 py-1.5 rounded-md ${
              activeFilter === 'day'
                ? 'bg-blue-950 text-white'
                : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => handleFilterChange('month')}
            className={`px-3 py-1.5 rounded-md ${
              activeFilter === 'month'
                ? 'bg-blue-950 text-white'
                : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => handleFilterChange('year')}
            className={`px-3 py-1.5 rounded-md ${
              activeFilter === 'year'
                ? 'bg-blue-950 text-white'
                : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
            }`}
          >
            Tahun Ini
          </button>
          <button
            onClick={() => handleFilterChange('period')}
            className={`px-3 py-1.5 rounded-md ${
              activeFilter === 'period'
                ? 'bg-blue-950 text-white'
                : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
            }`}
          >
            Periode Ini
          </button>
        </div>
        <TotalChart />
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 w-[90%] bg-base-200/90 p-4 rounded-3xl backdrop-blur-sm shadow-gray-200">
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-medium mb-2 text-center">Kendaraan Masuk</h2>
          <LintasChart positionText={true} chartData={incomingVehicles}/>
        </div>
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-medium mb-2 text-center">Kendaraan Keluar</h2>
          <LintasChart positionText={false} chartData={outgoingVehicles}/>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center not-xl:gap-2 gap-15 w-[90%] bg-base-200/90 p-4 rounded-3xl backdrop-blur-sm shadow-gray-200">
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-medium mb-2 text-center">Kendaraan Masuk</h2>
          <LintasChart positionText={true} chartData={incomingVehiclesBar2}/>
        </div>
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-medium mb-2 text-center">Kendaraan Keluar</h2>
          <LintasChart positionText={false} chartData={outgoingVehiclesBar2}/>
        </div>
      </div>
      <div className="w-[90%] h-fit bg-base-200/90 p-4 rounded-3xl backdrop-blur-sm shadow-base-100">
        <GrafikRoad />
        <div className="grid grid-cols-2 not-xl:grid-cols-1 gap-2 py-10">
          <div>
            <GrafikRoad />
          </div>
          <div>
          <GrafikRoad />
          </div>
        </div>
      </div>
      <div className="w-[90%]">
      <div className="w-full bg-blue-950/90 text-center p-1.5 text-sm font-semibold text-white rounded-2xl">Jumlah Total Kendaraan</div>
        <div className="flex flex-wrap gap-2 mt-8 justify-start">
          <button
            onClick={() => handleFilterSection2('day')}
            className={`px-3 py-1.5 rounded-md ${
              activeFilterSection2 === 'day'
                ? 'bg-blue-950 text-white'
                : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => handleFilterSection2('month')}
            className={`px-3 py-1.5 rounded-md ${
              activeFilterSection2 === 'month'
                ? 'bg-blue-950 text-white'
                : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => handleFilterSection2('year')}
            className={`px-3 py-1.5 rounded-md ${
              activeFilterSection2 === 'year'
                ? 'bg-blue-950 text-white'
                : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
            }`}
          >
            Tahun Ini
          </button>
          <button
            onClick={() => handleFilterSection2('period')}
            className={`px-3 py-1.5 rounded-md ${
              activeFilterSection2 === 'period'
                ? 'bg-blue-950 text-white'
                : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
            }`}
          >
            Periode Ini
          </button>
        </div>
        <div className="grid grid-cols-2 not-xl:grid-cols-1 gap-5 py-5">
          <div className="cols-1 bg-base-200/90 min-h-80 p-4 rounded-3xl backdrop-blur-sm shadow-gray-200 gap-5 flex flex-col">
            <div className="w-full h-80 bg-gray-950/90 text-center p-1.5 text-sm font-semibold text-white rounded-2xl"></div>
            <CameraStatusTimeline cameraStatusData={cameraStatusData}/>
          </div>
          <div className="cols-1 bg-base-200/90 min-h-80 p-4 rounded-3xl backdrop-blur-sm shadow-gray-200 gap-5 flex flex-col">
            <div className="w-full h-80 bg-gray-950/90 text-center p-1.5 text-sm font-semibold text-white rounded-2xl"></div>
            <CameraStatusTimeline cameraStatusData={cameraStatusData}/>
          </div>
        </div>
        <div className="h-fit bg-base-200/90 p-4 rounded-3xl backdrop-blur-sm shadow-base-100">
          <div className="grid grid-cols-2 not-xl:grid-cols-1 gap-2 py-10">
            <div>
              <GrafikRoad />
            </div>
            <div>
              <GrafikRoad />
            </div>
          </div>
        </div>
        <MapComponent />
      </div>
    </div>
  );
}
