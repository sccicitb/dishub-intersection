"use client";
import { useState, useEffect, Suspense, lazy } from 'react';
import { io } from 'socket.io-client';

import { cameras, maps, survey } from '@/lib/apiService';

const ClasificationTable = lazy(() => import("@/app/components/clasificationTable"));
const HourVehicleTable = lazy(() => import('@/app/components/HourVehicleTable'));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const SurveyInfoTable = lazy(() => import("@/app/components/surveyorTable"));
const RecentVehicle = lazy(() => import("@/app/components/recentVehicle"));
const CCTVStream = lazy(() => import('@/app/components/cctvStream'));
const MapComponent = lazy(() => import("@/app/components/map"));


function SurveiSimpangPage () {
  const [loading, setLoading] = useState(false);
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
  const [activeInterval, setActiveInterval] = useState('');
  const [activePergerakan, setActivePergerakan] = useState('Semua');
  const [activeSimpang, setActiveSimpang] = useState("");
  const [activeCamera, setActiveCamera] = useState('detection1');
  const [activeTitle, setActiveTitle] = useState("Survei ");
  const [vehicleData, setVehicleData] = useState([]);
  const [dataCamera, setDataCamera] = useState([]);
  const [streamData, setStreamData] = useState({});

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cameraRes, surveyRes] = await Promise.all([
          cameras.getAll(),
          // survey.getAll(activeCamera.slice(activeCamera.indexOf('n') + 1), formatDateToYMDForAPI(dateInput)),
          survey.getAll(activeCamera, formatDateToYMDForAPI(dateInput)),
        ]);

        // Safe data extraction dengan fallback
        const cameraData = Array.isArray(cameraRes?.data?.cameras) ? cameraRes.data.cameras : [];
        const vehicleData = Array.isArray(surveyRes?.data?.vehicleData) ? surveyRes.data.vehicleData : [];

        setDataCamera(cameraData);
 
        if (cameraData.length > 0 && cameraData[0]?.id) {
          setActiveCamera(cameraData[0]?.id);
        }

        setVehicleData(vehicleData);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        // Set default values jika terjadi error
        setDataCamera([]);
        setVehicleData([]);
      }
    };

    fetchData();
  }, []);

  const fetchSurvey = async (active, date, interval) => {
    setLoading(true)
    try {
      const res = await survey.getAll(active, date, interval);
      const datafetch = Array.isArray(res?.data?.vehicleData) ? res.data.vehicleData : [];
      setVehicleData(datafetch);
      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.error('Error fetching survey data:', err);
      setVehicleData([]);
    }
  };

  useEffect(() => {
    if (activeCamera) {
      fetchSurvey(activeCamera, formatDateToYMDForAPI(dateInput), activeInterval);
    }
  }, [dateInput, activeCamera, activeInterval]);

  useEffect(() => {
    const dynamicStreamData = {};

    // Safe iteration dengan proper null checks
    if (Array.isArray(dataCamera) && dataCamera.length > 0) {
      dataCamera.forEach((item) => {
        if (item && item.camera && item.camera.id) {
          dynamicStreamData[item.camera.id] = null;
        }
      });
    }

    setStreamData(dynamicStreamData);

    // Safe search dengan proper null checks
    const foundCamera = Array.isArray(dataCamera) && dataCamera.length > 0
      ? dataCamera.find(b => b && b.id === activeCamera)
      : null;

    if (foundCamera && foundCamera && foundCamera.id && foundCamera.name) {
      setActiveCamera(foundCamera.id);
      setActiveSimpang(foundCamera.name);
    } else if (!foundCamera && Array.isArray(dataCamera) && dataCamera.length === 0) {
      setActiveCamera('');
      setActiveSimpang('');
    }
  }, [dataCamera, activeCamera]);

  useEffect(() => {
    let socket = null;

    try {
      socket = io('https://sxe-data.layanancerdas.id');

      socket.on('connect', () => {
        console.log('Socket connected');
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Safe socket event registration
      if (Array.isArray(dataCamera) && dataCamera.length > 0) {
        dataCamera.forEach((building) => {
          if (building && building && building.socket_event && building.id) {
            const event = building.socket_event;
            socket.on(event, (data) => {
              setStreamData((prev) => ({
                ...prev,
                [building.id]: data,
              }));
            });
          }
        });
      }
    } catch (error) {
      console.error('Error setting up socket connection:', error);
    }

    return () => {
      if (socket) {
        try {
          socket.disconnect();
        } catch (error) {
          console.error('Error disconnecting socket:', error);
        }
      }
    };
  }, [dataCamera]);

  const handleClick = (building) => {
    // Comprehensive validation
    if (!building ||
      typeof building !== 'object' ||
      !building.camera ||
      typeof building.camera !== 'object' ||
      !building.camera.id ||
      !building.name) {
      console.warn("Invalid building or camera data", building);
      return;
    }

    try {
      setActiveTitle("Survei " + building.name);
      setActiveSimpang(building.name);
      setActiveCamera(building.camera.id);
    } catch (error) {
      console.error('Error in handleClick:', error);
    }
  };

  return (
    <div>
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        <MapComponent title={activeTitle} onClick={handleClick} />

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