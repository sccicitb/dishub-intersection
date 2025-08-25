"use client";

import { useEffect, useState, Suspense, lazy } from "react";
import { vehicles } from "@/lib/apiAccess";
import { survey } from "@/lib/apiService";
import SocketConnection from "./components/testingSocket";
import TableMatrix from "@/app/components/table/tableMatrix";

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
  const [activeFilter, setActiveFilter] = useState('day');
  const [activeFilterSection2, setActiveFilterSection2] = useState('day');
  const [periodDisplayText, setPeriodDisplayText] = useState('');

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
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleSelectOption = (location, date) => {
    console.log("Lokasi dipilih dan tanggal:", location, date);
    setSelectedLocation(location?.id ?? 0);
    setSelectedDate(date)
  };

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

  const [dataMatrix, setDataMatrix] = useState([]);
  const [dataChord, setDataChord] = useState([]);
  const categories = ["barat", "selatan", "timur", "utara"];

  const fetchAPIMatrix = async (simpang_id, startDate, endDate) => {
    try {
      const response = await survey.getTrafficMatrix(simpang_id, startDate, endDate);
      if (response.status === 200 && response.data) {
        return response.data.data; // Assuming the API returns the matrix data in this structure
      } else {
        console.error("Failed to fetch traffic matrix:", response);
        return null;
      }
    } catch (error) {
      console.error("Error fetching traffic matrix:", error);
      return null;
    }
  };

  useEffect(() => {
    import("@/data/contohmatrix.json").then((data) => {
      const asalTujuan = data.default.data.asalTujuan;

      const data_matrix = categories.map(from => {
        console.log(from, asalTujuan[from]); // debug
        return categories.map(to => asalTujuan[from][to]);
      });
      setDataChord(data.default.data);
      console.log("Data Chord:", data.default);
      setDataMatrix(data_matrix);
    });
  }, []);

  useEffect(() => {
    if (selectedLocation !== 0 && (startDate || endDate)) {
      fetchAPIMatrix(selectedLocation, startDate, endDate).then((data) => {
        if (data) {
          const asalTujuan = data.asalTujuan;
          const data_matrix = categories.map(from => {
            return categories.map(to => asalTujuan[from][to]);
          });
          setDataChord(data);
          setDataMatrix(data_matrix);
        } else {
          import("@/data/contohmatrix.json").then((data) => {
            const asalTujuan = data.default.data.asalTujuan;

            const data_matrix = categories.map(from => {
              return categories.map(to => asalTujuan[from][to]);
            });
            setDataChord(data.default);
            console.log("Data Chord:", data.default);
            setDataMatrix(data_matrix);
          });
        }
      })
    }
  }, [selectedLocation, startDate, endDate]);

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
      <div className="w-[90%] py-5 block bg-base-200 rounded-xl">
        <div className="w-64 px-5">
          <OptionSelectMaps
            onSelect={(selectedLocation) => handleSelectOption(selectedLocation, selectedDate)}
            onDateSelect={(selectedDate) => handleSelectOption(selectedLocation, selectedDate)}
            optionMap
            optionDateRange
            startDateRange={setStartDate}
            endDateRange={setEndDate}
          />
        </div>
        <div className="w-full lg:flex overflow-x-auto place-items-center">
          <div className="w-fit block m-auto">
            <ChordDiagram matrix={dataMatrix || {}} categories={categories || {}} />
          </div>
          <div className="max-w-4xl mx-auto">
            <TableMatrix
              categories={categories}
              asalTujuan={dataChord?.asalTujuan || {}}
              arahPergerakan={dataChord?.asalTujuan || {}}
            />
          </div>
        </div>
      </div>

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