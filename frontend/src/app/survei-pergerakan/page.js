"use client";

import { IoMdArrowDropdown } from "react-icons/io";
import { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { useAuth } from "@/app/context/authContext";
import { survey, maps, cameras } from '@/lib/apiService';
import { vehicles } from '@/lib/apiAccess';
import { getCuacaJogja } from '@/lib/weatherAccess';
import { toast, ToastContainer } from 'react-toastify';
import { exportPergerakanToExcel } from '@/utils/exportPergerakan';
import 'react-toastify/dist/ReactToastify.css';

const ClasificationTable = lazy(() => import("@/app/components/clasificationTable"));
const SurveyInfoTable = lazy(() => import("@/app/components/surveyorTable"));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const MapComponent = lazy(() => import("@/app/components/map"));
const TrafficMatrixByCategory = lazy(() => import("@/app/components/trafficMatrixByCategory"));
const TrafficMatrixByFilter = lazy(() => import("@/app/components/trafficMatrixByFilter"));
const VehicleDetailByInterval = lazy(() => import("@/app/components/vehicleDetailByInterval"));

function MovePage () {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  // const [directionData, setDirectionData] = useState(null);
  const [reportType] = useState('hourly');
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
  const [activeInterval, setActiveInterval] = useState('1h');
  const [activeDirection, setActiveDirection] = useState('Semua');
  const [activeTitle, setActiveTitle] = useState("Survei Pergerakan");
  const [activeSimpangId, setActiveSimpangId] = useState(0);
  const [activeSimpang, setActiveSimpang] = useState("");
  const [activeCamera, setActiveCamera] = useState(1);
  const [kmTableStatus, setKMTableStatus] = useState(false);
  const [activeSID, setActiveSID] = useState();
  const [Cuaca, setCuaca] = useState("")
  const [fetchStatus, setFetchStatus] = useState(false)
  const [dataKM, setDataKM] = useState([])
  const [simpangModel, setSimpangModel] = useState([])
  const [loadingKM, setLoadingKM] = useState(false)
  const [errorKM, setErrorKM] = useState(null)
  const [submitCounter, setSubmitCounter] = useState(0)
  const [exportLoading, setExportLoading] = useState(false)
  
  // Toggle visibility for analysis components
  const [showTrafficMatrixByCategory, setShowTrafficMatrixByCategory] = useState(true);
  const [showTrafficMatrixByFilter, setShowTrafficMatrixByFilter] = useState(true);
  const [showVehicleDetailByInterval, setShowVehicleDetailByInterval] = useState(true);

  const trafficMatrixRef = useRef(null);
  const trafficMatrixByHoursRef = useRef(null);
  const trafficMatrixByFilterRef = useRef(null);
  const vehicleDetailByIntervalRef = useRef(null);

  const formatDateToInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatDateToAPI = (dateStr) => dateStr.replace(/-/g, '/');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [dateInput, setDateInput] = useState(formatDateToInput(yesterday));

  const fetchMatrix = async () => {
    // Trigger API calls in child components via refs
  };

  useEffect(() => {
    // Fetch simpang data first to get the ID
    const fetchSimpangData = async () => {
      try {
        const simpangRes = await maps.getAllSimpang();
        const cameraRes = await cameras.getAll();
        const simpangData = Array.isArray(simpangRes?.data?.simpang) ? simpangRes.data.simpang : [];
        const cameraData = Array.isArray(cameraRes?.data?.cameras) ? cameraRes.data.cameras : [];
        setSimpangModel(cameraData.filter(item => item.socket_event !== "not_yet_assign").map(d => d.ID_Simpang))

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

  const fetchSurvey = async () => {
    if (loading || !activeSID) return;
    // const classificationParam = classificationMap[activeClassification] || activeClassification?.toLowerCase().replace(/\s+/g, '_');
    const baseParams = {
      // camera_id: activeCamera,
      camera_id: activeSID,
      date: formatDateToAPI(dateInput),
      interval: activeInterval || '',
      approach: activePendekatan?.toLowerCase() || '',
      classification: "",
      reportType: reportType
    };

    try {
      if (activeDirection === 'Semua') {
        // Ketika "Semua" dipilih, panggil API 4 kali untuk setiap arah
        // const pergerakanApiCalls = ['belok_kiri', 'belok_kanan', 'lurus', ''];
        const pergerakanApiCalls = ['timur', 'barat', 'utara', 'selatan'];
        const promises = pergerakanApiCalls.map(direction =>
          survey.getAll(
            baseParams.camera_id,
            baseParams.date,
            baseParams.interval,
            baseParams.approach,
            baseParams.classification,
            baseParams.reportType,
            direction,
          )
        );

        const responses = await Promise.all(promises);

        // Gabungkan data dari semua response atau buat struktur data per arah
        // const combinedData = {
        //   belok_kiri: responses[0]?.data?.vehicleData || responses[0]?.data || [],
        //   belok_kanan: responses[1]?.data?.vehicleData || responses[1]?.data || [],
        //   lurus: responses[2]?.data?.vehicleData || responses[2]?.data || [],
        //   semua: responses[3]?.data?.vehicleData || responses[3]?.data || []
        // };

        const combinedData = {
          timur: responses[0]?.data?.vehicleData || responses[0]?.data || [],
          barat: responses[1]?.data?.vehicleData || responses[1]?.data || [],
          selatan: responses[2]?.data?.vehicleData || responses[2]?.data || [],
          utara: responses[3]?.data?.vehicleData || responses[3]?.data || []
        };
        setVehicleData(combinedData);
      } else {
        const res = await survey.getAll(
          baseParams.camera_id,
          baseParams.date,
          baseParams.interval,
          baseParams.approach,
          baseParams.classification,
          baseParams.reportType,
          activeDirection,
        );

        setVehicleData(res?.data?.vehicleData || res?.data || []);
      }
    } catch (err) {
      setLoading(false);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };


  const fetchSurveyKM = async () => {

    
    if (loading || !activeSID) return;


    const base = {
      camera_id: activeSID,
      date: dateInput, // Format YYYY-MM-DD dari input
      interval: activeInterval || '',
      approach: activePendekatan?.toLowerCase() || '',
    };

    try {
      setLoadingKM(true);
      setErrorKM(null);

      
      const data = await survey.getAllKM(
        base.camera_id,
        base.date,
        base.interval,
        base.approach
      );

      const kmData = data?.data?.data?.vehicleData || [];
      setDataKM(kmData);
    } catch (err) {
      console.error('Error fetching KM:', {
        error: err,
        message: err?.message,
        responseStatus: err?.response?.status,
        responseData: err?.response?.data
      });
      setErrorKM(err?.response?.data?.message || err?.message || 'Gagal mengambil data Keluar-Masuk');
      
      import("@/data/DataKMTabel.json").then((data) => {

        setDataKM((data.default || []))
      });
    } finally {
      setLoadingKM(false);
    }
  }

  const handleExportExcel = async () => {
    if (!dateInput || !activeSimpang) {
      alert('Pilih tanggal dan simpang terlebih dahulu');
      return;
    }

    setExportLoading(true);
    try {
      const fileName = `survei-pergerakan-${dateInput}.xlsx`;
      const simpangName = `${activeSimpang}`;

      console.log('ðŸ”„ Starting Pergerakan export:', { dateInput, simpangName, vehicleDataKeys: vehicleData ? Object.keys(vehicleData) : [], kmDataLength: dataKM?.length });

      const result = await exportPergerakanToExcel(
        vehicleData,
        dataKM,
        dateInput,
        simpangName,
        fileName
      );

      if (!result.success) {
        alert('Gagal export Excel:\n' + (result.message || 'Unknown error'));
      } else {
        alert('âœ… Export berhasil! File sudah didownload.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Terjadi kesalahan saat export Excel');
    } finally {
      setExportLoading(false);
    }
  }

  useEffect(() => {
    if (submitCounter > 0) {
      fetchSurvey();
      fetchSurveyKM();
      fetchMatrix();
      if (trafficMatrixRef.current) trafficMatrixRef.current.refetchData();
      if (trafficMatrixByHoursRef.current) trafficMatrixByHoursRef.current.refetchData();
      if (trafficMatrixByFilterRef.current) trafficMatrixByFilterRef.current.refetchData();
      if (vehicleDetailByIntervalRef.current) vehicleDetailByIntervalRef.current.refetchData();
    }
  }, [submitCounter]);

  const handleClick = (building) => {
    if (!building) {
      console.warn("Invalid building or camera data", building);
      return;
    }
    
    // Check if handling for "semua" is needed here too? Assuming standard behavior for now.
    if (building.id === "semua" || building.simpang === "semua") {
      // Assuming behavior similar to other pages, but context is different (survei-pergerakan)
      // If not needed, just the safety check is fine.
      // But let's stay safer with property access
    }

    try {
      if (building.camera) {
        const title = building.camera.name || "Tanpa Nama";
        setActiveTitle("Survei " + title);
        setActiveSimpang(title);
        if (building.camera.camera_id) setActiveCamera(building.camera.camera_id);
      } else if (building.id) {
         // Fallback if no camera property
         const title = building.name || "Tanpa Nama";
         setActiveTitle("Survei " + title);
         setActiveSimpang(title);
         // camera_id might not be available, handle gracefully
      }
    } catch (error) {
      console.error("Error in handleClick:", error);
    }
  };

  function handleClickSimpang (loc) {
    setActiveSimpangId(loc.id)
    setActiveSID(loc.id)
  }

  return (
    <div>
      <ToastContainer />
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        <MapComponent title={activeTitle} onClick={handleClick} onClickSimpang={handleClickSimpang} />
        <div className="w-[95%] m-auto">
          <div className="flex max-lg:flex-col items-center place-items-center maxx-lg:space-y-5 py-5">
            <SurveyInfoTable fetchStatus={fetchStatus} id={activeSID} cuaca={Cuaca} />

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
                activeDirection={activeDirection}
                setActiveDirection={setActiveDirection}
                interval
                pendekatan
              />
            </div>
          </div>
          {/* <DirectionVehicleTable Data={directionData} activeDirection={activeDirection} activePendekatan={activePendekatan} /> */}
          <div className="flex gap-5 items-center">
            <label className="mr-2 font-medium">Pilih Tanggal:</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
            <button
              onClick={() => {
                setSubmitCounter(submitCounter + 1);
                // Trigger fetch di TrafficMatrixByCategory component
                if (trafficMatrixRef.current?.refetchData) {
                  trafficMatrixRef.current.refetchData();
                }
                // Trigger fetch di TrafficMatrixByHours component
                if (trafficMatrixByHoursRef.current?.refetchData) {
                  trafficMatrixByHoursRef.current.refetchData();
                }
                // Trigger fetch di TrafficMatrixByFilter component
                if (trafficMatrixByFilterRef.current?.refetchData) {
                  trafficMatrixByFilterRef.current.refetchData();
                }
              }}
              className="btn btn-md bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Submit
            </button>

            {isAdmin && (
              <button
                onClick={handleExportExcel}
                disabled={exportLoading || !dateInput || !activeSimpang}
                className="btn btn-md bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportLoading ? (
                  <>
                    <span className="animate-spin">âŸ³</span>
                    Exporting...
                  </>
                ) : (
                  'Export Excel'
                )}
              </button>
            )}
          </div>
          {/* <DirectionTable vehicleData={vehicleData} classification={activeClassification} activePergerakan={activeDirection} activePendekatan={activePendekatan} /> */}
          
          {/* Analysis Components Section */}
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-[#232f61]">Analisis Data Pergerakan</h2>
            
            {/* Traffic Matrix By Category */}
            <div className="border border-base-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowTrafficMatrixByCategory(!showTrafficMatrixByCategory)}
                className="w-full px-6 py-4 bg-base-200 flex items-center justify-between font-semibold text-left cursor-pointer hover:bg-base-300 transition"
              >
                <span>Data Pergerakan Berdasarkan Kategori Kendaraan</span>
                <span className={`transition-transform ${showTrafficMatrixByCategory ? 'rotate-180' : ''}`}><IoMdArrowDropdown size={20} /></span>
              </button>
              <div style={{ display: showTrafficMatrixByCategory ? 'block' : 'none' }} className="p-6">
                <Suspense fallback={<div className="flex justify-center"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <TrafficMatrixByCategory 
                    ref={trafficMatrixRef}
                    simpangId={activeSID} 
                    startDate={dateInput}
                    endDate={dateInput}
                    onFetch={fetchMatrix}
                    simpangName={activeSimpang}
                  />
                </Suspense>
              </div>
            </div>

            {/* Traffic Matrix By Filter */}
            <div className="border border-base-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowTrafficMatrixByFilter(!showTrafficMatrixByFilter)}
                className="w-full px-6 py-4 bg-base-200 flex items-center justify-between font-semibold text-left cursor-pointer hover:bg-base-300 transition"
              >
                <span>Data Pergerakan Dengan Filter Interval</span>
                <span className={`transition-transform ${showTrafficMatrixByFilter ? 'rotate-180' : ''}`}><IoMdArrowDropdown size={20} /></span>
              </button>
              <div style={{ display: showTrafficMatrixByFilter ? 'block' : 'none' }} className="p-6">
                <Suspense fallback={<div className="flex justify-center"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <TrafficMatrixByFilter
                    ref={trafficMatrixByFilterRef}
                    simpangId={activeSID} 
                    dateInput={dateInput}
                    simpangName={activeSimpang}
                  />
                </Suspense>
              </div>
            </div>

            {/* Vehicle Detail By Interval */}
            <div className="border border-base-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowVehicleDetailByInterval(!showVehicleDetailByInterval)}
                className="w-full px-6 py-4 bg-base-200 flex items-center justify-between font-semibold text-left cursor-pointer hover:bg-base-300 transition"
              >
                <span>Detail Kendaraan Per Interval</span>
                <span className={`transition-transform ${showVehicleDetailByInterval ? 'rotate-180' : ''}`}><IoMdArrowDropdown size={20} /></span>
              </button>
              <div style={{ display: showVehicleDetailByInterval ? 'block' : 'none' }} className="p-6">
                <Suspense fallback={<div className="flex justify-center"><span className="loading loading-spinner loading-lg"></span></div>}>
                  <VehicleDetailByInterval
                    ref={vehicleDetailByIntervalRef}
                    simpangId={activeSID} 
                    dateInput={dateInput}
                    simpangName={activeSimpang}
                  />
                </Suspense>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <ClasificationTable typeClass={activeClassification} />
          </div>
        </div>
      </Suspense>
    </div>
  );
}
export default MovePage; 
