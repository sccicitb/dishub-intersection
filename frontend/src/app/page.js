"use client";

import { useEffect, useState, Suspense, lazy } from "react";
import { vehicles } from "@/lib/apiAccess";
import { survey } from "@/lib/apiService";
import { maps } from "@/lib/apiService";
import { exportSurveyDataToExcel } from '@/utils/exportExcel';
import SocketConnection from "./components/testingSocket";
import TableMatrix from "@/app/components/table/tableMatrix";
import { useTrafficMatrix } from "@/hooks/useTrafficMatrix";

const LintasChart = lazy(() => import("@/app/components/lintasChart"));
const TotalChart = lazy(() => import("@/app/components/totalChart"));
const GrafikRoad = lazy(() => import("@/app/components/roadChart"));
const ChordDiagram = lazy(() => import("@/app/components/diagram/chord"))
const OptionSelectMaps = lazy(() => import("@/app/components/simpang/optionSelectMaps"))
const CameraStream = lazy(() => import("@/app/components/cameraStream"));
const MapComponent = lazy(() => import("@/app/components/map"));
// import CameraStatusTimeline from "@/app/components/cameraStatusTime";

const FaCar = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaCar })));
const FaTruck = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaTruck })));
const FaBus = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaBus })));
const FaMotorcycle = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaMotorcycle })));
const FaShuttleVan = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaShuttleVan })));
const FaTruckMoving = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaTruckMoving })));
const FaCaravan = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaCaravan })));


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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  const [activeFilter, setActiveFilter] = useState('day');
  const [activeFilterSection2, setActiveFilterSection2] = useState('day');
  const [periodDisplayText, setPeriodDisplayText] = useState('');
  const [simpangFilter, setSimpangFilter] = useState('semua');
  const [customRangeStart, setCustomRangeStart] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });
  const [customRangeEnd, setCustomRangeEnd] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

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

  const [selectedLocation, setSelectedLocation] = useState(0);
  const [startDate, setStartDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [matrixSubmitCounter, setMatrixSubmitCounter] = useState(0);
  const [simpangList, setSimpangList] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);

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
          vehicles.getAll(activeFilter, simpangFilter, activeFilter === 'customrange' ? customRangeStart : null, activeFilter === 'customrange' ? customRangeEnd : null),
          vehicles.getByArah(activeFilter, simpangFilter, activeFilter === 'customrange' ? customRangeStart : null, activeFilter === 'customrange' ? customRangeEnd : null),
          vehicles.getByTipe(activeFilter, simpangFilter, activeFilter === 'customrange' ? customRangeStart : null, activeFilter === 'customrange' ? customRangeEnd : null)
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

    // Proses data kendaraan total
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

    // Proses data arah kendaraan
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

    // Helper format data arah
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

    // Proses data tipe kendaraan
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

    // Extract tipe kendaraan
    const extractVehicleData = (data) => {
      // Definisi tipe kendaraan
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

      // Ekstrak data
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

    // Helper format tipe kendaraan
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

    // Capitalize string
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

    // Auto-refresh 30 menit hanya saat tab aktif
    let intervalId;
    const handleVisibility = () => {
      if (document.hidden) {
        setIsTabActive(false);
        if (intervalId) clearInterval(intervalId);
      } else {
        setIsTabActive(true);
        setIsRefreshing(true);
        fetchAllData().then(() => setIsRefreshing(false));
        intervalId = setInterval(() => {
          setIsRefreshing(true);
          fetchAllData().then(() => setIsRefreshing(false));
        }, 1800000); // 30 menit
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    intervalId = setInterval(() => {
      if (!document.hidden) {
        setIsRefreshing(true);
        fetchAllData().then(() => setIsRefreshing(false));
      }
    }, 1800000);
    
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };

  }, [activeFilter, simpangFilter, customRangeStart, customRangeEnd]);

  useEffect(() => {
    setIsClient(true);
    // Inisialisasi & fetch simpang list
    const fetchSimpangList = async () => {
      try {
        const response = await maps.getAllSimpang();
        if (response.status === 200 && Array.isArray(response.data.simpang)) {
          setSimpangList(response.data.simpang);
          // Set default lokasi ke simpang pertama
          if (response.data.simpang.length > 0) {
            setSelectedLocation(response.data.simpang[0].id);
            setMatrixSubmitCounter(prev => prev + 1);
          }
        }
      } catch (error) {
        console.error("Error fetching simpang list:", error);
        setSimpangList([]);
      }
    };
    
    fetchSimpangList();
  }, [])

  // Traffic Matrix Hook
  const { 
    dataChord, 
    dataMatrix, 
    categories, 
    loading: matrixLoading, 
    error: matrixError,
    fetchTrafficMatrix,
    loadDefaultMatrix 
  } = useTrafficMatrix();

  // Helper function untuk check apakah data benar-benar ada (bukan semua 0)
  const hasValidMatrixData = () => {
    if (!dataChord?.asalTujuan) return false;
    
    const asalTujuan = dataChord.asalTujuan;
    let totalCount = 0;
    
    for (const from in asalTujuan) {
      for (const to in asalTujuan[from]) {
        totalCount += asalTujuan[from][to] || 0;
      }
    }
    
    return totalCount > 0;
  };

  // Load default matrix on component mount
  useEffect(() => {
    loadDefaultMatrix();
  }, [loadDefaultMatrix]);

  // Helper function untuk generate date range berdasarkan filter
  const getDateRangeForExport = () => {
    const now = new Date();
    let startDate, endDate;

    endDate = now.toISOString().split('T')[0];

    switch (activeFilter) {
      case 'day':
        startDate = endDate;
        break;
      case 'week':
        const monday = new Date(now);
        const currentDay = now.getDay();
        monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
        startDate = monday.toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1).toISOString().split('T')[0];
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      case 'customrange':
        startDate = customRangeStart;
        endDate = customRangeEnd;
        break;
      default:
        startDate = endDate;
    }

    return { startDate, endDate };
  };

  // Handle export to Excel
  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const { startDate, endDate } = getDateRangeForExport();
      const fileName = `dashboard-traffic-${activeFilter}-${new Date().toISOString().split('T')[0]}.xlsx`;

      // Cari nama simpang dari list
      let simpangName = 'Semua Simpang';
      if (simpangFilter !== 'semua') {
        const selectedSimpang = simpangList.find(s => s.id === parseInt(simpangFilter));
        simpangName = selectedSimpang ? `${selectedSimpang.Nama_Simpang} (ID: ${selectedSimpang.id})` : simpangFilter;
      }

      console.log('🔄 Starting export:', { activeFilter, simpangFilter, simpangName, startDate, endDate });

      const result = await exportSurveyDataToExcel(
        startDate,
        endDate,
        simpangFilter,
        fileName,
        activeFilter,
        simpangName
      );

      if (!result.success) {
        console.error('Export failed:', result);
        alert('Gagal export Excel:\n' + (result.message || 'Unknown error'));
      } else {
        alert('✅ Export berhasil! File sudah didownload.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Terjadi kesalahan saat export Excel:\n' + error.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Fetch traffic matrix when location or dates change
  useEffect(() => {
    if (matrixSubmitCounter > 0 && selectedLocation !== 0) {
      fetchTrafficMatrix(selectedLocation, startDate, endDate).catch(() => {
        console.log("Using default matrix due to fetch failure");
      });
    }
  }, [matrixSubmitCounter]);

  if (!isClient) return null;

  return (
    <div className="p-4 text-base-700 flex flex-col items-center gap-8 overflow-y-hidden text-[13px]">
      {/* Indikator refresh non-blocking */}
      {isRefreshing && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
          <span className="animate-spin">⟳</span>
          <span className="text-sm">Memperbarui data...</span>
        </div>
      )}
      
      <Suspense fallback={<div>Loading Charts...</div>}>
        <div className="w-[90%] bg-blue-950/90 text-center p-1.5 text-[13px] font-semibold text-white rounded-2xl">Jumlah Total Kendaraan</div>
        <div className="w-[90%]">
          {/* Filter buttons and Period display on same row */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {/* Simpang Filter Dropdown */}
            <select
              value={simpangFilter}
              onChange={(e) => setSimpangFilter(e.target.value)}
              className="px-3 py-1.5 rounded-md bg-base-300 border border-base-300 hover:border-blue-900/50 focus:outline-none focus:ring-2 focus:ring-blue-900/90 cursor-pointer"
            >
              <option value="semua">Semua Simpang</option>
              {simpangList.map((simpang) => (
                <option key={simpang.id} value={simpang.id}>
                  Camera {simpang.Nama_Simpang || `Lokasi`} ({simpang.id})
                </option>
              ))}
            </select>

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
            
            {/* Custom Date Range Button */}
            <button
              onClick={() => {
                setActiveFilter('customrange');
                setPeriodDisplayText('');
              }}
              className={`px-3 py-1.5 rounded-md ${activeFilter === 'customrange'
                ? 'bg-blue-950 text-white'
                : 'bg-base-300 hover:bg-blue-200'
                }`}
            >
              Custom Range
            </button>

            {/* Custom Date Range Inputs - Show only when custom range is selected */}
            {activeFilter === 'customrange' && (
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={customRangeStart}
                  onChange={(e) => setCustomRangeStart(e.target.value)}
                  className="px-3 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-gray-500">hingga</span>
                <input
                  type="date"
                  value={customRangeEnd}
                  onChange={(e) => setCustomRangeEnd(e.target.value)}
                  className="px-3 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            {/* Period Display - appears after filter buttons */}
            {periodDisplayText && (
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap">
                📅 Periode: {periodDisplayText}
              </div>
            )}

            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              disabled={exportLoading}
              className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              {exportLoading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Exporting...
                </>
              ) : (
                <>
                  📊 Export Excel
                </>
              )}
            </button>
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
              <GrafikRoad 
                filter={activeFilter} 
                simpang_id={simpangFilter} 
                startDate={activeFilter === 'customrange' ? customRangeStart : null}
                endDate={activeFilter === 'customrange' ? customRangeEnd : null}
              />
            </div>
          </div>
        )}
      </Suspense>
      {!matrixError && dataChord?.arahPergerakan && Object.keys(dataChord.arahPergerakan).length > 0 && (
        <div className="w-[90%] py-5 block bg-base-200 rounded-xl">
          <div className="w-full lg:flex overflow-x-auto place-items-center gap-4">
            {hasValidMatrixData() && (
              <div className="w-fit block m-auto">
                <ChordDiagram matrix={dataMatrix || {}} categories={categories || {}} />
              </div>
            )}
            <div className=" w-full">
              <TableMatrix
                categories={categories}
                asalTujuan={dataChord?.asalTujuan || {}}
                arahPergerakan={dataChord?.arahPergerakan || {}}
                loading={matrixLoading}
                error={matrixError}
                simpangList={simpangList}
                selectedLocation={selectedLocation}
                onLocationChange={(locationId) => setSelectedLocation(locationId)}
                onDateChange={(type, date) => {
                  if (type === 'start') setStartDate(date);
                  if (type === 'end') setEndDate(date);
                }}
                startDate={startDate}
                endDate={endDate}
                onSubmit={() => setMatrixSubmitCounter(matrixSubmitCounter + 1)}
                isLoading={matrixLoading}
              />
            </div>
          </div>
        </div>
      )}

      <div className="w-[90%]">
        <div className="w-full bg-blue-950/90 text-center p-1.5 text-[13px] font-semibold text-white rounded-2xl">CCTV Live Stream & Model Deteksi Kendaraan</div>
        <CameraStream />
        {/* <SocketConnection/> */}
        <div className="h-fit bg-base-200/90 p-4 rounded-3xl backdrop-blur-sm shadow-base-100 mb-10">
        </div>
        <MapComponent />
      </div>
    </div>
  );
}