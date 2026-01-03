"use client";

import { useState, useEffect, Suspense, lazy } from 'react';
import { survey, maps, cameras } from '@/lib/apiService';
import { getCuacaJogja } from '@/lib/weatherAccess';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import VideoStream from '../components/videoStream';

const ClasificationTable = lazy(() => import("@/app/components/clasificationTable"));
const HourVehicleTable = lazy(() => import('@/app/components/HourVehicleTable'));
const SurveyInfoTable = lazy(() => import("@/app/components/surveyorTable"));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const DirectionVehicleTable = lazy(() => import("@/app/components/directionVehicleTable"));
const DirectionTable = lazy(() => import('../components/pergerakanTable'));
const MapComponent = lazy(() => import("@/app/components/map"));
const KeluarMasukTable = lazy(() => import('../components/table/keluarMasukTable'));

// import AdaptiveVideoPlayer from '../components/adaptiveCameraStream';
// import BlobVideoPlayer from '../components/blobVideoPlayer';

// const classificationMap = {
//   "PKJI 2023 Luar Kota": "luar_kota",
//   "PKJI 2023 Dalam Kota": "dalam_kota",
//   "PKJI 2023 Tipikal": "tipikal",
// };

function MovePage () {
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

  const formatDateToInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatDateToAPI = (dateStr) => dateStr.replace(/-/g, '/');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [dateInput, setDateInput] = useState(formatDateToInput(yesterday));

  // useEffect(() => {
  //   import('@/data/sampleVehicleData.json').then((data) => {
  //     setVehicleData(data.default);
  //   });
  //   import('@/data/DataDirection.json').then((data) => {
  //     setDirectionData(data.default);
  //   });
  // }, []);


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
        console.log(combinedData);
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
    console.log('fetchSurveyKM called', { activeSID, simpangModel, dateInput, activeInterval, activePendekatan });
    
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
      console.log('Fetching KM with params:', base);
      
      const data = await survey.getAllKM(
        base.camera_id,
        base.date,
        base.interval,
        base.approach
      );
      
      console.log('KM API Response:', {
        fullResponse: data,
        dataProperty: data?.data,
        vehicleData: data?.data?.data?.vehicleData
      });

      const kmData = data?.data?.data?.vehicleData || [];
      console.log('Setting dataKM with', kmData.length, 'periods');
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
        console.log('Fallback ke data lokal');
        setDataKM((data.default || []))
      });
    } finally {
      setLoadingKM(false);
    }
  }

  useEffect(() => {
    fetchSurvey();
    fetchSurveyKM();
  }, [activeSID, activeCamera, activeInterval, activePendekatan, activeDirection, dateInput, reportType]);

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
              <SelectionButtons vehicleData={vehicleData}
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
                direction
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
            <div className='content-center w-fit flex text-nowrap gap-2 rounded-lg text-sm p-2 bg-[#232f61] text-white font-semibold'>
              <div className='m-auto'>Keluar-Masuk Simpang</div>
              <input
                type="checkbox"
                checked={kmTableStatus}
                onChange={() => setKMTableStatus(!kmTableStatus)}
                className="bg-white/50 checkbox checkbox-xs text-white m-auto"
              />
            </div>
          </div>
          <DirectionTable vehicleData={vehicleData} classification={activeClassification} activePergerakan={activeDirection} activePendekatan={activePendekatan} />
          {kmTableStatus && (
            <Suspense fallback={<div>Loading Keluar-Masuk Table...</div>}>
              {errorKM && (
                <div className="alert alert-error mb-4">
                  <span>{errorKM}</span>
                </div>
              )}
              <KeluarMasukTable
                selectedDate={dateInput}
                setSelectedDate={setDateInput}
                loading={loadingKM}
                data={dataKM}
              />
            </Suspense>
          )}
          <ClasificationTable typeClass={activeClassification} />
        </div>
      </Suspense>
    </div>
  );
}
export default MovePage; 