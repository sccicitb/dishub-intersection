"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { useAuth } from "@/app/context/authContext";
import { io } from 'socket.io-client'
import { cameras, survey, logCamera } from '@/lib/apiService';

// Lazy load components
// const VehicleTable = lazy(() => import("@/app/components/vehicleTable"));
// const SurveyInfoTable = lazy(() => import("@/app/components/surveyorTable"));
// const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const GridVertical = lazy(() => import('@/app/components/gridVertical'));
const GridHorizontal = lazy(() => import('@/app/components/gridHorizontal'));
// const CameraStatus2 = lazy(() => import("@/app/components/cameraStatusVer2"));
const RecentVehicle = lazy(() => import("@/app/components/recentVehicle"));
const CCTVStream = lazy(() => import('@/app/components/cctvStream'));
const CameraStatusTimeline = lazy(() => import('@/app/components/cameraStatusTime'))
const MapComponent = lazy(() => import("@/app/components/map"));

function SurveiProporsi () {
  const { isAdmin } = useAuth();
  // Loading and UI states
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Filter states
  // const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  // const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  // const [activePendekatan, setActivePendekatan] = useState('Semua');
  // const [activePergerakan, setActivePergerakan] = useState('Semua');

  // Camera and location states Date and category states
  const [activeCamera, setActiveCamera] = useState(null);
  const [activeSimpang, setActiveSimpang] = useState('');
  const [activeSimpangId, setActiveSimpangId] = useState(1);
  const [activeTitle, setActiveTitle] = useState("Survei ");
  const [dataCamera, setDataCamera] = useState([]);
  const [streamData, setStreamData] = useState({});
  const [cameraLogs, setCameraLogs] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('luar_kota');
  const [dateInput, setDateInput] = useState('');
  const [intersectionData, setIntersectionData] = useState({});
  const [submitCounter, setSubmitCounter] = useState(0);
  const [customRangeEnd, setCustomRangeEnd] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

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
    // dateStr is already in YYYY-MM-DD format from HTML date input
    return dateStr;
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

        setSocketConnected(true);
      });

      socket.on('disconnect', () => {

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
  // const getLogCamera = async (cameraId) => {
  //   if (!cameraId) return;

  //   try {
  //     const res = await logCamera.getById(cameraId);
  //     const logs = Array.isArray(res?.data?.logs) ? res.data.logs : [];
  //     setCameraLogs(prev => ({
  //       ...prev,
  //       [cameraId]: logs
  //     }));
  //   } catch (err) {
  //     console.error("Error fetching camera logs:", err);
  //   }
  // };

  const filterLogsByDate = (logs, targetDate) => {
    if (!Array.isArray(logs) || !targetDate) return [];

    // Format target date ke YYYY-MM-DD
    const targetDateStr = new Date(targetDate).toISOString().split('T')[0];

    return logs.filter(log => {
      if (!log.recorded_at) return false;

      // Ambil tanggal dari recorded_at
      const logDateStr = new Date(log.recorded_at).toISOString().split('T')[0];
      return logDateStr === targetDateStr;
    });
  };

  const getLogCamera = async (cameraId, filterDate = null) => {
    if (!cameraId) return;

    try {
      // Format date untuk API (YYYY-MM-DD)
      let apiDate = null;
      if (filterDate) {
        const dateObj = new Date(filterDate);
        apiDate = dateObj.toISOString().split('T')[0];
      }

      const res = await logCamera.getByCameraId(cameraId, apiDate);
      const logs = Array.isArray(res?.data?.logs) ? res.data.logs : [];

      // Filter logs berdasarkan tanggal jika filterDate disediakan
      const filteredLogs = filterDate ? filterLogsByDate(logs, filterDate) : logs;

      // Filter hanya status mati (status = 0) jika diperlukan
      const offlineLogs = filteredLogs.filter(log => log.status === 0);

      setCameraLogs(prev => ({
        ...prev,
        [cameraId]: {
          all: filteredLogs,           // Semua log untuk tanggal tersebut
          offline: offlineLogs,        // Hanya log dengan status mati
          raw: logs                    // Data mentah tanpa filter
        }
      }));

      return {
        all: filteredLogs,
        offline: offlineLogs,
        raw: logs
      };
    } catch (err) {
      console.error("Error fetching camera logs:", err);
      setCameraLogs(prev => ({
        ...prev,
        [cameraId]: {
          all: [],
          offline: [],
          raw: []
        }
      }));
    }
  };

  // Fetch data hanya saat submit button diklik
  useEffect(() => {
    if (submitCounter > 0 && activeSimpangId && selectedCategory && dateInput) {
      fetchSurveyProporsi(activeSimpangId, selectedCategory, dateInput);
      // Pass camera_id untuk fetch status log
      // getLogCamera(activeSimpangId, dateInput);
      getLogCamera(activeCamera, dateInput);
    }
  }, [submitCounter]);

  function handleClickSimpang (loc) {
    let name = loc.Nama_Simpang
    if (!name.toLowerCase().includes("simpang")) {
      name = "Simpang " + name
    }
    setActiveTitle("Survei " + name);
    setActiveSimpangId(loc.id)
  }

  // Handle map click
  const handleMapClick = (building) => {
    if (!building) {
      console.warn("Invalid building or camera data", building);
      return;
    }

    console.log(building)

    try {
      setActiveSimpang(building.camera.name);
      setActiveCamera(building.camera.id);
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
            title={activeTitle}
            onClick={handleMapClick}
            sizeHeight="50vh"
            onClickSimpang={handleClickSimpang}
          />
        ) : (
          <LoadingFallback message="Loading camera data..." />
        )}
      </Suspense>

      <div className="w-[95%] m-auto">
        {/* Main Content Section */}
        <div className="lg:flex lg:place-items-center gap-5 py-10 max-lg:space-y-5 max-lg:flex-col">
          <Suspense fallback={<LoadingFallback />}>
            <RecentVehicle hg={350} data={streamData[activeCamera]} />
          </Suspense>

          <div className="py-1 w-full h-full items-center flex bg-black rounded-lg shadow-md overflow-hidden justify-center">
            <div className="w-full">
              <Suspense fallback={<LoadingFallback message="Loading stream..." />}>
                <CCTVStream
                  data={streamData[activeCamera] || null}
                  large
                  title={activeCamera ? `CCTV Camera ${activeCamera} (${activeSimpang})` : "CCTV Camera (Loading...)"}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 items-end">

          <div className="w-full flex not-md:flex-wrap gap-4 items-end">
            <div className="form-control w-fit flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium">Kategori:</span>
              </label>
              <select
                className="select select-bordered w-fit max-w-md"
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

            <button
              onClick={() => setSubmitCounter(submitCounter + 1)}
              className="btn btn-md bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition w-fit"
            >
              Submit
            </button>
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
            {/* <CameraStatusTimeline
              cameraStatusData={cameraLogs[activeCamera] || []}
            /> */}
            <CameraStatusTimeline
              cameraId={activeCamera}
              selectedDate={dateInput}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default SurveiProporsi;
