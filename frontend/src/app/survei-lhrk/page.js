"use client";
import { useState, useEffect, Suspense, lazy } from 'react';
import { getCuacaJogja } from '@/lib/weatherAccess';
import { maps } from '@/lib/apiService';

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
  const [activeCamera, setActiveCamera] = useState(1);
  const [activeSID, setActiveSID] = useState();
  const [activeTitle, setActiveTitle] = useState("Survei LHRK")
  const [Cuaca, setCuaca] = useState("")
  const [fetchStatus, setFetchStatus] = useState(false)

  useEffect(() => {
    // Fetch simpang data first to get the ID
    const fetchSimpangData = async () => {
      try {
        const simpangRes = await maps.getAllSimpang();
        const simpangData = Array.isArray(simpangRes?.data?.simpang) ? simpangRes.data.simpang : [];
        
        let cuaca;
        if (simpangData.length > 0 && simpangData[0]?.id) {
          cuaca = await getCuacaJogja(simpangData[0].latitude, simpangData[0].longitude)
          setActiveSID(simpangData[0].id);
        }
        
        setCuaca(cuaca)
        setFetchStatus(true)
      } catch (err) {
        console.error('Error fetching simpang data:', err);
      }
    };

    fetchSimpangData();
  }, []);

  const handleClick = (building) => {
    // Pastikan objek valid dan memiliki properti kamera
    if (!building) {
      console.warn("Invalid building or camera data", building);
      return;
    }
    try {
      const title = building.camera.name || "Tanpa Nama";
      setActiveSimpang(title);
      setActiveCamera(building.camera.id);
    } catch (error) {
      console.error("Error in handleClick:", error);
    }
  };

  function handleClickSimpang (loc) {

    
    // Handle "Semua Simpang" case
    if (loc && loc.simpang === "semua") {
      setActiveTitle("Survei Semua Simpang");
      setActiveSID("semua");
      setActiveSimpangId("semua");
      return;
    }

    // Handle individual simpang case
    if (!loc || !loc.Nama_Simpang) {
      console.error("Invalid loc data:", loc);
      return;
    }

    let name = loc.Nama_Simpang;
    if (!name.toLowerCase().includes("simpang")) {
      name = "Simpang " + name;
    }
    setActiveTitle("Survei " + name);
    setActiveSID(loc.id);
    setActiveSimpangId(loc.id);
  }
  return (
    <div>
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        <MapComponent title={activeTitle} onClick={handleClick} onClickSimpang={handleClickSimpang} />
        <div className="w-[95%] m-auto">
          <div className="flex max-lg:flex-col items-center place-items-center max-lg:space-y-5 py-5">
            <SurveyInfoTable fetchStatus={fetchStatus} id={activeSID} cuaca={Cuaca} />
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
            <VehicleTable activeCamera={activeSID} activeInterval={activeInterval} activePendekatan={activePendekatan} activePergerakan={activePergerakan} activeClassification={activeClassification} />
          )}
          <ClasificationTable typeClass={activeClassification} activeInterval={activeInterval} />
        </div>
      </Suspense>
    </div>
  );
}
export default SurveiLhrkPage 
