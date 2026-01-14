"use client";

import { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { survey, maps, cameras } from '@/lib/apiService';
import { vehicles } from '@/lib/apiAccess';
import { useAuth } from "@/app/context/authContext";
import { getCuacaJogja } from '@/lib/weatherAccess';
import CameraStatusTimeline from '@/app/components/cameraStatusTime';
import { IoMdArrowDropdown } from "react-icons/io";
import { toast, ToastContainer } from 'react-toastify';
import { exportPergerakanToExcel } from '@/utils/exportPergerakan';
import DataKMTabelFallback from '@/data/DataKMTabel.json';
import 'react-toastify/dist/ReactToastify.css';

const ClasificationTable = lazy(() => import("@/app/components/clasificationTable"));
const SurveyInfoTable = lazy(() => import("@/app/components/surveyorTable"));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const MapComponent = lazy(() => import("@/app/components/map"));
const TrafficMatrixByCategory = lazy(() => import("@/app/components/trafficMatrixByCategory"));
const TrafficMatrixByFilter = lazy(() => import("@/app/components/trafficMatrixByFilter"));
const VehicleDetailByInterval = lazy(() => import("@/app/components/vehicleDetailByInterval"));
// const CameraStatusTimeline = lazy(() => import('@/app/components/cameraStatusTime'));
const GridVertical = lazy(() => import('@/app/components/gridVertical'));
const GridHorizontal = lazy(() => import('@/app/components/gridHorizontal'));
const HeaderSurvei = lazy(() => import("@/app/components/headerLhrt"));

function KomposisiLaluLintasPage () {
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
  const [activeTitle, setActiveTitle] = useState("Survei Komposisi Lalu Lintas");
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
  const [intersectionData, setIntersectionData] = useState({});

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

  // Fetch survey data


  // Function to fetch survey proporsi with filters
  const fetchSurveyProporsi = async (cameraId, category, date) => {
    if (!cameraId || !category || !date) {
      console.log('fetchSurveyProporsi: Missing parameters', { cameraId, category, date });
      return;
    }

    setLoading(true);
    try {
      console.log('fetchSurveyProporsi called with:', { cameraId, category, date });
      const res = await survey.getProporsi(cameraId, category, date);
      const datafetch = res?.data || {};
      setIntersectionData(datafetch);
      console.log('fetchSurveyProporsi success:', datafetch);
    } catch (err) {
      console.error('Error fetching survey proporsi:', err);
      console.error('Error details:', {
        status: err?.response?.status,
        message: err?.response?.data?.message || err?.message,
        url: err?.config?.url
      });
      setIntersectionData({});
    } finally {
      setLoading(false);
    }
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

          // Cari camera ID dari simpang pertama
          const firstSimpangId = simpangData[0].id;
          const matchedCamera = cameraData.find(cam => cam.ID_Simpang === firstSimpangId);

          if (matchedCamera && matchedCamera.id) {
            setActiveSimpangId(firstSimpangId); // Set simpang ID
            setActiveSID(matchedCamera.id); // Set camera ID
            setActiveCamera(matchedCamera.id);
            setActiveSimpang(matchedCamera.name || '');
          } else if (cameraData.length > 0 && cameraData[0]?.id) {
            // Fallback: gunakan camera pertama
            setActiveSimpangId(cameraData[0].ID_Simpang); // Set simpang ID
            setActiveSID(cameraData[0].id);
            setActiveCamera(cameraData[0].id);
            setActiveSimpang(cameraData[0].name || '');
          }
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
    if (loading || !activeSimpangId) return;

    const baseParams = {
      camera_id: activeSimpangId, // Gunakan simpang ID
      date: formatDateToAPI(dateInput),
      interval: activeInterval || '',
      approach: activePendekatan?.toLowerCase() || '',
      classification: "",
      reportType: reportType
    };

    try {
      if (activeDirection === 'Semua') {
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
    if (loading || !activeSimpangId) return;

    const base = {
      camera_id: activeSimpangId, // Gunakan simpang ID untuk km-tabel
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

      // Gunakan data fallback
      setDataKM(DataKMTabelFallback || []);
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
      fetchSurveyProporsi(activeSimpangId, activeClassification, formatDateToAPI(dateInput));
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
    try {
      const title = building.camera.name || "Tanpa Nama";
      setActiveTitle("Survei " + title);
      setActiveSimpang(title);
      setActiveCamera(building.camera.camera_id);
    } catch (error) {
      console.error("Error in handleClick:", error);
    }
  };

  const LoadingFallback = ({ message = "Loading..." }) => (
    <div className="text-center font-medium m-auto w-full p-4">
      <div className="loading loading-spinner loading-md"></div>
      <p className="mt-2">{message}</p>
    </div>
  );

  async function handleClickSimpang (loc) {
    try {
      setActiveSimpangId(loc.id)

      // Fetch camera data untuk simpang ini
      const cameraRes = await cameras.getAll();
      const cameraData = Array.isArray(cameraRes?.data?.cameras) ? cameraRes.data.cameras : [];

      // Cari camera yang sesuai dengan ID simpang
      const matchedCamera = cameraData.find(cam => cam.ID_Simpang === loc.id);

      if (matchedCamera && matchedCamera.id) {
        setActiveSID(matchedCamera.id) // Set camera ID
        setActiveCamera(matchedCamera.id)
        setActiveSimpang(matchedCamera.name || loc.name || '')
      } else {
        console.warn('Camera tidak ditemukan untuk simpang:', loc.id);
      }
    } catch (error) {
      console.error('Error in handleClickSimpang:', error);
    }
  }

  return (
    <div>
      <ToastContainer />
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        <MapComponent title={activeTitle} onClick={handleClick} onClickSimpang={handleClickSimpang} />
        <div className="w-[95%] m-auto">

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
                activeDirection={activeDirection}
                setActiveDirection={setActiveDirection}
                interval
                pendekatan
              />
            </div>
          </div>
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

          <div className="flex flex-col">
            {loading ? (
              <LoadingFallback message="Loading survey data..." />
            ) : (
              <div className="w-full my-10 overflow-x-auto">
                <div className="min-w-[450px] flex flex-col w-fit bg-[#BCC3E1] mx-auto font-semibold">
                  <Suspense fallback={<LoadingFallback />}>
                    {/* North */}
                    <div className="flex justify-center">
                      <div></div>
                      <GridVertical
                        position={true}
                        data={intersectionData?.north || {}}
                        category
                      />
                      <div></div>
                    </div>

                    {/* West - Center - East */}
                    <div className="flex justify-center">
                      <GridHorizontal
                        position={true}
                        data={intersectionData?.west || {}}
                        category
                      />
                      <div className="w-40 text-center items-center flex font-medium text-sm bg-stone-400">
                        <div className="m-auto">
                          Jumlah<br />Kendaraan <br />
                          {intersectionData?.vehicleCount || "0"}
                        </div>
                      </div>
                      <GridHorizontal
                        position={false}
                        data={intersectionData?.east || {}}
                        category
                      />
                    </div>

                    {/* South */}
                    <div className="flex justify-center">
                      <div></div>
                      <GridVertical
                        position={false}
                        data={intersectionData?.south || {}}
                        category
                      />
                      <div></div>
                    </div>
                  </Suspense>
                </div>
              </div>
            )}

            <div className="w-[85%] mx-auto mb-8">
              <CameraStatusTimeline
                cameraId={activeSID}
                selectedDate={dateInput}
              />
            </div>
          </div>

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
                    simpangId={activeSimpangId}
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
                    simpangId={activeSimpangId}
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
                    simpangId={activeSimpangId}
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
export default KomposisiLaluLintasPage; 
