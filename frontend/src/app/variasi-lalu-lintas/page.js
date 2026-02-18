"use client";
import { useState, Suspense, lazy } from 'react';
import SeasonalFactorTable from '@/app/components/SeasonalFactorTable';
import CollapsibleSection from '@/components/CollapsibleSection';

// Lazy imports
const VehicleTable = lazy(() => import("@/app/components/vehicleTable").then(module => ({ default: module.VehicleTable })));
const ClasificationTable = lazy(() => import("@/app/components/clasificationTable"));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const MapComponent = lazy(() => import("@/app/components/map"));
const HeaderSurvei = lazy(() => import("@/app/components/headerLhrt"));
const WeeklyFactorTable = lazy(() => import('@/app/components/WeeklyFactorTable'));
const DailyVolumeTable = lazy(() => import('@/app/components/DailyVolumeTable'));
const VolumeStatsChart = lazy(() => import('@/app/components/VolumeStatsChart'));

function SurveiLhrkPage () {
  const [loading] = useState(false);
  const [namaSimpang, setNamaSimpang] = useState("Semua Simpang");
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('');
  const [activeInterval, setActiveInterval] = useState('');
  const [activePergerakan, setActivePergerakan] = useState('');
  const [activeTitle, setActiveTitle] = useState("Survei Variasi Lalu Lintas");
  const [activeSID, setActiveSID] = useState("semua");
  const [selectedDate] = useState(new Date());

  // Handler saat titik di peta (kamera/bangunan) diklik
  const handleClick = (building) => {
    if (!building) return;

    // Jika "semua" dipilih dari map
    if (building.id === "semua" || building.simpang === "semua") {
      setNamaSimpang("Semua Simpang");
      setActiveTitle("Survei Semua Simpang");
      setActiveSID("semua");
      return;
    }

    try {
      if (building.camera) {
        console.log("Marker clicked:", building.camera.ID_Simpang);
        // Prioritaskan ID Simpang. Jika ada ID Simpang, gunakan itu.
        const simpangId = building.camera.ID_Simpang || building.camera.id;
        const title = building.camera.Nama_Simpang || building.camera.name || "Tanpa Nama";
        
        setNamaSimpang(building.Nama_Simpang || title);
        setActiveTitle("Survei " + (building.Nama_Simpang || title));
        setActiveSID(simpangId);
      } else if (building.id) {
        // Fallback jika tidak ada properti camera
        const title = building.name || building.title || "Tanpa Nama";
        setNamaSimpang(title);
        setActiveTitle("Survei " + title);
        setActiveSID(building.id);
      }
    } catch (error) {
      console.error("Error setting simpang:", error);
    }
  };

  // Handler saat area simpang diklik
  function handleClickSimpang (loc) {
    if (loc && (loc.simpang === "semua" || loc.id === "semua")) {
      setNamaSimpang("Semua Simpang");
      setActiveTitle("Survei Semua Simpang");
      setActiveSID("semua");
      return;
    }

    if (!loc || !loc.Nama_Simpang) return;
    
    setNamaSimpang(loc.Nama_Simpang);
    let name = loc.Nama_Simpang;
    if (!name.toLowerCase().includes("simpang")) {
      name = "Simpang " + name;
    }
    setActiveTitle("Survei " + name);
    setActiveSID(loc.id);
  }

  return (
    <div className="pb-10">
      <Suspense fallback={<div className="text-center font-medium m-auto py-10 w-full">Loading Survei...</div>}>

        {/* Peta Utama */}
        <MapComponent title={activeTitle} onClick={handleClick} onClickSimpang={handleClickSimpang} />

        <div className="w-[95%] m-auto">
          <div className="flex flex-col items-center py-5 gap-5">
            {/* Header Laporan */}
            <HeaderSurvei simpangId={activeSID} selectedDate={selectedDate} arahPergerakan={activePergerakan} />

            {/* Control Panel (Filter) */}
            <div className="w-full">
              <SelectionButtons
                activeSID={activeSID}
                setActiveSID={setActiveSID} 
                activeInterval={activeInterval}
                setActiveInterval={setActiveInterval}
                activeClassification={activeClassification}
                setActiveClassification={setActiveClassification}
                activePendekatan={activePendekatan}
                setActivePendekatan={setActivePendekatan}
                activePergerakan={activePergerakan}
                setActivePergerakan={setActivePergerakan}
                // Toggle tampilan filter sesuai kebutuhan halaman ini
                showInterval={true}
                showPendekatan={true}
                showArah={true}
                showExport={false}
              />
            </div>
          </div>

          {/* Tabel Utama Kendaraan */}
          <div className="mt-4">
            {loading ? (
              <div className='my-10 text-center animate-pulse'>Memuat Data Tabel...</div>
            ) : (
              <VehicleTable
                activeCamera={activeSID}
                activeInterval={activeInterval}
                activePendekatan={activePendekatan}
                activePergerakan={activePergerakan}
                activeClassification={activeClassification}
              />
            )}
          </div>

          <ClasificationTable typeClass={activeClassification} activeInterval={activeInterval} />
        </div>

        {/* Bagian Statistik Tambahan (Collapsible) */}
        <div className="space-y-4 mt-12 w-[95%] m-auto">
          <CollapsibleSection title="Faktor Variasi Musiman" defaultOpen={false}>
            <SeasonalFactorTable year={2025} simpangId={activeSID || 0} namaSimpang={namaSimpang} />
          </CollapsibleSection>

          <CollapsibleSection title="Faktor Variasi Mingguan" defaultOpen={false}>
            <WeeklyFactorTable year={2025} simpangId={activeSID || 0} />
          </CollapsibleSection>

          <CollapsibleSection title="Volume Harian" defaultOpen={false}>
            <DailyVolumeTable year={2025} simpangId={activeSID || 0} />
          </CollapsibleSection>

          <CollapsibleSection title="Grafik Statistik Volume" defaultOpen={false}>
            <VolumeStatsChart />
          </CollapsibleSection>
        </div>
      </Suspense>
    </div>
  );
}

export default SurveiLhrkPage;