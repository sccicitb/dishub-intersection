"use client";
import { lazy, Suspense } from 'react';
const SurveyLalulintasExport = lazy(() => import('./exportPdf'));

export default function SelectionButtons ({ interval, exportPdf, arahPergerakan, vehicleData, activeSurveyor, activeClassification, activePendekatan, activePergerakan, setActiveSurveyor, setActivePendekatan, setActiveClassification, setActivePergerakan, activeInterval, setActiveInterval }) {

  // Opsi untuk surveyor
  const surveyorOptions = ['VIANA', 'Manual', 'Semua'];

  // Opsi Pendekatan simpang
  const pendekatanOptions = ['Utara', 'Selatan', 'Timur', 'Barat', 'Semua'];

  // Opsi Pendekatan simpang
  const pergerakanOptions = ['Belok Kiri', 'Belok Kanan', 'Lurus', 'Semua'];

  // Opsi Pendekatan simpang
  const intervalOptions = [
    {
      item: '',
      display: '5 Menit'
    },
    {
      item: '1h',
      display: 'jam'
    }
  ];

  // Opsi untuk jenis klasifikasi
  const classificationOptions = ['PKJI 2023 Luar Kota', 'PKJI 2023 Dalam Kota', 'Tipikal'];

  return (
    <div className="p-4 mx-auto space-y-6 w-full lg:w-[90%]">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Pilih Surveyor</h3>
        <div className="join w-full gap-5 flex overflow-x-auto">
          {surveyorOptions.map((option) => (
            <button
              key={option}
              className={`btn join-item rounded-md flex-1 text-nowrap btn-sm w-fit px-2  ${activeSurveyor.toLowerCase() === option.toLowerCase() ? 'bg-[#232f61] text-white' : 'outline-none'}`}
              onClick={() => setActiveSurveyor(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {interval && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Pilih Interval</h3>
          <div className="join w-full gap-5 flex overflow-x-auto">
            {intervalOptions.map((option, id) => (
              <button
                key={id}
                className={`btn join-item rounded-md flex-1 text-nowrap btn-sm w-fit px-2  ${activeInterval.toLowerCase() === option.item.toLowerCase() ? 'bg-[#232f61] text-white' : 'outline-none'}`}
                onClick={() => setActiveInterval(option.item)}
              >
                {option.display}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Pilih Pendekatan Simpang</h3>
        <div className="join w-full gap-5 flex overflow-x-auto">
          {pendekatanOptions.map((option) => (
            <button
              key={option}
              className={`btn join-item rounded-md flex-1 text-nowrap btn-sm w-fit px-2  ${activePendekatan.toLowerCase() === option.toLowerCase() ? 'bg-[#232f61] text-white' : 'outline-none'}`}
              onClick={() => setActivePendekatan(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {arahPergerakan && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Pilih Arah Pergerakan</h3>
          <div className="join w-full gap-5 flex overflow-x-auto">
            {pergerakanOptions.map((option) => (
              <button
                key={option}
                className={`btn join-item rounded-md flex-1 text-nowrap btn-sm w-fit px-2  ${activePergerakan.toLowerCase() === option.toLowerCase() ? 'bg-[#232f61] text-white' : 'outline-none'}`}
                onClick={() => setActivePergerakan(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Pilih Jenis Klasifikasi</h3>
        <div className="join w-full gap-5 flex overflow-x-auto">
          {classificationOptions.map((option) => (
            <button
              key={option}
              className={`btn join-item rounded-md flex-1 btn-sm text-nowrap w-fit px-2 ${activeClassification.toLowerCase() === option.toLowerCase() ? 'bg-[#232f61] text-white' : 'outline-none'}`}
              onClick={() => setActiveClassification(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <Suspense fallback={<div className='w-full'>Loading...</div>}>
        {exportPdf && (

          <div className='space-y-2'>
            <div className="w-full gap-5 flex overflow-x-auto join">
              {/* <ExportButton vehicleData={dataTable} fileName='Data_Kendaraan_perjam'/> */}
              <SurveyLalulintasExport vehicleData={vehicleData} />
            </div>
          </div>
        )}
      </Suspense>
    </div>
  );
}