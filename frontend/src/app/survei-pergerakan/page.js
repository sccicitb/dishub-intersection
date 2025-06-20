"use client";

import { useState, useEffect, Suspense, lazy } from 'react';
import VideoStream from '../components/videoStream';

const ClasificationTable = lazy(() => import("@/app/components/clasificationTable"));
const HourVehicleTable = lazy(() => import('@/app/components/HourVehicleTable'));
const SurveyInfoTable = lazy(() => import("@/app/components/surveyorTable"));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const DirectionVehicleTable = lazy(() => import("@/app/components/directionVehicleTable"));
const DirectionTable = lazy(() => import('../components/pergerakanTable'));
const MapComponent = lazy(() => import("@/app/components/map"));

import { survey } from '@/lib/apiService';
import AdaptiveVideoPlayer from '../components/adaptiveCameraStream';
import BlobVideoPlayer from '../components/blobVideoPlayer';

const classificationMap = {
  "PKJI 2023 Luar Kota": "luar_kota",
  "PKJI 2023 Dalam Kota": "dalam_kota",
  "PKJI 2023 Tipikal": "tipikal",
};

function MovePage () {
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [directionData, setDirectionData] = useState(null);
  const [reportType] = useState('hourly');
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
  const [activeInterval, setActiveInterval] = useState('');
  const [activeDirection, setActiveDirection] = useState('Semua');
  const [activeTitle, setActiveTitle] = useState("Survei Pergerakan");
  const [activeSimpangId, setActiveSimpangId] = useState(0);
  const [activeSimpang, setActiveSimpang] = useState("");
  const [activeCamera, setActiveCamera] = useState(1);

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

  const fetchSurvey = async () => {
    if (!activeCamera) return;

    // const classificationParam = classificationMap[activeClassification] || activeClassification?.toLowerCase().replace(/\s+/g, '_');
    const baseParams = {
      // camera_id: activeCamera,
      camera_id: activeSimpangId,
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
        setLoading(true);

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
        // Ketika arah spesifik dipilih, panggil API sekali saja
        // const directionParam = activeDirection === 'Belok Kiri' ? 'kiri' :
        //   activeDirection === 'Belok Kanan' ? 'belok_kanan' :
        //     activeDirection === 'Lurus' ? 'lurus' : '';

        setLoading(true);

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

  useEffect(() => {
    fetchSurvey();
  }, [activeSimpangId, activeCamera, activeInterval, activePendekatan, activeDirection, dateInput, reportType]);

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
  }
  return (
    <div>
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        <MapComponent title={activeTitle} onClick={handleClick} onClickSimpang={handleClickSimpang} />
        <div className="w-[95%] m-auto">
          <div className="flex max-lg:flex-col items-center place-items-center maxx-lg:space-y-5 py-5">
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
          </div>
          {!loading ? (
            <DirectionTable vehicleData={vehicleData} classification={activeClassification} activePergerakan={activeDirection} activePendekatan={activePendekatan} />
          ) : <div className='my-5'>Loading...</div>}
          <ClasificationTable typeClass={activeClassification} />
        </div>
      </Suspense>
    </div>
  );
}
export default MovePage; 