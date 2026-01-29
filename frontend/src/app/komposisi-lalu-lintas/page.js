"use client";

import { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { cameras } from '@/lib/apiService';
import { useAuth } from "@/app/context/authContext";
import CameraStatusTimeline from '@/app/components/cameraStatusTime';
import { toast, ToastContainer } from 'react-toastify';
import { exportPergerakanToExcel } from '@/utils/exportPergerakan';
import 'react-toastify/dist/ReactToastify.css';
import { useSurveyData, useInitialData } from '@/hooks/useSurveyData';
import CollapsibleSection from '@/components/CollapsibleSection';

const ClasificationTable = lazy(() => import("@/app/components/clasificationTable"));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const MapComponent = lazy(() => import("@/app/components/map"));
const TrafficMatrixByCategory = lazy(() => import("@/app/components/trafficMatrixByCategory"));
const TrafficMatrixByFilter2 = lazy(() => import("@/app/components/trafficMatrixByFilter2"));
const VehicleDetailByInterval = lazy(() => import("@/app/components/vehicleDetailByInterval"));
const GridVertical = lazy(() => import('@/app/components/gridVertical'));
const GridHorizontal = lazy(() => import('@/app/components/gridHorizontal'));
const HeaderSurvei = lazy(() => import("@/app/components/headerLhrt"));

function KomposisiLaluLintasPage() {
  const { isAdmin } = useAuth();

  // Grouped states
  const activeStates = {
    surveyor: useState('Semua'),
    classification: useState('PKJI 2023 Luar Kota'),
    pendekatan: useState('Semua'),
    interval: useState('1h'),
    direction: useState('Semua'),
    title: useState("Survei Komposisi Lalu Lintas"),
  };

  const [dateInput, setDateInput] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });

  const [submitCounter, setSubmitCounter] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);

  // Custom hooks
  const {
    activeSimpangId, setActiveSimpangId,
    activeSimpang, setActiveSimpang,
    activeCamera, setActiveCamera,
    activeSID, setActiveSID,
  } = useInitialData();

  const {
    loading, vehicleData, dataKM, intersectionData, loadingKM, errorKM
  } = useSurveyData(activeSimpangId, dateInput, activeStates.interval[0], activeStates.pendekatan[0], activeStates.direction[0], activeStates.classification[0], submitCounter);

  // Refs
  const trafficMatrixRef = useRef(null);
  const trafficMatrixByFilterRef = useRef(null);
  const vehicleDetailByIntervalRef = useRef(null);

  const handleExportExcel = async () => {
    if (!dateInput || !activeSimpang) {
      alert('Pilih tanggal dan simpang terlebih dahulu');
      return;
    }

    setExportLoading(true);
    try {
      const fileName = `survei-pergerakan-${dateInput}.xlsx`;
      const simpangName = `${activeSimpang}`;

      const result = await exportPergerakanToExcel(vehicleData, dataKM, dateInput, simpangName, fileName);

      if (!result.success) {
        alert('Gagal export Excel:\n' + (result.message || 'Unknown error'));
      } else {
        alert('✅ Export berhasil! File sudah didownload.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Terjadi kesalahan saat export Excel');
    } finally {
      setExportLoading(false);
    }
  };

  const handleClick = (building) => {
      if (!building || !building.camera) return;
    const title = building.camera.name || "Tanpa Nama";
    activeStates.title[1]("Survei " + title);
    setActiveSimpang(title);
    setActiveCamera(building.camera.camera_id);
  };

  const handleClickSimpang = async (loc) => {
    try {
      setActiveSimpangId(loc.id);
      console.log('Matched camera for simpang:', loc);
      const cameraRes = await cameras.getAll();
      const cameraData = Array.isArray(cameraRes?.data?.cameras) ? cameraRes.data.cameras : [];
      const matchedCamera = cameraData.find(cam => cam.ID_Simpang === loc.id);

      if (matchedCamera && matchedCamera.id) {
        setActiveSID(matchedCamera.id);
        setActiveCamera(matchedCamera.id);
        console.log('Matched camera for simpang:', loc.id, matchedCamera);
        setActiveSimpang(matchedCamera.name || loc.name || '');
      } else {
        console.warn('Camera tidak ditemukan untuk simpang:', loc.id);
      }
    } catch (error) {
      console.error('Error in handleClickSimpang:', error);
    }
  };

  const LoadingFallback = ({ message = "Loading..." }) => (
    <div className="text-center font-medium m-auto w-full p-4">
      <div className="loading loading-spinner loading-md"></div>
      <p className="mt-2">{message}</p>
    </div>
  );

  const triggerRefetch = () => {
    [trafficMatrixRef, trafficMatrixByFilterRef, vehicleDetailByIntervalRef].forEach(ref => {
      ref.current?.refetchData?.();
    });
  };

  return (
    <div>
      <ToastContainer />
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        <MapComponent title={activeStates.title[0]} onClick={handleClick} onClickSimpang={handleClickSimpang} />
        <div className="w-[95%] m-auto">
          <div className="flex flex-col max-lg:flex-col items-center place-items-center max-lg:space-y-5 py-5 gap-5">
            <HeaderSurvei simpangId={activeSimpangId} selectedDate={dateInput} arahPergerakan={activeStates.pendekatan[0]} />
            <div className="w-full justify-end flex flex-col">
              <SelectionButtons
                vehicleData={vehicleData}
                activeSurveyor={activeStates.surveyor[0]}
                setActiveSurveyor={activeStates.surveyor[1]}
                activeClassification={activeStates.classification[0]}
                setActiveClassification={activeStates.classification[1]}
                setActiveInterval={activeStates.interval[1]}
                activeInterval={activeStates.interval[0]}
                activePendekatan={activeStates.pendekatan[0]}
                setActivePendekatan={activeStates.pendekatan[1]}
                activeDirection={activeStates.direction[0]}
                setActiveDirection={activeStates.direction[1]}
                interval
              />
            </div>
          </div>
          <div className="flex gap-5 items-center">
            <input
              type="date"
              className="border rounded px-2 py-2"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
            <button
              onClick={() => {
                setSubmitCounter(submitCounter + 1);
                triggerRefetch();
              }}
              className="btn btn-md bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Submit
            </button>
            {isAdmin && (
              <button
                onClick={handleExportExcel}
                disabled={exportLoading || !dateInput || !activeSimpang}
                className="btn btn-md bg-indigo-950/90 text-white rounded-lg font-semibold hover:bg-indigo-950 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportLoading ? (
                  <>
                    <span className="animate-spin">↻</span>
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
                    <div className="flex justify-center">
                      <div></div>
                      <GridVertical position={true} data={intersectionData?.north || {}} category />
                      <div></div>
                    </div>
                    <div className="flex justify-center">
                      <GridHorizontal position={true} data={intersectionData?.west || {}} category />
                      <div className="w-40 text-center items-center flex font-medium text-sm bg-stone-400">
                        <div className="m-auto">
                          Jumlah<br />Kendaraan <br />
                          {intersectionData?.vehicleCount || "0"}
                        </div>
                      </div>
                      <GridHorizontal position={false} data={intersectionData?.east || {}} category />
                    </div>
                    <div className="flex justify-center">
                      <div></div>
                      <GridVertical position={false} data={intersectionData?.south || {}} category />
                      <div></div>
                    </div>
                  </Suspense>
                </div>
              </div>
            )}
            <div className="w-[85%] mx-auto mb-8">
              <CameraStatusTimeline cameraId={activeSID} selectedDate={dateInput} />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-[#232f61]">Analisis Data Pergerakan</h2>
            <CollapsibleSection title="Data Pergerakan Berdasarkan Kategori Kendaraan">
              <Suspense fallback={<div className="flex justify-center"><span className="loading loading-spinner loading-lg"></span></div>}>
                <TrafficMatrixByCategory
                  ref={trafficMatrixRef}
                  simpangId={activeSimpangId}
                  startDate={dateInput}
                  endDate={dateInput}
                  simpangName={activeSimpang}
                />
              </Suspense>
            </CollapsibleSection>
            <CollapsibleSection title="Data Pergerakan Dengan Filter Interval">
              <Suspense fallback={<div className="flex justify-center"><span className="loading loading-spinner loading-lg"></span></div>}>
                <TrafficMatrixByFilter2
                  ref={trafficMatrixByFilterRef}
                  simpangId={activeSimpangId}
                  dateInput={dateInput}
                  simpangName={activeSimpang}
                />
              </Suspense>
            </CollapsibleSection>
            <CollapsibleSection title="Detail Kendaraan Per Interval">
              <Suspense fallback={<div className="flex justify-center"><span className="loading loading-spinner loading-lg"></span></div>}>
                <VehicleDetailByInterval
                  ref={vehicleDetailByIntervalRef}
                  simpangId={activeSimpangId}
                  dateInput={dateInput}
                  simpangName={activeSimpang}
                />
              </Suspense>
            </CollapsibleSection>
          </div>

          <div className="mt-8">
            <ClasificationTable typeClass={activeStates.classification[0]} />
          </div>
        </div>
      </Suspense>
    </div>
  );
}
export default KomposisiLaluLintasPage; 
