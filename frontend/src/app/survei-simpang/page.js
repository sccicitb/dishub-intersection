"use client";
import { useState, useEffect, Suspense, lazy } from 'react';
import { io } from 'socket.io-client';

const ClasificationTable = lazy(() => import("@/app/components/clasificationTable"));
const HourVehicleTable = lazy(() => import('@/app/components/HourVehicleTable'));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const SurveyInfoTable = lazy(() => import("@/app/components/surveyorTable"));
const RecentVehicle = lazy(() => import("@/app/components/recentVehicle"));
const CCTVStream = lazy(() => import('@/app/components/cctvStream'));
const MapComponent = lazy(() => import("@/app/components/map"));

import { maps, survey } from '@/lib/apiService';

function SurveiSimpangPage () {
  const [socketConnected, setSocketConnected] = useState(false);
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
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
        const [mapsRes, surveyRes] = await Promise.all([
          maps.getAll(),
          survey.getAll(activeCamera.slice(activeCamera.indexOf('n') + 1), formatDateToYMDForAPI(dateInput)),
        ]);

        const cameraData = mapsRes?.data?.buildings || [];
        const vehicleData = Array.isArray(surveyRes?.data?.vehicleData) ? surveyRes.data.vehicleData : [];

        setDataCamera(cameraData);
        setActiveCamera(cameraData[0]?.camera?.id || '');
        setVehicleData(vehicleData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const fetchSurvey = async (active, date) => {
    try {
      const res = await survey.getAll(active.slice(active.indexOf('n') + 1), date);
      const datafetch = res?.data?.vehicleData || [];
      setVehicleData(datafetch);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeCamera) {
      fetchSurvey(activeCamera, formatDateToYMDForAPI(dateInput));
    }
  }, [dateInput, activeCamera]);

  useEffect(() => {
    const dynamicStreamData = {};

    if (Array.isArray(dataCamera)) {
      dataCamera.forEach((item) => {
        if (item.camera && item.camera.id) {
          dynamicStreamData[item.camera.id] = null;
        }
      });
    }

    setStreamData(dynamicStreamData);

    const foundCamera = Array.isArray(dataCamera)
      ? dataCamera.find(b => b.camera?.id === activeCamera)
      : null;

    if (foundCamera) {
      setActiveCamera(foundCamera.camera.id);
      setActiveSimpang(foundCamera.name);
    } else {
      setActiveCamera(null);
    }
  }, [dataCamera]);

  useEffect(() => {
    const socket = io('https://sxe-data.layanancerdas.id');

    socket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    if (Array.isArray(dataCamera)) {
      dataCamera.forEach((building) => {
        if (building.camera && building.camera.socketEvent) {
          const event = building.camera.socketEvent;
          socket.on(event, (data) => {
            setStreamData((prev) => ({
              ...prev,
              [building.camera.id]: data,
            }));
          });
        }
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [dataCamera]);

  const handleClick = (building) => {
    if (!building || !building.camera || !building.camera.id) {
      console.warn("Invalid building or camera data", building);
      return;
    }

    setActiveTitle("Survei " + building.name);
    setActiveSimpang(building.name);
    setActiveCamera(building.camera.id);
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
                  data={streamData[activeCamera]}
                  large
                  title={activeCamera ? `CCTV Camera ${activeCamera.slice(-1)} (${activeSimpang})` : `CCTV Camera (Loading...)`}
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
                activePendekatan={activePendekatan}
                setActivePendekatan={setActivePendekatan}
                activePergerakan={activePergerakan}
                setActivePergerakan={setActivePergerakan}
                exportPdf={true}
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

          {Array.isArray(vehicleData) && vehicleData.length > 0 && (
            <HourVehicleTable statusHour={true} vehicleData={vehicleData} />
          )}
          <ClasificationTable typeClass={activeClassification} />
        </div>
      </Suspense>
    </div>
  );
}

export default SurveiSimpangPage;
