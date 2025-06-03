"use client";
import { useState, useEffect, Suspense, lazy } from 'react';

// import { survey } from '@/lib/apiService';

// const VehicleMonitoringTable = lazy(() => import('@/app/components/vehicleMonitoringTable'));
const VehicleTable = lazy(() => import("@/app/components/vehicleTable"));
const ClasificationTable = lazy(() => import("@/app/components/clasificationTable"));
const SurveyInfoTable = lazy(() => import("@/app/components/surveyorTable"));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const RecentVehicle = lazy(() => import("@/app/components/recentVehicle"));
const CCTVStream = lazy(() => import('@/app/components/cctvStream'));
const MapComponent = lazy(() => import("@/app/components/map"));

function SurveiLhrkPage () {
  const [loading, setLoading] = useState(false);
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
  const [activeInterval, setActiveInterval] = useState('');
  const [activePergerakan, setActivePergerakan] = useState('Semua');
  const [activeSimpang, setActiveSimpang] = useState("");
  const [vehicleData, setVehicleData] = useState([]);
  const [activeSimpangId, setActiveSimpangId] = useState(0)
  const [activeCamera, setActiveCamera] = useState('detection1');
  const [activeTitle, setActiveTitle] = useState("Survei LHRK")


  // const formatDateToInput = (date) => {
  //   if (!date) return "";
  //   const d = new Date(date);
  //   const yyyy = d.getFullYear();
  //   const mm = String(d.getMonth() + 1).padStart(2, '0');
  //   const dd = String(d.getDate()).padStart(2, '0');
  //   return `${yyyy}-${mm}-${dd}`;
  // };

  // const formatDateToYMDForAPI = (dateStr) => {
  //   return dateStr.replace(/-/g, '/');
  // };

  // const yesterday = new Date();
  // yesterday.setDate(yesterday.getDate() - 1);
  // const [dateInput, setDateInput] = useState(formatDateToInput(yesterday));


  // const fetchSurvey = async (active, date, interval) => {
  //   setLoading(true)
  //   try {
  //     const res = await survey.getAll(active.slice(active.indexOf('n') + 1), date, interval);
  //     const datafetch = Array.isArray(res?.data?.vehicleData) ? res.data.vehicleData : [];
  //     setVehicleData(datafetch);
  //     setLoading(false)
  //   } catch (err) {
  //     setLoading(false)
  //     console.error('Error fetching survey data:', err);
  //     setVehicleData([]);
  //   }
  // };

  const handleClick = (building) => {
    // Pastikan objek valid dan memiliki properti kamera
    if (
      !building ||
      typeof building !== 'object' ||
      !building.camera ||
      typeof building.camera !== 'object' || // setelah pemilihan kamera, harus objek
      !building.camera.camera_id
    ) {
      console.warn("Invalid building or camera data", building);
      return;
    }

    try {
      const title = building.camera.name || "Tanpa Nama";
      setActiveTitle("Survei " + title);
      setActiveSimpang(title);
      setActiveCamera(building.camera.camera_id);
    } catch (error) {
      console.error("Error in handleClick:", error);
    }
  };


  // useEffect(() => {
  //   if (activeCamera) {
  //     fetchSurvey(activeCamera, formatDateToYMDForAPI(dateInput), activeInterval);
  //   }
  // }, [dateInput, activeCamera, activeInterval]);

  // useEffect(() => {
  //   if (activeCamera) {
  //     fetchSurvey(activeCamera, formatDateToYMDForAPI(dateInput), activeInterval);
  //   }
  // }, []);

  function handleClickSimpang (loc) {
    setActiveSimpangId(loc.id)
  }
  return (
    <div>
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        <MapComponent title={activeTitle} onClick={handleClick} onClickSimpang={handleClickSimpang} />
        <div className="w-[95%] m-auto">
          <div className="xl:grid xl:grid-cols-2 items-center place-items-center lg:gap-5 py-10">
            <SurveyInfoTable />
            <div className="w-full justify-end flex flex-col">
              <SelectionButtons vehicleData={vehicleData}
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
                interval
              />
            </div>
          </div>
          {/* <div className="w-full flex justify-end mb-4">
            <label className="mr-2 font-medium">Pilih Tanggal:</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
          </div> */}
          {loading ? (<div className='my-5'>Loading...</div>) : (
            <VehicleTable activeCamera={activeCamera} activeInterval={activeInterval} />
          )}
          <ClasificationTable typeClass={activeClassification} activeInterval={activeInterval} />
        </div>
      </Suspense>
    </div>
  );
}
export default SurveiLhrkPage 