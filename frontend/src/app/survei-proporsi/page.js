"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { io } from 'socket.io-client'
import { cameras, survey, logCamera } from '@/lib/apiService';

// Lazy load components
const VehicleTable = lazy(() => import("@/app/components/vehicleTable"));
const SurveyInfoTable = lazy(() => import("@/app/components/surveyorTable"));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const GridVertical = lazy(() => import('@/app/components/gridVertical'));
const GridHorizontal = lazy(() => import('@/app/components/gridHorizontal'));
const GrafikRoad = lazy(() => import("@/app/components/roadChart"));
const CameraStatus2 = lazy(() => import("@/app/components/cameraStatusVer2"));
const RecentVehicle = lazy(() => import("@/app/components/recentVehicle"));
const CCTVStream = lazy(() => import('@/app/components/cctvStream'));
const CameraStatusTimeline = lazy(() => import('@/app/components/cameraStatusTime'))
const MapComponent = lazy(() => import("@/app/components/map"));

function SurveiProporsi() {
  // Loading and UI states
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  
  // Filter states
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
  const [activePergerakan, setActivePergerakan] = useState('Semua');
  
  // Camera and location states Date and category states
  const [activeCamera, setActiveCamera] = useState(null);
  const [activeSimpang, setActiveSimpang] = useState('');
  const [activeTitle, setActiveTitle] = useState("Survei ");
  const [dataCamera, setDataCamera] = useState([]);
  const [streamData, setStreamData] = useState({});
  const [cameraLogs, setCameraLogs] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('luar_kota');
  const [dateInput, setDateInput] = useState('');
  const [intersectionData, setIntersectionData] = useState({});

  // Constants
  const categoryNames = [
    { name: 'luar_kota', display: 'Luar Kota' },
    { name: 'dalam_kota', display: "Dalam Kota" },
    { name: 'tipikal', display: "Tipikal" },
  ];

  // Utility functions
  const formatDateToInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateToYMDForAPI = (dateStr) => {
    return dateStr.replace(/-/g, '/');
  };

  // Initialize date to yesterday
  useEffect(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setDateInput(formatDateToInput(yesterday));
  }, []);

  // Fetch initial camera data
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        const res = await cameras.getAll();
        const cameraData = Array.isArray(res?.data?.cameras) ? res.data.cameras : [];
        
        setDataCamera(cameraData);
        
        // Set first camera as active if available
        if (cameraData.length > 0 && cameraData[0]?.id) {
          setActiveCamera(cameraData[0].id);
          setActiveSimpang(cameraData[0].name || '');
        }
      } catch (err) {
        console.error('Error fetching cameras:', err);
        setDataCamera([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, []);

  // Setup socket connection
  useEffect(() => {
    if (!dataCamera.length) return;

    let socket = null;

    try {
      socket = io('https://sxe-data.layanancerdas.id');

      socket.on('connect', () => {
        console.log('Socket connected');
        setSocketConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setSocketConnected(false);
      });

      // Initialize stream data and setup listeners
      const dynamicStreamData = {};
      dataCamera.forEach((camera) => {
        if (camera?.id) {
          dynamicStreamData[camera.id] = null;
          
          if (camera.socket_event) {
            socket.on(camera.socket_event, (data) => {
              setStreamData((prev) => ({
                ...prev,
                [camera.id]: data,
              }));
            });
          }
        }
      });
      
      setStreamData(dynamicStreamData);

    } catch (error) {
      console.error('Error setting up socket connection:', error);
    }

    return () => {
      if (socket) {
        try {
          setSocketConnected(false);
          socket.disconnect();
        } catch (error) {
          console.error('Error disconnecting socket:', error);
        }
      }
    };
  }, [dataCamera]);

  // Fetch survey data
  const fetchSurveyProporsi = async (cameraId, category, date) => {
    if (!cameraId || !category || !date) return;
    
    setLoading(true);
    try {
      const res = await survey.getProporsi(cameraId, category, date);
      const datafetch = res?.data || {};
      setIntersectionData(datafetch);
    } catch (err) {
      console.error('Error fetching survey data:', err);
      setIntersectionData({});
    } finally {
      setLoading(false);
    }
  };

  // Fetch camera logs
  const getLogCamera = async (cameraId) => {
    if (!cameraId) return;
    
    try {
      const res = await logCamera.getById(cameraId);
      const logs = Array.isArray(res?.data?.logs) ? res.data.logs : [];
      setCameraLogs(prev => ({
        ...prev,
        [cameraId]: logs
      }));
    } catch (err) {
      console.error("Error fetching camera logs:", err);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    if (activeCamera && selectedCategory && dateInput) {
      fetchSurveyProporsi(activeCamera, selectedCategory, formatDateToYMDForAPI(dateInput));
      getLogCamera(activeCamera);
    }
  }, [activeCamera, selectedCategory, dateInput]);

  // Handle map click
  const handleMapClick = (building) => {
    try {
      if (!building?.camera?.camera_id) {
        console.warn("Invalid building or camera data", building);
        return;
      }

      const cameraName = building.camera.name || "Tanpa Nama";
      setActiveTitle("Survei " + cameraName);
      setActiveSimpang(cameraName);
      setActiveCamera(building.camera.camera_id);
    } catch (error) {
      console.error("Error in handleMapClick:", error);
    }
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Handle date change
  const handleDateChange = (e) => {
    setDateInput(e.target.value);
  };

  // Loading fallback component
  const LoadingFallback = ({ message = "Loading..." }) => (
    <div className="text-center font-medium m-auto w-full p-4">
      <div className="loading loading-spinner loading-md"></div>
      <p className="mt-2">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Suspense fallback={<LoadingFallback message="Loading Map..." />}>
        {dataCamera.length > 0 ? (
          <MapComponent 
            title="Survei Proporsi" 
            onClick={handleMapClick}
            sizeHeight="50vh"
          />
        ) : (
          <LoadingFallback message="Loading camera data..." />
        )}
      </Suspense>

      <div className="w-[95%] m-auto">
        {/* Main Content Section */}
        <div className="lg:grid lg:grid-cols-3 flex flex-col lg:items-center lg:place-items-center gap-5 py-10">
          <Suspense fallback={<LoadingFallback />}>
            <RecentVehicle customCSS="h-[320px]" />
          </Suspense>
          
          <div className="lg:col-span-2 h-fit items-center flex bg-black rounded-lg shadow-md overflow-hidden justify-center">
            <div className="w-[60%]">
              <Suspense fallback={<LoadingFallback message="Loading stream..." />}>
                <CCTVStream
                  heightCamera
                  data={streamData[activeCamera] || null}
                  title={activeCamera ? `CCTV Camera ${activeCamera} (${activeSimpang})` : "CCTV Camera (Loading...)"}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-4">
          <div className="form-control w-full flex flex-col gap-2">
            <label className="label">
              <span className="label-text font-medium">Kategori:</span>
            </label>
            <select
              className="select select-bordered"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              {categoryNames.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.display}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-control w-full flex flex-col gap-2">
            <label className="label">
              <span className="label-text font-medium">Pilih Tanggal:</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              value={dateInput}
              onChange={handleDateChange}
            />
          </div>
        </div>

        {/* Intersection Data Section */}
        {loading ? (
          <LoadingFallback message="Loading survey data..." />
        ) : (
          <div className="w-full my-10 overflow-x-auto">
            <div className="min-w-[450px] flex flex-col w-fit bg-[#BCC3E1] mx-auto font-semibold">
              <Suspense fallback={<LoadingFallback />}>
                {/* North */}
                <div className="flex justify-center">
                  <div></div>
                  <GridVertical 
                    position={true} 
                    data={intersectionData?.north || {}} 
                    category 
                  />
                  <div></div>
                </div>

                {/* West - Center - East */}
                <div className="flex justify-center">
                  <GridHorizontal 
                    position={true} 
                    data={intersectionData?.west || {}} 
                    category 
                  />
                  <div className="w-40 text-center items-center flex font-medium text-sm bg-stone-400">
                    <div className="m-auto">
                      Jumlah<br />Kendaraan <br /> 
                      {intersectionData?.vehicleCount || "0"}
                    </div>
                  </div>
                  <GridHorizontal 
                    position={false} 
                    data={intersectionData?.east || {}} 
                    category 
                  />
                </div>

                {/* South */}
                <div className="flex justify-center">
                  <div></div>
                  <GridVertical 
                    position={false} 
                    data={intersectionData?.south || {}} 
                    category 
                  />
                  <div></div>
                </div>
              </Suspense>
            </div>
          </div>
        )}

        {/* Camera Status Timeline */}
        <div className="w-[85%] mx-auto mb-8">
          <Suspense fallback={<LoadingFallback />}>
            <CameraStatusTimeline 
              cameraStatusData={cameraLogs[activeCamera] || []} 
            />
          </Suspense>
        </div>

        {/* Road Chart */}
        <Suspense fallback={<LoadingFallback />}>
          <GrafikRoad />
        </Suspense>
      </div>
    </div>
  );
}

export default SurveiProporsi;