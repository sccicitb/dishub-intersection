"use client";
import { useState, useEffect, Suspense, lazy } from "react";

const MapComponent = lazy(() => import("@/app/components/map"));
// const VehicleMonitoringTable = lazy(()=> import( '@/app/components/vehicleMonitoringTable'));
const VehicleTable = lazy(() => import("@/app/components/vehicleTable"));
const SurveyInfoTable = lazy(() => import("@/app/components/surveyorTable"));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const GridVertical = lazy(() => import('@/app/components/gridVertical'));
const GridHorizontal = lazy(() => import('@/app/components/gridHorizontal'));
const GrafikRoad = lazy(() => import("@/app/components/roadChart"));

function SurveiProporsi () {
  const [vehicleData, setVehicleData] = useState(null);
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
  const [activePergerakan, setActivePergerakan] = useState('Semua');
  const [activeTitle, setActiveTitle] = useState("Survei LHRK")
  useEffect(() => {
     import('@/data/sampleVehicleData.json').then((data) => {
      setVehicleData(data.default);
    });
  }, [])
  return (
    <div>
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        <MapComponent title={"Survei Proporsi"} />
        <div className="w-[95%] m-auto">
          <div className="xl:grid xl:grid-cols-2 items-center place-items-center py-10">
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
          <div className="flex flex-col w-fit bg-[#7585C1]/20 rounded-xl mx-auto font-semibold">
            <div className="flex justify-between">
              <div></div>
              <GridVertical position={true} />
              <div></div>
            </div>
            <div className="flex justify-center">
              <div className="">
                <GridHorizontal position={true} />
              </div>
              <div className="w-56 text-center items-center flex font-semibold text-xl bg-base-300"><div className="m-auto">Jumlah<br /> Kendaraan</div></div>
              <div className="">
                <GridHorizontal />
              </div>
            </div>
            <div className="flex justify-center">
              <div></div>
              <GridVertical />
              <div></div>
            </div>
          </div>
          <GrafikRoad />
        </div>
      </Suspense>
    </div>
  );
}
export default SurveiProporsi 