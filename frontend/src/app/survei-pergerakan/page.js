"use client";
import { useState, useEffect, Suspense, lazy } from 'react';
import { io } from 'socket.io-client';
const ClasificationTable = lazy(() => import("@/app/components/clasificationTable"));
const HourVehicleTable = lazy(() => import('@/app/components/HourVehicleTable'));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const DirectionVehicleTable = lazy(() => import("@/app/components/directionVehicleTable"));
const SurveyInfoTable = lazy(() => import("@/app/components/surveyorTable"));
const MapComponent = lazy(() => import("@/app/components/map"));

function MovePage () {
  const [vehicleData, setVehicleData] = useState(null);
  const [directionData, setDirectionData] = useState(null);
  const [locationSelect, setLocationSelect] = useState("")
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
  const [activePergerakan, setActivePergerakan] = useState('Semua');
  const [activeTitle, setActiveTitle] = useState("Survei LHRK")
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
    const before = "Survei Pergerakan "
    setActiveTitle(before + locationSelect)
  }, [locationSelect])

  useEffect(() => {
    // Simulasi data dummy
    import('@/data/sampleVehicleData.json').then((data) => {
      setVehicleData(data.default);
    });
    import('@/data/DataDirection.json').then((data) => {
      setDirectionData(data.default);
    });
  }, []);
  useEffect(() => {
    console.log(activeSurveyor)
  }, [activeSurveyor])
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
          <DirectionVehicleTable Data={directionData}/>
        </div>
      </Suspense>
    </div>
  );
}
export default MovePage; 