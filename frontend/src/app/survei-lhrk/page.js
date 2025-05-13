"use client";
import { io } from 'socket.io-client';
import { useState, useEffect, Suspense, lazy } from 'react';
const MapComponent = lazy(() => import("@/app/components/map"));
// const VehicleMonitoringTable = lazy(() => import('@/app/components/vehicleMonitoringTable'));
const VehicleTable = lazy(() => import("@/app/components/vehicleTable"));
const ClasificationTable = lazy(() => import("@/app/components/clasificationTable"));
const SurveyInfoTable = lazy(() => import("@/app/components/surveyorTable"));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const RecentVehicle = lazy(() => import("@/app/components/recentVehicle"));
const CCTVStream = lazy(() => import('@/app/components/cctvStream'));

function SurveiLhrkPage () {
  const [vehicleData, setVehicleData] = useState(null);
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
  const [activePergerakan, setActivePergerakan] = useState('Semua');
  const [activeTitle, setActiveTitle] = useState("Survei LHRK")
  const [locationSelect, setLocationSelect] = useState("")
  
  function handleClick (T) {
    const replace = T.name.toLowerCase();
    console.log('clicked : ' + JSON.stringify(T));
    switch (replace) {
      case 'simpang piyungan':
        setLocationSelect('Simpang Piyungan');
        break;
      case 'simpang demen glagah':
        setLocationSelect('Simpang Demen Glagah');
        break;
      case 'simpang tempel':
        setLocationSelect('Simpang Tempel');
        break;
      case 'simpang prambanan':
        setLocationSelect('Simpang Prambanan');
        break;
    }
  }
  useEffect(() => {
    const before = "Survei LHRK "
    setActiveTitle(before + locationSelect)
  }, [locationSelect])

  useEffect(() => {
     import('@/data/sampleVehicleData.json').then((data) => {
      setVehicleData(data.default);
    });
  }, [])
  return (
    <div>
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        <MapComponent title={activeTitle} onClick={handleClick} />
        <div className="w-[95%] m-auto">
          <div className="xl:grid xl:grid-cols-2 items-center place-items-center lg:gap-5 py-10">
            <SurveyInfoTable />
            <div className="w-full justify-end flex flex-col">
              <SelectionButtons vehicleData={vehicleData}
                activeSurveyor={activeSurveyor}
                setActiveSurveyor={setActiveSurveyor}
                activeClassification={activeClassification}
                setActiveClassification={setActiveClassification}
                activePendekatan={activePendekatan}
                setActivePendekatan={setActivePendekatan}
                activePergerakan={activePergerakan}
                setActivePergerakan={setActivePergerakan} />
            </div>
          </div>
          <VehicleTable />
        </div>
      </Suspense>
    </div>
  );
}
export default SurveiLhrkPage 