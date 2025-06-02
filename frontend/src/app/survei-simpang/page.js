"use client";

import { useState, useEffect, Suspense, lazy, useRef, useCallback } from 'react';
import { io } from "socket.io-client";
import { cameras, survey } from '@/lib/apiService';

const socket = io('https://sxe-data.layanancerdas.id', {
  autoConnect: false,
});

const ClasificationTable = lazy(() => import("@/app/components/clasificationTable"));
const HourVehicleTable = lazy(() => import('@/app/components/HourVehicleTable'));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const SurveyInfoTable = lazy(() => import("@/app/components/surveyorTable"));
const RecentVehicle = lazy(() => import("@/app/components/recentVehicle"));
const CCTVStream = lazy(() => import('@/app/components/cctvStream'));
const MapComponent = lazy(() => import("@/app/components/map"));

function SurveiSimpangPage() {
  const [loading, setLoading] = useState(false);
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
  const [activeInterval, setActiveInterval] = useState("");
  const [activePergerakan, setActivePergerakan] = useState('Semua');
  const [activeTitle, setActiveTitle] = useState("Survei ");
  const [vehicleData, setVehicleData] = useState([]);
  const [dataCamera, setDataCamera] = useState([]);
  const [streamData, setStreamData] = useState({});
  const [activeCamera, setActiveCamera] = useState(0);
  const [activeSimpang, setActiveSimpang] = useState('');

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

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const [dateInput, setDateInput] = useState(formatDateToInput(yesterday));

  // Fetch initial camera & vehicle data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cameraRes, surveyRes] = await Promise.all([
          cameras.getAll(),
          survey.getAll(activeCamera, formatDateToYMDForAPI(dateInput)),
        ]);

        const cameraData = Array.isArray(cameraRes?.data?.cameras) ? cameraRes.data.cameras : [];
        const vehicleData = Array.isArray(surveyRes?.data?.vehicleData) ? surveyRes.data.vehicleData : [];

        setDataCamera(cameraData);

        if (cameraData.length > 0 && cameraData[0]?.id) {
          setActiveCamera(cameraData[0].id);
          setActiveSimpang(cameraData[0].name || '');
        }

        setVehicleData(vehicleData);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setDataCamera([]);
        setVehicleData([]);
      }
    };

    fetchData();
  }, []); // Only once on mount

  // Debounced fetchSurvey when dependencies change
  useEffect(() => {
    if (!activeCamera) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await survey.getAll(activeCamera, formatDateToYMDForAPI(dateInput), activeInterval);
        const datafetch = Array.isArray(res?.data?.vehicleData) ? res.data.vehicleData : [];
        setVehicleData(datafetch);
      } catch (err) {
        console.error('Error fetching survey data:', err);
        setVehicleData([]);
      } finally {
        setLoading(false);
      }
    }, 500); // debounce delay 500ms

    return () => clearTimeout(timer); // cleanup if dependencies change before timeout
  }, [dateInput, activeCamera, activeInterval]);

  // Update streamData and activeSimpang when dataCamera or activeCamera changes
  useEffect(() => {
    const dynamicStreamData = {};
    if (Array.isArray(dataCamera) && dataCamera.length > 0) {
      dataCamera.forEach(item => {
        if (item && item.camera && item.camera.id) {
          dynamicStreamData[item.camera.id] = streamData[item.camera.id] || null; // preserve existing if any
        }
      });
    }
    setStreamData(dynamicStreamData);

    const foundCamera = Array.isArray(dataCamera) && dataCamera.length > 0
      ? dataCamera.find(b => b && b.id === activeCamera)
      : null;

    if (foundCamera) {
      setActiveSimpang(foundCamera.name || '');
    } else {
      setActiveSimpang('');
    }
  }, [dataCamera, activeCamera]);

  const socketRef = useRef(socket);

  // Connect socket once
  useEffect(() => {
    if (!socketRef.current.connected) {
      socketRef.current.connect();
    }

    const handleConnect = () => console.log("Socket connected");
    const handleDisconnect = () => console.log("Socket disconnected");
    const handleError = (err) => console.error("Connection error", err);

    socketRef.current.on("connect", handleConnect);
    socketRef.current.on("disconnect", handleDisconnect);
    socketRef.current.on("connect_error", handleError);

    return () => {
      socketRef.current.off("connect", handleConnect);
      socketRef.current.off("disconnect", handleDisconnect);
      socketRef.current.off("connect_error", handleError);
    };
  }, []);

  // useCallback untuk handler socket event per kamera
  // const registerSocketListeners = useCallback(() => {
  //   if (!Array.isArray(dataCamera)) return;

  //   dataCamera.forEach(building => {
  //     if (building?.socket_event && building?.id) {
  //       const handler = (data) => {
  //         setStreamData(prev => ({
  //           ...prev,
  //           [building.id]: data,
  //         }));
  //       };

  //       socketRef.current.on(building.socket_event, handler);

  //       // Cleanup for this listener
  //       return () => {
  //         socketRef.current.off(building.socket_event, handler);
  //       };
  //     }
  //   });
  // }, [dataCamera]);

  // Register / cleanup socket listeners whenever dataCamera changes
  useEffect(() => {
    const cleanupFns = [];

    if (Array.isArray(dataCamera)) {
      dataCamera.forEach(building => {
        if (building?.socket_event && building?.id) {
          const handler = (data) => {
            setStreamData(prev => ({
              ...prev,
              [building.id]: data,
            }));
          };

          socketRef.current.on(building.socket_event, handler);

          cleanupFns.push(() => {
            socketRef.current.off(building.socket_event, handler);
          });
        }
      });
    }

    return () => {
      cleanupFns.forEach(fn => fn());
    };
  }, [dataCamera]);

  const handleClick = (building) => {
    if (
      !building ||
      typeof building !== 'object' ||
      !building.camera ||
      typeof building.camera !== 'object' ||
      !building.camera.camera_id
    ) {
      console.warn("Invalid building or camera data", building);
      return;
    }

    try {
      const title = building.camera.name || "Loading ...";
      setActiveTitle("Survei " + title);
      setActiveSimpang(title);
      setActiveCamera(building.camera.camera_id);
    } catch (error) {
      console.error("Error in handleClick:", error);
    }
  };

  return (
    <div>
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        {dataCamera.length > 0 && (
          <MapComponent title={activeTitle} onClick={handleClick} />
        )}
        <div className="w-[95%] m-auto">
          <div className="lg:grid lg:grid-cols-3 flex flex-col lg:items-center lg:place-items-center gap-5 py-10">
            <RecentVehicle customCSS={'h-[320px]'} />
            <div className="lg:col-span-2 h-fit items-center flex bg-black rounded-lg shadow-md overflow-hidden justify-center">
              <div className="w-[60%]">
                <CCTVStream
                  data={streamData[activeCamera] || null}
                  large
                  title={activeCamera ? `CCTV Camera ${activeCamera} (${activeSimpang})` : `CCTV Camera (Loading...)`}
                />
              </div>
            </div>
          </div>

          <div className="xl:grid xl:grid-cols-2 items-center place-items-center lg:gap-10 py-10">
            <SurveyInfoTable />
            <div className="w-full justify-end flex flex-col">
              <SelectionButtons
                vehicleData={vehicleData}
                activeSurveyor={activeSurveyor}
                setActiveSurveyor={setActiveSurveyor}
                activeClassification={activeClassification}
                setActiveClassification={setActiveClassification}
                setActiveInterval={setActiveInterval}
                activeInterval={activeInterval}
                activePendekatan={activePendekatan}
                setActivePendekatan={setActivePendekatan}
                activePergerakan={activePergerakan}
                setActivePergerakan={setActivePergerakan}
                exportPdf
                interval
              />
            </div>
          </div>

          <div className="w-full flex justify-end mb-4">
            <label className="mr-2 font-medium">Pilih Tanggal:</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
          </div>

          {loading ? (<div>Loading...</div>) :
            Array.isArray(vehicleData) && vehicleData.length > 0 && (
              <HourVehicleTable statusHour={true} vehicleData={vehicleData} />
            )}
          <ClasificationTable typeClass={activeClassification} />
        </div>
      </Suspense>
    </div>
  );
}

export default SurveiSimpangPage;