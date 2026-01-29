"use client";

import { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { io } from "socket.io-client";
import { cameras, survey, maps } from '@/lib/apiService';
import { getCuacaJogja } from '@/lib/weatherAccess';
import { useAuth } from "@/app/context/authContext";

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
const HeaderSurvei = lazy(() => import("@/app/components/headerLhrt"));

function SurveiSimpangPage () {
  const { isEditor, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
  const [activeInterval, setActiveInterval] = useState('5min');
  const [activePergerakan, setActivePergerakan] = useState('Semua');
  const [activeTitle, setActiveTitle] = useState("Survei Pencacahan Lalu Lintas");
  const [vehicleData, setVehicleData] = useState([]);
  const [dataCamera, setDataCamera] = useState([]);
  const [streamData, setStreamData] = useState({});
  const [activeCamera, setActiveCamera] = useState(0);
  const [activeSimpang, setActiveSimpang] = useState('');
  const [fetchStatus, setFetchStatus] = useState(false)
  const [activeSimpangId, setActiveSimpangId] = useState();
  const [camStandard, setCamStandard] = useState(0)
  const [dataSimpangById, setDataSimpangById] = useState({});
  const [Cuaca, setCuaca] = useState("")
  const [fetchError, setFetchError] = useState(null);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

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
  
  const [dateInput, setDateInput] = useState(formatDateToInput(yesterday));
  // Fetch initial camera & vehicle data

  useEffect(() => {
    // Fetch simpang data first to get the ID
    const fetchSimpangData = async () => {
      try {
        const simpangRes = await maps.getAllSimpang();
        const simpangData = Array.isArray(simpangRes?.data?.simpang) ? simpangRes.data.simpang : [];

        if (simpangData.length > 0 && simpangData[0]?.id) {
          setActiveSimpangId(simpangData[0].id);
        }
        setFetchStatus(true)
      } catch (err) {
        console.error('Error fetching simpang data:', err);
      }
    };

    fetchSimpangData();
  }, []);

  useEffect(() => {
    if (!activeSimpangId) return;


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
        let cuaca;
        if (cameraData.length > 0 && cameraData[0]?.id) {
          setActiveCamera(cameraData[0].id);
          setActiveSimpang(cameraData[0].name || '');
        }

        // Don't override user's selected simpang ID - only use for weather if available
        if (simpangData.length > 0 && simpangData[0]?.location) {
          // Just get weather for the current simpang, don't reset ID
          try {
            cuaca = await getCuacaJogja(simpangData[0].location.latitude, simpangData[0].location.longitude)
          } catch (e) {
            console.warn('Error fetching weather:', e);
          }
        }

        setCuaca(cuaca || "");
        setVehicleData(vehicleData);
        setDataSimpangById(mapsData);

      } catch (err) {
        setDataCamera([]);
        setVehicleData([]);
        if (err.response && err.response.status === 404) {
          console.warn("Simpang tidak ditemukan:", err.response.data?.message);
          setDataCamera([]);
          setVehicleData([]);
          setDataSimpangById({});
        } else {
          console.error('Error fetching simpang data:', err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [fetchStatus]); // Only once on mount

  // Helper function untuk mendapatkan camera data berdasarkan activeCamera
  const getActiveCameraData = () => {
    if (!Array.isArray(dataCamera) || dataCamera.length === 0) return null;

    return dataCamera.find(building => {
      // Cek berbagai kemungkinan struktur data
      if (building?.camera?.id === activeCamera) return true;
      if (building?.id === activeCamera) return true;
      return false;
    });
  };

  // Debounced fetchSurvey when dependencies change
  useEffect(() => {
    // When filter changes (interval, pendekatan, date), re-fetch with current activeSimpangId
    if (!activeSimpangId) return;

    const timer = setTimeout(async () => {
      await fetchVehicleData(activeSimpangId);
    }, 900);

    return () => clearTimeout(timer)
  }, [dateInput, activeInterval, activePendekatan, activeSimpangId]);

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

  // Fetch vehicle data for given simpang ID
  const fetchVehicleData = async (simpangId) => {
    setLoading(true);
    setFetchError(null);
    try {
      // Use current filter states from component scope, not from parameter
      const res = await survey.getAll(
        simpangId,
        formatDateToYMDForAPI(dateInput),
        activeInterval,
        activePendekatan.toLowerCase()
      );
      const datafetch = Array.isArray(res?.data?.vehicleData) ? res.data.vehicleData : [];
      setVehicleData(datafetch);
    } catch (err) {
      console.error('Error fetching survey data:', err);
      setVehicleData([]);
      setFetchError(err?.response?.data?.message || 'Gagal mengambil data kendaraan');
    } finally {
      setLoading(false);
    }
  };


  const handleClick = (building) => {
    if (!building) {
      console.warn("Invalid building:", building);
      return;
    }
    console.log(building)

    try {
      let cameraId, cameraTitle, socketEvent;
      // Handle different data structures
      if (building.camera.id) {
        cameraId = building.camera.id;
        cameraTitle = building.camera.name || building.camera.title;
        socketEvent = building.camera.socket_event;
      } else {
        console.error("Cannot find camera ID in building data:", building);
        return;
      }




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

  async function handleClickSimpang (loc) {
    let name = loc.Nama_Simpang
    const cuaca = await getCuacaJogja(loc.latitude, loc.longitude);

    if (!name.toLowerCase().includes("simpang")) {
      name = "Simpang " + name
    }
    console.log(loc)
    setActiveTitle("Survei " + name);
    setActiveSimpangId(loc.id);
    setCuaca(cuaca);
    
    // Fetch immediately with the new simpang ID
    await fetchVehicleData(loc.id);
    // Fetch matrix data
  }

  // Fetch vehicle data when filters change (date, approach, interval, simpang)
  useEffect(() => {
    if (!activeSimpangId) return;

    const timer = setTimeout(async () => {
      // Fetch vehicle data with current filters
      await fetchVehicleData(activeSimpangId);
    }, 900); // 900ms debounce to avoid excessive API calls

    return () => clearTimeout(timer);
  }, [dateInput, activePendekatan, activeInterval, activeSimpangId]);

  // Render CCTV Stream Component berdasarkan socket_event
  const renderCCTVStream = () => {
    const activeCameraData = getActiveCameraData();
    // console.log(activeCameraData)
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
          <MapComponent title={activeTitle} onClick={handleClick} onClickSimpang={handleClickSimpang} />
        <div className="w-[95%] m-auto">
          <div className="lg:flex lg:place-items-center gap-5 py-10 max-lg:space-y-5 max-lg:flex-col">
            <RecentVehicle customCSS={'h-[450px]'} data={streamData[activeCamera]} />
            <div className="py-1 w-full h-full items-center flex bg-black rounded-lg shadow-md overflow-hidden justify-center">
              <div className="w-full">
                {renderCCTVStream()}
              </div>
            </div>
          </div>
            {/* <SurveyInfoTable fetchStatus={fetchStatus} id={activeSimpangId} cuaca={Cuaca} /> */}
          <div className="flex flex-col max-lg:flex-col items-center place-items-center max-lg:space-y-5 py-5 gap-5">
              <HeaderSurvei simpangId={activeSimpangId} selectedDate={dateInput} arahPergerakan={activePendekatan} />
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
                simpang_id={activeSimpangId}
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

          {loading ? (
            <div className="w-full flex justify-center items-center py-20">
              <div className="text-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
                <p className="mt-4 text-gray-600">Memuat data kendaraan...</p>
              </div>
            </div>
          ) : fetchError ? (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m-2-2l2-2"></path></svg>
              <span>{fetchError}</span>
            </div>
          ) : Array.isArray(vehicleData) && vehicleData.length > 0 ? (
            <HourVehicleTable statusHour={true} vehicleData={vehicleData} classification={activeClassification} pdf={false} isEditor={isEditor} exportExcel/>
          ) : (
            <div className="w-full flex justify-center items-center py-20">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 text-lg font-medium">Tidak ada data</p>
                <p className="text-gray-500 text-sm mt-2">Tidak ditemukan data kendaraan untuk filter yang dipilih</p>
              </div>
            </div>
          )}
          <ClasificationTable typeClass={activeClassification} />
        </div>
      </Suspense>
    </div>
  );
}

export default SurveiSimpangPage;
