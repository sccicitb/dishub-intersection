"use client";
import { toast } from 'sonner';
import { lazy, Suspense } from 'react';

const SurveyLalulintasExport = lazy(() => import('./exportPdf'));

const intervalOptions = [
  { item: '5min', display: '5 Menit' },
  { item: '15min', display: '15 Menit' },
  { item: '30min', display: '30 Menit' },
  { item: '1h', display: '1 Jam' }
];

const classificationOptions = ['PKJI 2023 Luar Kota', 'PKJI 2023 Dalam Kota', 'Tipikal'];
const pendekatanOptions = ['Utara', 'Selatan', 'Timur', 'Barat', 'Semua'];
const pergerakanOptions = ['Belok Kiri', 'Belok Kanan', 'Lurus', 'Semua'];

export default function SelectionButtons({ 
  activeSID, setActiveSID,
  activeInterval, setActiveInterval,
  activeClassification, setActiveClassification,
  activePendekatan, setActivePendekatan,
  activePergerakan, setActivePergerakan,
  showInterval, showPendekatan, showArah, showExport,
  vehicleData
}) {


  const handleFilterChange = (setter, value) => {
    setter(value);
  };

  const FilterGroup = ({ title, options, activeValue, setter, isObject = false }) => (
    <div className="flex flex-col gap-2">
      <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{title}</h3>
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 rounded-xl border border-gray-100">
        {options.map((opt, i) => {
          const val = isObject ? opt.item : opt;
          const label = isObject ? opt.display : opt;
          const isActive = activeValue && activeValue.toString().toLowerCase() === val.toString().toLowerCase();

          return (
            <button
              key={i}
              onClick={() => handleFilterChange(setter, val)}
              className={`flex-1 text-nowrap px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 
                ${isActive 
                  ? 'bg-[#232f61] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-[#232f61]'}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Kolom Kiri: Waktu & Klasifikasi */}
        <div className="space-y-5">
          {/* Opsi Lokasi Simpang (Jika setActiveSID tersedia) */}
          {setActiveSID && (
            <div className="flex flex-col gap-2">
              <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Lokasi Simpang</h3>
              <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 rounded-xl border border-gray-100">
                <button
                   onClick={() => setActiveSID('semua')}
                   className={`flex-1 text-nowrap px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 
                     ${activeSID === 'semua' 
                       ? 'bg-[#232f61] text-white shadow-md' 
                       : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-[#232f61]'}`}
                >
                  Semua Simpang
                </button>
                <div className="flex items-center px-4 py-1.5 text-xs text-gray-400">
                  {/* Info: Use Map for Specific Simpang */}
                  (Pilih di Peta untuk Satuan)
                </div>
              </div>
            </div>
          )}

          {showInterval && (
            <FilterGroup 
              title="Interval Waktu" 
              options={intervalOptions} 
              activeValue={activeInterval} 
              setter={setActiveInterval} 
              isObject={true} 
            />
          )}
          
          <FilterGroup 
            title="Jenis Klasifikasi" 
            options={classificationOptions} 
            activeValue={activeClassification} 
            setter={setActiveClassification} 
          />
        </div>

        {/* Kolom Kanan: Arah & Gerakan */}
        <div className="space-y-5">
          {showPendekatan && (
            <FilterGroup 
              title="Pendekatan (Dari Arah)" 
              options={pendekatanOptions} 
              activeValue={activePendekatan} 
              setter={setActivePendekatan} 
            />
          )}
          
          {showArah && (
            <FilterGroup 
              title="Pergerakan" 
              options={pergerakanOptions} 
              activeValue={activePergerakan} 
              setter={setActivePergerakan} 
            />
          )}
        </div>
      </div>

      {/* Bagian Export */}
      {showExport && (
        <div className="pt-4 border-t border-dashed border-gray-200 flex justify-end">
          <Suspense fallback={<div className="text-xs">Loading Export Tool...</div>}>
            <SurveyLalulintasExport vehicleData={vehicleData} activeClassification={activeClassification} />
          </Suspense>
        </div>
      )}
    </div>
  );
}