"use client";

import { useEffect, useState, Suspense, lazy } from "react";
import { vehicles } from "@/lib/apiAccess";

const LintasChart = lazy(() => import("@/app/components/lintasChart"));
const TotalChart = lazy(() => import("@/app/components/totalChart"));
const GrafikRoad = lazy(() => import("@/app/components/roadChart"));

// import CameraStatusTimeline from "@/app/components/cameraStatusTime";
const CameraStream = lazy(() => import("@/app/components/cameraStream"));
const MapComponent = lazy(() => import("@/app/components/map"));

// Lazy load dari react-icons/fa
const FaCar = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaCar })));
const FaTruck = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaTruck })));
const FaBus = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaBus })));
const FaMotorcycle = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaMotorcycle })));
const FaBicycle = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaBicycle })));
const FaShuttleVan = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaShuttleVan })));
const FaTractor = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaTractor })));
const FaTruckMoving = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaTruckMoving })));
const FaCaravan = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaCaravan })));

// Lazy load dari react-icons/fa6
const FaArrowRightToBracket = lazy(() => import("react-icons/fa6").then(mod => ({ default: mod.FaArrowRightToBracket })));
const FaArrowRightFromBracket = lazy(() => import("react-icons/fa6").then(mod => ({ default: mod.FaArrowRightFromBracket })));


export default function Home () {
  const [isClient, setIsClient] = useState(false)
  const [vehicleData, setVehicleData] = useState(null);
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
  const [periodDisplayText, setPeriodDisplayText] = useState('');

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

  // Function to generate period display text
  const getPeriodDisplayText = (filter) => {
    const now = new Date();
    const options = { timeZone: 'Asia/Jakarta' };
    
    switch (filter) {
      case 'day':
        return now.toLocaleDateString('id-ID', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          ...options 
        });
        
      case 'week':
        // Get Monday of current week
        const currentDay = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
        
        // Get Sunday of current week
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        const mondayStr = monday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', ...options });
        const sundayStr = sunday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', ...options });
        
        return `${mondayStr} - ${sundayStr}`;
        
      case 'month':
        return now.toLocaleDateString('id-ID', { 
          month: 'long', 
          year: 'numeric',
          ...options 
        });
        
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        const quarterMonths = {
          1: 'Januari - Maret',
          2: 'April - Juni', 
          3: 'Juli - September',
          4: 'Oktober - Desember'
        };
        return `Q${quarter} ${quarterMonths[quarter]} ${now.getFullYear()}`;
        
      case 'year':
        return now.getFullYear().toString();
        
      default:
        return '';
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPeriodDisplayText(getPeriodDisplayText(filter));
  };

  const handleFilterSection2 = (filter) => {
    setActiveFilterSection2(filter);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [vehicleResponse, arahResponse, typeResponse] = await Promise.all([
          vehicles.getAll(activeFilter),
          vehicles.getByArah(activeFilter),
          vehicles.getByTipe(activeFilter)
        ]);
        processVehicleData(vehicleResponse);
        processArahData(arahResponse);
        processTypeData(typeResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
        setDefaultValues();
      } finally {
        setIsLoading(false);
      }
    };

    // Fungsi untuk memproses data jumlah kendaraan
    const processVehicleData = (response) => {
      try {
        if (response.status === 200 && response.data.data.length > 0) {
          const totalIn = parseFloat(response.data.data[0]?.total_IN) || 0;
          const totalOut = parseFloat(response.data.data[0]?.total_OUT) || 0;
          const totalTraffic = totalIn + totalOut;

          const transformedData = [{
            name: 'Today',
            masuk: totalIn,
            keluar: totalOut,
            masukPercentage: totalTraffic > 0 ? parseFloat((totalIn / totalTraffic * 100).toFixed(1)) : 0,
            keluarPercentage: totalTraffic > 0 ? parseFloat((totalOut / totalTraffic * 100).toFixed(1)) : 0
          }];

          setChartData(transformedData);
        } else {
          setChartData([getDefaultChartData()]);
        }
      } catch (error) {
        console.error("Error processing vehicle data:", error);
        setChartData([getDefaultChartData()]);
      }
    };

    // Fungsi untuk memproses data berdasarkan arah
    const processArahData = (response) => {
      try {
        if (response.status === 200 && response.data.data.length > 0) {
          const apiData = response.data.data;

          // Data untuk kendaraan masuk
          const incomingValues = apiData.map(item => parseInt(item.total_IN));
          const incomingTotal = incomingValues.reduce((a, b) => a + b, 0);

          // Data untuk kendaraan keluar
          const outgoingValues = apiData.map(item => parseInt(item.total_OUT));
          const outgoingTotal = outgoingValues.reduce((a, b) => a + b, 0);

          // Format data untuk chart masuk
          const incomingVehiclesBar2 = formatArahData(
            apiData,
            incomingValues,
            incomingTotal,
            "Masuk",
            "masuk",
            '#4ade80'
          );

          // Format data untuk chart keluar
          const outgoingVehiclesBar2 = formatArahData(
            apiData,
            outgoingValues,
            outgoingTotal,
            "Keluar",
            "keluar",
            '#BF3D3D'
          );

          // Simpan data ke state
          setIncomingVehiclesBar2(incomingVehiclesBar2);
          setOutgoingVehiclesBar2(outgoingVehiclesBar2);
          setIOByArahData(apiData.map(item => ({
            name: item.arah,
            masuk: parseInt(item.total_IN),
            keluar: parseInt(item.total_OUT),
          })));
        } else {
          setDefaultArahData();
        }
      } catch (error) {
        console.error('Error processing arah data:', error);
        setDefaultArahData();
      }
    };

    // Helper untuk memformat data arah
    const formatArahData = (apiData, values, total, centerTitle, direction, color) => {
      return {
        labels: apiData.map(item => capitalizeFirstLetter(item.arah)),
        values: values,
        percentages: values.map(value => `${((value / total) * 100).toFixed(0)}%`),
        vehicleTypes: apiData.map(item => capitalizeFirstLetter(item.arah)),
        directionRoad: apiData.map(item => capitalizeFirstLetter(item.arah)),
        centerTitle: centerTitle,
        tooltipLabels: apiData.map(item => `${capitalizeFirstLetter(item.arah)} ${direction}`),
        color: color,
        thickness: 25,
        format: 'unit'
      };
    };

    // Fungsi untuk memproses data berdasarkan tipe kendaraan
    const processTypeData = (response) => {
      try {
        if (response.status === 200 && Array.isArray(response.data.data)) {
          const vehicleData = extractVehicleData(response.data.data);

          // Sort by total incoming vehicles (descending)
          vehicleData.sort((a, b) => b.totalIn - a.totalIn);

          // Calculate total incoming and outgoing
          const totalIn = vehicleData.reduce((sum, item) => sum + item.totalIn, 0);
          const totalOut = vehicleData.reduce((sum, item) => sum + item.totalOut, 0);

          // Format data untuk chart
          const incomingVehicles = formatTypeData(vehicleData, totalIn, "masuk", '#4ade80');
          const outgoingVehicles = formatTypeData(vehicleData, totalOut, "keluar", '#BF3D3D');

          setVehicleData({
            incomingVehicles,
            outgoingVehicles,
            rawData: vehicleData
          });
        } else {
          setVehicleData([]);
        }
      } catch (error) {
        console.error("Error processing vehicle type data:", error);
        setVehicleData([]);
      }
    };

    // Ekstrak data kendaraan
    const extractVehicleData = (data) => {
      // Definisi tipe kendaraan dan ikon
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

      // Ekstrak data kendaraan
      const vehicleData = [];

      data.forEach(item => {
        // Cari tipe kendaraan yang memiliki nilai 1
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

      return vehicleData;
    };

    // Helper untuk memformat data tipe kendaraan
    const formatTypeData = (vehicleData, total, direction, color) => {
      return {
        labels: vehicleData.map(item => item.name),
        values: vehicleData.map(item => direction === "masuk" ? item.totalIn : item.totalOut),
        percentages: vehicleData.map(item => {
          const value = direction === "masuk" ? item.totalIn : item.totalOut;
          return `${((value / total) * 100).toFixed(1)}%`;
        }),
        vehicleTypes: vehicleData.map(item => item.name),
        iconComponents: vehicleData.map(item => item.icon),
        tooltipLabels: vehicleData.map(item => `${item.name} ${direction}`),
        color: color,
        thickness: 25,
        format: 'unit'
      };
    };

    // Helper functions
    const capitalizeFirstLetter = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const getDefaultChartData = () => {
      return {
        name: 'Today',
        masuk: 0,
        keluar: 0,
        masukPercentage: 0,
        keluarPercentage: 0
      };
    };

    const setDefaultValues = () => {
      setChartData([getDefaultChartData()]);
      setDefaultArahData();
      setVehicleData([]);
    };

    const setDefaultArahData = () => {
      const defaultArahConfig = {
        labels: [],
        values: [],
        percentages: [],
        vehicleTypes: [],
        directionRoad: [],
        color: '',
        thickness: 25,
        format: 'unit'
      };

      setIOByArahData([]);
      setIncomingVehiclesBar2({ ...defaultArahConfig, color: '#4ade80' });
      setOutgoingVehiclesBar2({ ...defaultArahConfig, color: '#BF3D3D' });
    };

    fetchAllData();

    // Jika perlu refresh data secara berkala, uncomment kode berikut
    // const intervalId = setInterval(fetchAllData, 60000); // Refresh setiap menit
    // return () => clearInterval(intervalId);

  }, [activeFilter]);

  useEffect(() => {
    setIsClient(true);
    // Initialize period display text
    setPeriodDisplayText(getPeriodDisplayText(activeFilter));
  }, [])

  if (!isClient) return null;

  return (
    <div className="p-4 text-base-700 flex flex-col items-center gap-8 overflow-y-hidden text-[13px]">
      <Suspense fallback={<div>Loading Charts...</div>}>
        <div className="w-[90%] bg-blue-950/90 text-center p-1.5 text-[13px] font-semibold text-white rounded-2xl">Jumlah Total Kendaraan</div>
        <div className="w-[90%]">
          {/* Filter buttons and Period display on same row */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {/* Filter buttons */}
            <button
              onClick={() => handleFilterChange('day')}
              className={`px-3 py-1.5 rounded-md ${activeFilter === 'day'
                ? 'bg-blue-950 text-white'
                : 'bg-base-300 hover:bg-blue-200'
                }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => handleFilterChange('week')}
              className={`px-3 py-1.5 rounded-md ${activeFilter === 'week'
                ? 'bg-blue-950 text-white'
                : 'bg-base-300 hover:bg-blue-200'
                }`}
            >
              Minggu Ini
            </button>
            <button
              onClick={() => handleFilterChange('month')}
              className={`px-3 py-1.5 rounded-md ${activeFilter === 'month'
                ? 'bg-blue-950 text-white'
                : 'bg-base-300 hover:bg-blue-200'
                }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => handleFilterChange('quarter')}
              className={`px-3 py-1.5 rounded-md ${activeFilter === 'quarter'
                ? 'bg-blue-950 text-white'
                : 'bg-base-300 hover:bg-blue-200'
                }`}
            >
              Quarter Ini
            </button>
            <button
              onClick={() => handleFilterChange('year')}
              className={`px-3 py-1.5 rounded-md ${activeFilter === 'year'
                ? 'bg-blue-950 text-white'
                : 'bg-base-300 hover:bg-blue-200'
                }`}
            >
              Tahun Ini
            </button>
            
            {/* Period Display - appears after filter buttons */}
            {periodDisplayText && (
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap">
                📅 Periode: {periodDisplayText}
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="font-medium">Loading chart data...</div>
            </div>
          ) : (
            <TotalChart data={chartData} />
          )}
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="font-medium">Loading chart data...</div>
          </div>
        ) : (
          <div className="justify-between w-[90%] flex flex-col gap-5">
            <div className="flex flex-col md:flex-row items-center bg-base-200/90 p-4 lg:gap-2 rounded-3xl backdrop-blur-sm shadow-gray-200">
              <div className="w-full md:w-1/2">
                <h2 className="text-lg font-medium mb-2 text-center">Kendaraan Masuk</h2>
                <LintasChart positionText={true} chartData={vehicleData?.incomingVehicles} />
              </div>
              <div className="w-full md:w-1/2">
                <h2 className="text-lg font-medium mb-2 text-center">Kendaraan Keluar</h2>
                <LintasChart positionText={false} chartData={vehicleData?.outgoingVehicles} />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center not-xl:gap-2 gap-15 bg-base-200/90 p-4 rounded-3xl backdrop-blur-sm shadow-gray-200">
              <div className="w-full md:w-1/2">
                <h2 className="text-lg font-medium mb-2 text-center">Kendaraan Masuk</h2>
                <LintasChart positionText={true} chartData={incomingVehiclesBar2} />
              </div>
              <div className="w-full md:w-1/2">
                <h2 className="text-lg font-medium mb-2 text-center">Kendaraan Keluar</h2>
                <LintasChart positionText={false} chartData={outgoingVehiclesBar2} />
              </div>
            </div>
            <div className="h-fit bg-base-200/90 p-4 rounded-3xl backdrop-blur-sm shadow-base-100">
              <GrafikRoad />
            </div>
          </div>
        )}
      </Suspense>
      <div className="w-[90%]">
        <div className="w-full bg-blue-950/90 text-center p-1.5 text-[13px] font-semibold text-white rounded-2xl">CCTV Live Stream & Model Deteksi Kendaraan</div>
        <CameraStream />
        <div className="h-fit bg-base-200/90 p-4 rounded-3xl backdrop-blur-sm shadow-base-100 mb-10">
        </div>
        <MapComponent />
      </div>
    </div>
  );
}