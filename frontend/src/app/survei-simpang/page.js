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

import DataSimpang from '@/data/DataSimpang.json';

function SurveiSimpangPage () {
  const [socketConnected, setSocketConnected] = useState(false);
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
  const [activePergerakan, setActivePergerakan] = useState('Semua');

  const [activeCamera, setActiveCamera] = useState(DataSimpang.buildings[0].camera.id);
  const [activeTitle, setActiveTitle] = useState("Survei " + DataSimpang.buildings[0].name);
  const [streamData, setStreamData] = useState({});
  const [vehicleData, setVehicleData] = useState(null);
  
  const activeSimpang = DataSimpang.buildings.find(b => b.camera.id === activeCamera);
  // Setup socket
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

    // Subscribe all available socket events dynamically
    DataSimpang.buildings.forEach((building) => {
      const event = building.camera.socketEvent;
      socket.on(event, (data) => {
        setStreamData(prev => ({
          ...prev,
          [building.camera.id]: data
        }));
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Load dummy data
  useEffect(() => {
    import('@/data/sampleVehicleData.json').then((data) => {
      setVehicleData(data.default);
    });
  }, []);

  const handleClick = (building) => {
    setActiveCamera(building.camera.id);
    setActiveTitle("Survei " + building.name);
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
                  title={`CCTV Camera ${activeCamera.slice(-1) } (${activeSimpang?.name})`}
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

          <HourVehicleTable statusHour={true} />
          <ClasificationTable typeClass={activeClassification} />
        </div>
      </Suspense>
    </div>
  );
}

export default SurveiSimpangPage;
