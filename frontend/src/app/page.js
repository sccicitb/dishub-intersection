"use client";

import { useEffect, useState, Suspense, lazy } from "react";
import { useAuth } from "@/app/context/authContext";
import { vehicles, intersection } from "@/lib/apiAccess";
import { maps } from "@/lib/apiService";
import { exportSurveyDataToExcel } from '@/utils/exportExcel';
import TableMatrix from "@/app/components/table/tableMatrix";
import { useTrafficMatrix } from "@/hooks/useTrafficMatrix";
import IntersectionFlowCard from "@/app/components/IntersectionFlowCard";
import ClassificationFlowBarChart from "@/app/components/ClassificationFlowBarChart";

const VehicleChart = lazy(() => import("@/app/components/grafikKeluarMasuk"));
const TrafficIntervalChart = lazy(() => import("@/app/components/grafik15menit"));
const MasukKeluarDirectionBarChart = lazy(() => import("@/app/components/MasukKeluarDirectionBarChart"));
const TotalFlowComparisonChart = lazy(() => import("@/app/components/TotalFlowComparisonChart"));
const ChordDiagram = lazy(() => import("@/app/components/diagram/chord"))
// const OptionSelectMaps = lazy(() => import("@/app/components/simpang/optionSelectMaps"))
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
  const { isAdmin, userRoles } = useAuth();
  const isViewer = userRoles.includes('viewer');
  const [isClient, setIsClient] = useState(false)
  const [vehicleData, setVehicleData] = useState(null);
  const [chartData, setChartData] = useState([{
    name: 'Today',
    masuk: 0,
    keluar: 0,
    masukPercentage: 0,
    keluarPercentage: 0
  }]);

  // State for DIY Total Data
  const [diyChartData, setDiyChartData] = useState([{
    name: 'Today',
    masuk: 0,
    keluar: 0,
    masukPercentage: 0,
    keluarPercentage: 0
  }]);

  // State for Classification
  const [classificationData, setClassificationData] = useState([]);
  const [loadingClassification, setLoadingClassification] = useState(false);

  const [ioByArahData, setIOByArahData] = useState([{

  }]);

  const [trafficMinuteData, setTrafficMinuteData] = useState([]);
  const [filterChangeMatrix, setFilterChangeMatrix] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  const [activeFilter, setActiveFilter] = useState('day');
  const [periodDisplayText, setPeriodDisplayText] = useState('');
  const [simpangFilter, setSimpangFilter] = useState('semua');
  const [namaLokasi, setNamaLokasi] = useState('Semua Simpang');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
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

  const calculateDateRange = (filterType) => {
    const now = new Date();
    // Gunakan jam 12 siang untuk menghindari masalah pergeseran tanggal akibat timezone
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

    if (filterType === 'day') {
    }
    else if (filterType === 'month') {
      // Set start ke tanggal 1 di bulan berjalan
      start.setDate(1);
    }
    else if (filterType === 'year') {
      // Set start ke 1 Januari di tahun berjalan
      start.setMonth(0);
      start.setDate(1);
    }

    // Fungsi helper untuk merubah objek Date ke string YYYY-MM-DD
    const toDateString = (dateObj) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: toDateString(start),
      endDate: toDateString(end)
    };
  };

  const handleFilterChange = (filter) => {
    const range = calculateDateRange(filter);
    setDateRange(range);
    setActiveFilter(filter);
    setPeriodDisplayText(getPeriodDisplayText(filter));
  };

  useEffect(() => {

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [vehicleResponse, arahResponse, typeResponse, trafficMinute] = await Promise.all([
          vehicles.getAll(activeFilter, simpangFilter, activeFilter === 'customrange' ? customRangeStart : null, activeFilter === 'customrange' ? customRangeEnd : null),
          vehicles.getByArah(activeFilter, simpangFilter, activeFilter === 'customrange' ? customRangeStart : null, activeFilter === 'customrange' ? customRangeEnd : null),
          vehicles.getByTipe(activeFilter, simpangFilter, activeFilter === 'customrange' ? customRangeStart : null, activeFilter === 'customrange' ? customRangeEnd : null),
          vehicles.getByMinute(activeFilter, simpangFilter, activeFilter === 'customrange' ? customRangeStart : null, activeFilter === 'customrange' ? customRangeEnd : null),
        ]);

        // Fetch new Classification Data
        fetchClassificationData();
        // Fetch Simpang Total Flow
        fetchTotalFlowData();
        // Fetch DIY Total Flow
        fetchDiyTotalFlow();

        fetchTrafficMatrix(
          simpangFilter,
          activeFilter === 'customrange' ? customRangeStart : null,
          activeFilter === 'customrange' ? customRangeEnd : null,
          activeFilter
        ).catch(err => console.warn('Matrix fetch warning:', err));

        // Note: We still process processVehicleData/arah/type from old endpoints for backward compatibility 
        // until we fully switch over. But ChartData will be overwritten by fetchTotalFlowData if successful.
        processVehicleData(vehicleResponse);
        processArahData(arahResponse);
        processTypeData(typeResponse);
        setTrafficMinuteData(trafficMinute.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setDefaultValues();
      } finally {
        setIsLoading(false);
      }
    };

    // New function to fetch total flow
    const fetchTotalFlowData = async () => {
      try {
        const response = await intersection.getTotalFlow(
          simpangFilter,
          activeFilter,
          activeFilter === 'customrange' ? customRangeStart : null,
          activeFilter === 'customrange' ? customRangeEnd : null
        );

        if (response?.status === 200 && response?.data?.status === 'success') {
          const { total_IN, total_OUT } = response.data.data;
          const totalTraffic = total_IN + total_OUT;

          const newData = [{
            name: getPeriodDisplayText(activeFilter),
            masuk: total_IN,
            keluar: total_OUT,
            masukPercentage: totalTraffic > 0 ? parseFloat((total_IN / totalTraffic * 100).toFixed(1)) : 0,
            keluarPercentage: totalTraffic > 0 ? parseFloat((total_OUT / totalTraffic * 100).toFixed(1)) : 0
          }];
          setChartData(newData);
        }
      } catch (err) {
        console.error("Error fetching total flow:", err);
      }
    };

    // New function to fetch DIY total flow
    const fetchDiyTotalFlow = async () => {
      try {
        // Use vehicles.getAll for DIY aggregate as it aligns with getChartMasukKeluar
        const response = await vehicles.getAll(
          activeFilter,
          'semua',
          activeFilter === 'customrange' ? customRangeStart : null,
          activeFilter === 'customrange' ? customRangeEnd : null
        );

        if (response?.status === 200 && response?.data?.data && response.data.data.length > 0) {
          // vehicles.getAll returns array of objects with total_IN/OUT
          const total_IN = parseFloat(response.data.data[0]?.total_IN) || 0;
          const total_OUT = parseFloat(response.data.data[0]?.total_OUT) || 0;
          const totalTraffic = total_IN + total_OUT;

          const newDiyData = [{
            name: getPeriodDisplayText(activeFilter),
            masuk: total_IN,
            keluar: total_OUT,
            masukPercentage: totalTraffic > 0 ? parseFloat((total_IN / totalTraffic * 100).toFixed(1)) : 0,
            keluarPercentage: totalTraffic > 0 ? parseFloat((total_OUT / totalTraffic * 100).toFixed(1)) : 0
          }];
          setDiyChartData(newDiyData);
        } else {
          // Fallback if fails
          setDiyChartData([{
            name: 'Today',
            masuk: 0,
            keluar: 0,
            masukPercentage: 0,
            keluarPercentage: 0
          }]);
        }
      } catch (err) {
        console.error("Error fetching DIY total flow:", err);
      }
    };

    // New function to fetch classification
    const fetchClassificationData = async () => {
      setLoadingClassification(true);
      try {
        const response = await intersection.getFlowByClassification(
          simpangFilter,
          activeFilter,
          activeFilter === 'customrange' ? customRangeStart : null,
          activeFilter === 'customrange' ? customRangeEnd : null
        );

        if (response?.status === 200 && response?.data?.status === 'success') {
          setClassificationData(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching classification:", err);
      } finally {
        setLoadingClassification(false);
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

    // Auto-refresh 30 menit
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        setIsRefreshing(true);
        fetchAllData().then(() => setIsRefreshing(false));
      }
    }, 1800000); // 30 menit

    const range = calculateDateRange(activeFilter);
    setDateRange(range);

    return () => {
      clearInterval(intervalId);
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
          // if (response.data.simpang.length > 0) {
          //   setSelectedLocation(response.data.simpang[0].id);
          //   setMatrixSubmitCounter(prev => prev + 1);
          // }
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
        alert('Export berhasil! File sudah didownload.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Terjadi kesalahan saat export Excel:\n' + error.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Fetch traffic matrix when location or dates change - REMOVED (Handled in fetchAllData)
  // useEffect(() => {
  //   if (matrixSubmitCounter > 0 && selectedLocation !== 0) {
  //     fetchTrafficMatrix(selectedLocation, startDate, endDate, filterChangeMatrix).catch(() => {

  //     });
  //   }
  // }, [matrixSubmitCounter]);

  if (!isClient) return null;

  const masukKeluarStartDate = activeFilter === 'customrange' ? customRangeStart : dateRange.startDate;
  const masukKeluarEndDate = activeFilter === 'customrange' ? customRangeEnd : dateRange.endDate;
  const canShowMasukKeluarChart = simpangFilter !== 'semua' && masukKeluarStartDate && masukKeluarEndDate;

  const handleSimpangChange = (e) => {
    const selectedId = e.target.value;

    // 1. Simpan ID ke state simpangFilter
    setSimpangFilter(selectedId);

    // 2. Cari data simpang yang cocok dari list untuk mendapatkan namanya
    const selectedData = simpangList.find(item => String(item.id) === String(selectedId));

    if (selectedData) {
      setNamaLokasi(selectedData.Nama_Simpang);
    } else {
      setNamaLokasi("Semua Simpang");
    }
  };

  return (
    <div className="p-4 text-base-700 flex flex-col items-center gap-8 overflow-y-hidden text-[13px]">
      {/* Indikator refresh non-blocking */}
      {isRefreshing && (
        <div className="fixed bottom-5 right-5 bg-transparent z-50 text-gray-800 font-semibold flex items-center gap-2">
          <span className="text-sm">Memperbarui data...</span>
        </div>
      )}

      <Suspense fallback={<div>Loading Charts...</div>}>
        <div className="w-[90%] bg-blue-950/90 text-center p-1.5 text-[13px] font-semibold text-white rounded-2xl">Jumlah Total Kendaraan</div>
        {(!isAdmin === !isViewer) ? (
          <div className="w-[90%]">
            {/* Filter buttons and Period display on same row */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              {/* Simpang Filter Dropdown */}
              <select
                value={simpangFilter}
                onChange={handleSimpangChange}
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
                  Periode: {periodDisplayText}
                </div>
              )}

              {/* Export Excel Button */}
              {isAdmin && (
                <button
                  onClick={handleExportExcel}
                  disabled={exportLoading}
                  className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  {exportLoading ? (
                    <>
                      Exporting...
                    </>
                  ) : (
                    <>
                      Export Excel
                    </>
                  )}
                </button>
              )}
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="font-medium">Loading chart data...</div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 w-full">
                {/* Total Charts Grid */}
                <div className="grid grid-cols-1 gap-6 w-full">
                  <TotalFlowComparisonChart
                    diyData={diyChartData}
                    simpangData={chartData}
                    simpangName={namaLokasi}
                  />
                </div>

                {/* Classification Chart - Full Width */}

                {/* Intersection Flow Card - Visible for both "All" and specific simpang */}
                {/* <IntersectionFlowCard
                  simpangId={simpangFilter}
                  activeFilter={activeFilter}
                  startDate={activeFilter === 'customrange' ? customRangeStart : null}
                  endDate={activeFilter === 'customrange' ? customRangeEnd : null}
                /> */}

                <div className="bg-base-200/90 p-4 lg:gap-2 rounded-3xl backdrop-blur-sm shadow-gray-200">
                  <div className="items-center flex flex-col w-full p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800 tracking-tight text-center">Kendaraan Masuk dan Keluar Jogja per Arah</h3>
                      <p className="text-sm text-slate-400 font-medium text-center">Data per simpang berdasarkan filter periode aktif</p>
                    </div>

                    <div className="w-full mt-4">
                      {canShowMasukKeluarChart ? (
                        <MasukKeluarDirectionBarChart
                          simpangId={simpangFilter}
                          startDate={masukKeluarStartDate}
                          endDate={masukKeluarEndDate}
                          title={`Masuk vs Keluar ${namaLokasi}`}
                        />
                      ) : (
                        <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-5 text-sm text-amber-800">
                          Pilih simpang tertentu untuk menampilkan grafik masuk/keluar per arah.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6 w-full">
                  <ClassificationFlowBarChart data={classificationData} />
                </div>
              </div>
            )}
          </div>
        ) : (<div className="w-[90%]"></div>)}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="font-medium">Loading chart data...</div>
          </div>
        ) : (
          <div className="justify-between w-[90%] flex flex-col gap-5">
            <div className="bg-base-200/90 p-4 lg:gap-2 rounded-3xl backdrop-blur-sm shadow-gray-200">
              <div className="items-center flex flex-col w-full p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 tracking-tight text-center">Komposisi Kendaraan</h3>
                  <p className="text-sm text-slate-400 font-medium text-center">Keluar Masuk Yogyakarta per Klasifikasi</p>
                </div>
                <div className="items-center flex flex-col md:flex-row w-full gap-6 mt-4">
                  <div className="w-full md:w-1/2">
                    <VehicleChart rawData={vehicleData?.incomingVehicles} category="in" />
                  </div>
                  <div className="w-full md:w-1/2">
                    <VehicleChart rawData={vehicleData?.outgoingVehicles} category="out" />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-base-200/90 p-4 lg:gap-2 rounded-3xl backdrop-blur-sm shadow-gray-200">
            </div>
            <div className="h-fit bg-base-200/90 p-4 rounded-3xl backdrop-blur-sm shadow-base-100">
              <TrafficIntervalChart rawResponse={trafficMinuteData} />
            </div>
          </div>
        )
        }

        {
          !matrixError && dataChord?.arahPergerakan && Object.keys(dataChord.arahPergerakan).length > 0 && !isLoading ?
            (
              <div className="justify-between w-[90%] flex flex-col gap-5">
                <div className="bg-base-200/90  w-full p-4 lg:gap-2 rounded-3xl backdrop-blur-sm shadow-gray-200">
                  <div className="items-center flex flex-col w-full p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                    {hasValidMatrixData() && (
                      <div className="w-fit m-auto hidden lg:block">
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
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (<div className="flex justify-center items-center h-64">
              <div className="font-medium">Loading chart data...</div>
            </div>)
        }

        <div className="w-[90%]">
          <div className="bg-base-200/90 w-full flex flex-col p-4 gap-8 rounded-3xl backdrop-blur-sm shadow-gray-200">
            <div className="w-full px-8 pt-4 rounded-2xl bg-white shadow-sm border border-gray-100">
              {isAdmin && <CameraStream />}
            </div>
            <MapComponent />
          </div>
        </div>
      </Suspense >
    </div >
  );
}
