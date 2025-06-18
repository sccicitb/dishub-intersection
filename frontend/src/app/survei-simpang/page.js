"use client";

import { useState, useEffect, Suspense, lazy, useRef, useCallback } from 'react';
import { io } from "socket.io-client";
import { cameras, survey, maps } from '@/lib/apiService';

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
const AdaptiveVideoPlayer = lazy(() => import('@/app/components/adaptiveCameraStream'));

function SurveiSimpangPage () {
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
  const [activeSimpangId, setActiveSimpangId] = useState(1);
  const [camStandard, setCamStandard] = useState(0)
  const [dataSimpangById, setDataSimpangById] = useState({});

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
        const [cameraRes, simpangRes, surveyRes, mapsRes] = await Promise.all([
          cameras.getAll(),
          maps.getAllFull(),
          survey.getAll(activeCamera, formatDateToYMDForAPI(dateInput)),
          maps.getById(activeSimpangId),
        ]);

        const cameraData = Array.isArray(cameraRes?.data?.cameras) ? cameraRes.data.cameras : [];
        const simpangData = Array.isArray(simpangRes?.data?.buildings) ? simpangRes?.data?.buildings : [];
        const vehicleData = Array.isArray(surveyRes?.data?.vehicleData) ? surveyRes.data.vehicleData : [];
        const mapsData = Array.isArray(mapsRes?.data) ? mapsRes?.data : {};

        setDataCamera(cameraData);

        if (cameraData.length > 0 && cameraData[0]?.id) {
          setActiveCamera(cameraData[0].id);
          setActiveSimpang(cameraData[0].name || '');
        }

        if (simpangData.length > 0 || simpangData[0]?.id) {
          setActiveSimpangId(simpangData[0].id)
        }

        setVehicleData(vehicleData);
        setDataSimpangById(mapsData);

      } catch (err) {
        setDataCamera([]);
        setVehicleData([]);
        if (err.response && err.response.status === 404) {
          console.warn("Simpang tidak ditemukan:", err.response.data?.message);
          setDataSimpangById([]);
        } else {
          console.error('Error fetching simpang data:', err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []); // Only once on mount

  // Helper function untuk mendapatkan camera data berdasarkan activeCamera
  const getActiveCameraData = () => {
    if (!Array.isArray(dataCamera) || dataCamera.length === 0) return null;

    return dataCamera.find(building => {
      // Cek berbagai kemungkinan struktur data
      if (building?.camera?.camera_id === activeCamera) return true;
      if (building?.camera?.id === activeCamera) return true;
      if (building?.id === activeCamera) return true;
      return false;
    });
  };

  // Debounced fetchSurvey when dependencies change
  useEffect(() => {
    if (!activeCamera) return;
    const activeCameraData = getActiveCameraData();
    camStandard
    if (activeCameraData?.socket_event === "not_yet_assign") {
      // Jika not_yet_assign, jangan fetch survey data
      setVehicleData([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await survey.getAll(activeCamera, formatDateToYMDForAPI(dateInput), activeInterval, activePendekatan.toLowerCase());
        const datafetch = Array.isArray(res?.data?.vehicleData) ? res.data.vehicleData : [];
        setVehicleData(datafetch);
      } catch (err) {
        console.error('Error fetching survey data:', err);
        setVehicleData([]);
      } finally {
        setLoading(false);
      }
    }, 900);

    return () => clearTimeout(timer)
  }, [dateInput, activeCamera, activeInterval, activePendekatan]);

  useEffect(() => {
    if (!activeSimpangId) return;

    const timer2 = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await maps.getById(activeSimpangId)
        const datafetch = Array.isArray(res?.data) ? res.data : {};
        setDataSimpangById(datafetch)
      } catch (err) {
        console.error('Error fetching survey data:', err)
      } finally {
        setLoading(false);
      }
    }, 500)

    return () => clearTimeout(timer2)
  }, [activeSimpangId]);

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

  // Register / cleanup socket listeners dengan filter untuk socket_event
  useEffect(() => {
    const cleanupFns = [];

    if (Array.isArray(dataCamera)) {
      dataCamera.forEach(building => {
        if (building?.socket_event && building.socket_event !== "not_yet_assign") {

          // Tentukan ID yang akan digunakan untuk socket
          let socketId;
          if (building.camera && building.camera.camera_id) {
            socketId = building.camera.camera_id;
          } else if (building.camera && building.camera.id) {
            socketId = building.camera.id;
          } else if (building.id) {
            socketId = building.id;
          }

          if (socketId) {
            const handler = (data) => {
              setStreamData(prev => ({
                ...prev,
                [socketId]: data,
              }));
            };

            socketRef.current.on(building.socket_event, handler);

            cleanupFns.push(() => {
              socketRef.current.off(building.socket_event, handler);
            });
          }
        }
      });
    }

    return () => {
      cleanupFns.forEach(fn => fn());
    };
  }, [dataCamera]);

  const fetchVehicleData = async (cameraId, date = dateInput, interval = activeInterval, pendekatan = activePendekatan.toLowerCase()) => {
    setLoading(true);
    try {
      const res = await survey.getAll(cameraId, formatDateToYMDForAPI(date), interval, pendekatan);
      const datafetch = Array.isArray(res?.data?.vehicleData) ? res.data.vehicleData : [];
      setVehicleData(datafetch);
    } catch (err) {
      console.error('Error fetching survey data:', err);
      setVehicleData([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function untuk mendapatkan camera data berdasarkan activeCamera
  // const getActiveCameraData = () => {
  //   if (!Array.isArray(dataCamera) || dataCamera.length === 0) return null;

  //   return dataCamera.find(building => {
  //     // Cek berbagai kemungkinan struktur data
  //     if (building?.camera?.camera_id === activeCamera) return true;
  //     if (building?.camera?.id === activeCamera) return true;
  //     if (building?.id === activeCamera) return true;
  //     return false;
  //   });
  // };

  const handleClick = (building) => {
    if (!building) {
      console.warn("Invalid building:", building);
      return;
    }

    try {
      let cameraId, cameraTitle, socketEvent;

      // Handle different data structures
      if (building.camera && building.camera.camera_id) {
        cameraId = building.camera.camera_id;
        cameraTitle = building.camera.title || building.title || building.name;
        socketEvent = building.camera.socketEvent || building.socket_event;
      } else if (building.camera_id) {
        cameraId = building.camera_id;
        cameraTitle = building.title || building.name;
        socketEvent = building.socket_event;
      } else if (building.id) {
        cameraId = building.id;
        cameraTitle = building.name || building.title;
        socketEvent = building.socket_event;
      } else {
        console.error("Cannot find camera ID in building data:", building);
        return;
      }

      console.log("Setting camera:", { cameraId, cameraTitle, socketEvent, building });


      // Cek apakah camera yang dipilih adalah "not_yet_assign"
      if (socketEvent === "not_yet_assign") {
        setCamStandard(cameraId);
        setVehicleData([]);
      } else {
        setActiveCamera(cameraId)
        setActiveSimpang(cameraTitle);
        // fetchVehicleData(cameraId);
      }
    } catch (error) {
      console.error("Error in handleClick:", error);
    }
  };

  // Helper function untuk mengecek apakah camera menggunakan socket atau tidak
  const shouldUseSocket = (building) => {
    return building?.socket_event && building.socket_event !== "not_yet_assign";
  };

  function handleClickSimpang (loc) {
    let name = loc.name
    if (!name.toLowerCase().includes("simpang")) {
      name = "Simpang " + name
    }
    setActiveTitle("Survei " + name);
    fetchVehicleData(loc.id);
    setActiveSimpangId(loc.id)
  }

  useEffect(() => {
    getActiveCameraData()
  }, [activeCamera])

  // Render CCTV Stream Component berdasarkan socket_event
  const renderCCTVStream = () => {
    const activeCameraData = getActiveCameraData();
    console.log(activeCameraData)
    if (!activeCameraData) {
      return (
        <CCTVStream
          data={null}
          large
          title={`CCTV Camera (Loading...)`}
        />
      );
    }

    if (activeCameraData.socket_event === "not_yet_assign") {
      return (
        <div className="bg-base-200 rounded-lg shadow-md overflow-hidden">
          <AdaptiveVideoPlayer
            videoUrl={activeCameraData.url}
            title={`Video`}
            large
            onClick={() => console.log(`Clicked on`)}
          />
          {/* <AdaptiveVideoPlayer
            videoUrl={"https://cctvjss.jogjakota.go.id/atcs/ATCS_Kleringan_Abu_Bakar_Ali.stream/chunklist_w616721554.m3u8"}
            title={`Video ${title}`}
            large
            onClick={() => console.log(`Clicked on ${title}`)}
          /> */}
        </div>
      );
    }

    return (
      <CCTVStream
        data={streamData[activeCamera] || null}
        large
        title={`CCTV Camera ${activeCamera} (${activeSimpang})`}
      />
    );
  };

  return (
    <div>
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        {dataCamera.length > 0 && (
          <MapComponent title={activeTitle} onClick={handleClick} onClickSimpang={handleClickSimpang} />
        )}
        <div className="w-[95%] m-auto">
          <div className="lg:grid lg:grid-cols-3 flex flex-col lg:items-center lg:place-items-center gap-5 py-10">
            <RecentVehicle customCSS={'h-[320px]'} />
            <div className="lg:col-span-2 h-fit items-center flex bg-black rounded-lg shadow-md overflow-hidden justify-center">
              <div className="w-[60%]">
                {renderCCTVStream()}
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
                pendekatan
                interval
              />
            </div>
          </div>

          <div className="w-full flex justify-end items-center mb-4">
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
              <HourVehicleTable statusHour={true} vehicleData={vehicleData} classification={activeClassification} pdf={false} />
            )}
          <ClasificationTable typeClass={activeClassification} />
        </div>
      </Suspense>
    </div>
  );
}

export default SurveiSimpangPage;