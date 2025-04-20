"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/authContext";


import LintasChart from "@/app/components/lintasChart";
import { FaCar, FaTruck, FaBus, FaMotorcycle, FaBicycle, FaShuttleVan, FaTractor, FaTruckMoving, FaCaravan } from "react-icons/fa";
import { FaArrowRightToBracket, FaArrowRightFromBracket } from "react-icons/fa6";
import TotalChart from "@/app/components/totalChart";
import MapComponent from "@/app/components/map";
import GrafikRoad from "@/app/components/roadChart";
import CameraStatusTimeline from "@/app/components/cameraStatusTime";
import { vehicles } from "@/lib/apiAccess";

const calculatePercentage = (value, total) => {
  const sum = parseFloat(value) + parseFloat(total);
  return sum > 0 ? (parseFloat(value) / sum * 100).toFixed(1) : 0;
};

export default function Home() {
  // State variables
  const [vehicleData, setVehicleData] = useState(null);
  // Inisialisasi state dengan nilai default
  const [chartData, setChartData] = useState([{
    name: 'Today',
    masuk: 0,
    keluar: 0,
    masukPercentage: 0,
    keluarPercentage: 0
  }]);

  const [ioByArahData, setIOByArahData] = useState([{
    
  }]);

  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('day');
  const [activeFilterSection2, setActiveFilterSection2] = useState('day');

  // Vehicle data objects
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

  const [incomingVehiclesBar2, setIncomingVehiclesBar2] = useState({
    labels: [],
    values: [],
    percentages: [],
    vehicleTypes: [],
    // iconComponents: [],
    directionRoad: [],
    color: '#4ade80',
    thickness: 25,
    format: 'unit'
  });
  
  const [outgoingVehiclesBar2, setOutgoingVehiclesBar2] = useState({
    labels: [],
    values: [],
    percentages: [],
    vehicleTypes: [],
    // iconComponents: [],
    directionRoad: [],
    color: '#BF3D3D',
    thickness: 25,
    format: 'unit'
  });
  
  
  // const incomingVehiclesBar2 = {
  //   labels: ['Utara', 'Selatan', 'Timur', 'Barat'],
  //   values: [342, 127, 89, 523, 64],
  //   percentages: ['30%', '11%', '8%', '46%', '5%'],
  //   directionRoad: ['Utara', 'Selatan', 'Timur', 'Barat'],
  //   centerTitle: "Masuk",
  //   tooltipLabels: ['Utara masuk', 'Selatan masuk', 'Timur masuk', 'Barat masuk'],
  //   color: '#4ade80',
  //   thickness: 25,
  //   format: 'unit'
  // };

  // const outgoingVehiclesBar2 = {
  //   labels: ['Utara', 'Selatan', 'Timur', 'Barat'],
  //   values: [315, 118, 76, 498, 59],
  //   percentages: ['30%', '11%', '7%', '47%', '5%'],
  //   directionRoad: ['Utara', 'Selatan', 'Timur', 'Barat'],
  //   centerTitle: "Keluar",
  //   tooltipLabels: ['Mobil keluar', 'Selatan keluar', 'Timur keluar', 'Barat keluar', 'Sepeda keluar'],
  //   color: '#BF3D3D',
  //   thickness: 25,
  //   format: 'unit'
  // };

  const cameraStatusData = [
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

  // Fetch data on component mount and when activeFilter changes
  useEffect(() => {
   
    const fetchVehicleTypeData = async () => {
      try {
        const response = await vehicles.getByTipe();
        
        if (response.status === 200 && response.data.data.length > 0) {
          // Process the data for incoming and outgoing vehicles
          const processedData = processVehicleData(response.data.data);
          setVehicleData(processedData);
          console.log(processedData)
        
        }else {
          throw new Error('Invalid data format received');
        }
        
      } catch (error) {
        setVehicleData([]);
        console.error("Error fetching vehicle type data:", error);
      }
    };

    const processVehicleData = (data) => {
      // Define vehicle type mappings and icons
      const vehicleTypes = {
        'SM': { name: 'Sepeda Motor', icon: FaMotorcycle },
        'MP': { name: 'Mobil Penumpang', icon: FaCar },
        'AUP': { name: 'Angkutan Umum', icon: FaShuttleVan },
        'TR': { name: 'Truk', icon: FaTruck },
        'BS': { name: 'Bus', icon: FaBus },
        'TS': { name: 'Truk Sedang', icon: FaTruckMoving },
        'TB': { name: 'Truk Besar', icon: FaTruck },
        'BB': { name: 'Bus Besar', icon: FaBus },
        'GANDENG': { name: 'Truk Gandeng', icon: FaTruckMoving },
        'KTB': { name: 'Kendaraan Tidak Bermotor', icon: FaCaravan }
      };
    
      // Extract and sort vehicle data
      const vehicleData = [];
      
      data.forEach(item => {
        // Find which vehicle type has value 1
        for (const [key, value] of Object.entries(item)) {
          if (value === 1 && vehicleTypes[key]) {
            vehicleData.push({
              type: key,
              name: vehicleTypes[key].name,
              icon: vehicleTypes[key].icon,
              totalIn: parseInt(item.total_IN, 10),
              totalOut: parseInt(item.total_OUT, 10)
            });
            break;
          }
        }
      });
    
      // Sort by total incoming vehicles (descending)
      vehicleData.sort((a, b) => b.totalIn - a.totalIn);
    
      // Calculate total incoming and outgoing
      const totalIn = vehicleData.reduce((sum, item) => sum + item.totalIn, 0);
      const totalOut = vehicleData.reduce((sum, item) => sum + item.totalOut, 0);
    
      // Prepare data for charts
      const incomingVehicles = {
        labels: vehicleData.map(item => item.name),
        values: vehicleData.map(item => item.totalIn),
        percentages: vehicleData.map(item => `${((item.totalIn / totalIn) * 100).toFixed(1)}%`),
        vehicleTypes: vehicleData.map(item => item.name),
        iconComponents: vehicleData.map(item => item.icon),
        tooltipLabels: vehicleData.map(item => `${item.name} masuk`),
        // directionRoad: vehicleData.map(item => `Masuk`),
        color: '#4ade80',
        thickness: 25,
        format: 'unit'
      };
    
      const outgoingVehicles = {
        labels: vehicleData.map(item => item.name),
        values: vehicleData.map(item => item.totalOut),
        percentages: vehicleData.map(item => `${((item.totalOut / totalOut) * 100).toFixed(1)}%`),
        vehicleTypes: vehicleData.map(item => item.name),
        iconComponents: vehicleData.map(item => item.icon),
        tooltipLabels: vehicleData.map(item => `${item.name} keluar`),
        // directionRoad: vehicleData.map(item => `Keluar`),
        color: '#BF3D3D',
        thickness: 25,
        format: 'unit'
      };
    
      return {
        incomingVehicles,
        outgoingVehicles,
        rawData: vehicleData
      };
    };
    const fetchByArah = async () => {
      try {
        const response = await vehicles.getByArah();
        
        if (response.status === 200 && response.data.data.length > 0) {
          const apiData = response.data.data;
          
          // Definisi icon untuk masing-masing arah
          // const directionIcons = {
          //   east: FaArrowRight,
          //   north: FaArrowUp,
          //   west: FaArrowLeft,
          //   south: FaArrowDown
          // };
          
          // Warna untuk masing-masing arah
          // const directionColors = {
          //   east: '#4ade80',
          //   north: '#60a5fa',
          //   west: '#f59e0b',
          //   south: '#8b5cf6'
          // };
          
          // Data untuk kendaraan masuk
          const incomingValues = apiData.map(item => parseInt(item.total_IN));
          const incomingTotal = incomingValues.reduce((a, b) => a + b, 0);
          const incomingPercentages = apiData.map(item => 
            ((parseInt(item.total_IN) / incomingTotal) * 100).toFixed(0) + '%'
          );
          
          // Data untuk kendaraan keluar
          const outgoingValues = apiData.map(item => parseInt(item.total_OUT));
          const outgoingTotal = outgoingValues.reduce((a, b) => a + b, 0);
          const outgoingPercentages = apiData.map(item => 
            ((parseInt(item.total_OUT) / outgoingTotal) * 100).toFixed(0) + '%'
          );
          
          // Format data untuk chart masuk
          const incomingVehiclesBar2 = {
            labels: apiData.map(item => item.arah.charAt(0).toUpperCase() + item.arah.slice(1)),
            values: incomingValues,
            percentages: incomingPercentages,
            vehicleTypes: apiData.map(item => item.arah.charAt(0).toUpperCase() + item.arah.slice(1)),
            // iconComponents: apiData.map(item => directionIcons[item.arah] || null),
            directionRoad: apiData.map(item => item.arah.charAt(0).toUpperCase() + item.arah.slice(1)),
            // centerIconComponent: <FaArrowRightToBracket size={28} className="text-green-500" />,
            centerTitle: "Masuk",
            tooltipLabels: apiData.map(item => `${item.arah.charAt(0).toUpperCase() + item.arah.slice(1)} masuk`),
            color: '#4ade80',
            thickness: 25,
            format: 'unit'
          };
          
          // Format data untuk chart keluar
          const outgoingVehiclesBar2 = {
            labels: apiData.map(item => item.arah.charAt(0).toUpperCase() + item.arah.slice(1)),
            values: outgoingValues,
            percentages: outgoingPercentages,
            vehicleTypes: apiData.map(item => item.arah.charAt(0).toUpperCase() + item.arah.slice(1)),
            // iconComponents: apiData.map(item => directionIcons[item.arah] || null),
            directionRoad: apiData.map(item => item.arah.charAt(0).toUpperCase() + item.arah.slice(1)),
            // centerIconComponent: <FaArrowRightFromBracket size={28} className="text-red-500" />,
            centerTitle: "Keluar",
            tooltipLabels: apiData.map(item => `${item.arah.charAt(0).toUpperCase() + item.arah.slice(1)} keluar`),
            color: '#BF3D3D',
            thickness: 25,
            format: 'unit'
          };
          
          // Simpan data ke state
          setIncomingVehiclesBar2(incomingVehiclesBar2);
          setOutgoingVehiclesBar2(outgoingVehiclesBar2);
          setIOByArahData(apiData.map(item => ({
            name: item.arah,
            masuk: parseInt(item.total_IN),
            keluar: parseInt(item.total_OUT),
          })));
        } else {
          setIOByArahData([]);
          // Set default data jika API tidak mengembalikan data yang valid
          setIncomingVehiclesBar2({
            labels: [],
            values: [],
            percentages: [],
            vehicleTypes: [],
            iconComponents: [],
            directionRoad: [],
            color: '#4ade80',
            thickness: 25,
            format: 'unit'
          });
          setOutgoingVehiclesBar2({
            labels: [],
            values: [],
            percentages: [],
            vehicleTypes: [],
            iconComponents: [],
            directionRoad: [],
            color: '#BF3D3D',
            thickness: 25,
            format: 'unit'
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setIOByArahData([]);
      }
    };
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await vehicles.getAll();
        
        console.log(response.data)
        if (response.status === 200 && response.data.data.length > 0) {
          // Periksa apakah total_IN dan total_OUT bukan null
          const totalIn = response.data.data[0]?.total_IN !== null ? parseFloat(response.data.data[0].total_IN) : 0;
          const totalOut = response.data.data[0]?.total_OUT !== null ? parseFloat(response.data.data[0].total_OUT) : 0;
          const totalTraffic = totalIn + totalOut;
          const inPercentage = totalTraffic > 0 ? (totalIn / totalTraffic * 100).toFixed(1) : 0;
          const outPercentage = totalTraffic > 0 ? (totalOut / totalTraffic * 100).toFixed(1) : 0;
          
          const transformedData = [{
            name: 'Today',
            masuk: totalIn,
            keluar: totalOut,
            masukPercentage: parseFloat(inPercentage),
            keluarPercentage: parseFloat(outPercentage)
          }];
          console.log(transformedData)
          setChartData(transformedData);
        } else {
          // Set default data jika respons tidak sesuai yang diharapkan
          setChartData([{
            name: 'Today',
            masuk: 0,
            keluar: 0,
            masukPercentage: 0,
            keluarPercentage: 0
          }]);
        }
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
        // Set default data jika terjadi error
        setChartData([{
          name: 'Today',
          masuk: 0,
          keluar: 0,
          masukPercentage: 0,
          keluarPercentage: 0
        }]);
      } finally {
        setIsLoading(false);
      }
    };
  
    const fetchAllData = async () => {
      await Promise.all([fetchData(), fetchByArah(), fetchVehicleTypeData()]);
    };

    fetchAllData();
    // Set up interval for data refresh
    const intervalId = setInterval(fetchAllData, 60000); // Refresh every minute
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [activeFilter]);

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
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-blue-950">Loading chart data...</div>
          </div>
        ) : (
          <TotalChart data={chartData} />
        )}
      </div>
      
      {/* Rest of your component remains unchanged */}
      <div className="flex flex-col md:flex-row items-center justify-between w-[90%] bg-base-200/90 p-4 lg:gap-2 rounded-3xl backdrop-blur-sm shadow-gray-200">
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-medium mb-2 text-center">Kendaraan Masuk</h2>
          <LintasChart positionText={true} chartData={vehicleData?.incomingVehicles}/>
        </div>
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-medium mb-2 text-center">Kendaraan Keluar</h2>
          <LintasChart positionText={false} chartData={vehicleData?.outgoingVehicles}/>
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
        {/* <div className="grid grid-cols-2 not-xl:grid-cols-1 gap-2 py-10">
          <div>
            <GrafikRoad />
          </div>
          <div>
          <GrafikRoad />
          </div>
        </div> */}
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
          {/* <div className="grid grid-cols-2 not-xl:grid-cols-1 gap-2 py-10">
            <div>
              <GrafikRoad />
            </div>
            <div>
              <GrafikRoad />
            </div>
          </div> */}
        </div>
        <MapComponent />
      </div>
    </div>
  );
}