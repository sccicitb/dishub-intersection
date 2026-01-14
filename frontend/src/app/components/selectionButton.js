"use client";
import { lazy, Suspense, useState, useEffect } from 'react';
import { useAuth } from "@/app/context/authContext";
import axiosInstance from '@/lib/apiClient';
const SurveyLalulintasExport = lazy(() => import('./exportPdf'));

export default function SelectionButtons ({ pendekatan, interval, exportPdf, arahPergerakan, vehicleData, activeSurveyor, activeClassification, activePendekatan, activePergerakan, setActiveSurveyor, setActivePendekatan, setActiveClassification, setActivePergerakan, activeInterval, setActiveInterval, activeDirection, setActiveDirection, direction, simpang_id = 2 }) {
  const { pathname, isEditor, isAdmin } = useAuth();
  const [availableDirections, setAvailableDirections] = useState([]);
  const [loadingDirections, setLoadingDirections] = useState(false);

  // Fetch available directions dari API berdasarkan simpang_id
  useEffect(() => {
    const fetchAvailableDirections = async () => {
      try {
        // console.log("test fetch available directions", { simpang_id });
        setLoadingDirections(true);
        const response = await axiosInstance.get(`/surveys/available-directions`, {
          params: { simpang_id: simpang_id }
        });
        
        if (response.data.success && response.data.available_directions_id) {
          setAvailableDirections(response.data.available_directions_id);
        }
      } catch (error) {
        console.error('Error fetching available directions:', error);
      } finally {
        setLoadingDirections(false);
      }
    };

    if (simpang_id) {
      fetchAvailableDirections();
    }
  }, [simpang_id]);

  // Opsi untuk surveyor
  const surveyorOptions = ['VIANA', 'Manual', 'Semua'];

  // Opsi Pendekatan simpang
  const pendekatanOptions = ['Utara', 'Selatan', 'Timur', 'Barat', 'Semua'];

  // Opsi Pendekatan simpang
  const pergerakanOptions = ['Belok Kiri', 'Belok Kanan', 'Lurus', 'Semua'];

  const directionOptions = ['timur', 'selatan', 'utara', 'barat', 'Semua'];

  // Opsi Pendekatan simpang
  const intervalOptions = [
    {
      item: '',
      display: '15 Menit'
    },
    {
      item: '1h',
      display: 'jam'
    }
  ];

  const intervalOptionsP = [
    {
      item: '5min',
      display: '5 Menit'
    },
    {
      item: '10min',
      display: '10 Menit'
    },
    {
      item: '15min',
      display: '15 Menit'
    },
    {
      item: '1h',
      display: 'jam'
    }
  ];


  // Opsi untuk jenis klasifikasi
  const classificationOptions = ['PKJI 2023 Luar Kota', 'PKJI 2023 Dalam Kota', 'Tipikal'];

  return (
    <div className="mx-auto space-y-1 w-full h-fit lg:w-[100%]">
      {/* <div className="space-y-1">
        <h3 className="text-[14px] font-medium">Pilih Surveyor</h3>
        <div className="join w-full gap-5 flex overflow-x-auto p-2">
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
      </div> */}

      {interval && (
        <div className="space-y-1">
          <h3 className="text-[14px] font-medium">Pilih Interval</h3>
          <div className="join w-full gap-5 flex overflow-x-auto p-2">
            {pathname !== "/survei-pergerakan" ? intervalOptionsP.map((option, id) => (
              <button
                key={id}
                className={`btn join-item rounded-md flex-1 text-nowrap btn-sm w-fit px-2  ${activeInterval.toLowerCase() === option.item.toLowerCase() ? 'bg-[#232f61] text-white' : 'outline-none'}`}
                onClick={() => setActiveInterval(option.item)}
              >
                {option.display}
              </button>
            )) : intervalOptionsP.map((option, id) => (
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

      {pendekatan && (
        <div className="space-y-1">
          <h3 className="text-[14px] font-medium">Pilih Pendekatan Simpang (Dari Arah)</h3>
          <div className="join w-full gap-5 flex overflow-x-auto p-2">
            {pendekatanOptions.map((option) => {
              const isAvailable = availableDirections.length === 0 || availableDirections.some(dir => dir.toLowerCase() === option.toLowerCase());
              const isDisabled = availableDirections.length > 0 && !isAvailable && option !== 'Semua';
              
              return (
                <button
                  key={option}
                  disabled={isDisabled}
                  className={`btn join-item ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} rounded-md flex-1 text-nowrap btn-sm w-fit px-2 ${
                    isDisabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : activePendekatan.toLowerCase() === option.toLowerCase() 
                        ? 'bg-[#232f61] text-white' 
                        : 'outline-none'
                  }`}
                  onClick={() => !isDisabled && setActivePendekatan(option)}
                  title={isDisabled ? `Tidak tersedia untuk simpang ini` : ''}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {arahPergerakan && (
        <div className="space-y-1">
          <h3 className="text-[14px] font-medium">Pilih Arah Pergerakan</h3>
          <div className="join w-full gap-5 flex overflow-x-auto p-2">
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

      {direction && (
        <div className="space-y-1">
          <h3 className="text-[14px] font-medium">Pilih Arah Pergerakan</h3>
          <div className="join w-full gap-5 flex overflow-x-auto p-2">
            {directionOptions.map((option) => (
              <button
                key={option}
                className={`btn join-item rounded-md flex-1 text-nowrap btn-sm w-fit px-2  ${activeDirection.toLowerCase() === option.toLowerCase() ? 'bg-[#232f61] text-white' : 'outline-none'}`}
                onClick={() => setActiveDirection(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1">
        <h3 className="text-[14px] font-medium">Pilih Jenis Klasifikasi</h3>
        <div className="join w-full gap-5 flex overflow-x-auto p-2">
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
        {exportPdf && isAdmin && (

          <div className='space-y-1'>
            <div className="w-full flex overflow-x-auto join pt-2 px-2">
              {/* <ExportButton vehicleData={dataTable} fileName='Data_Kendaraan_perjam'/> */}
              <SurveyLalulintasExport vehicleData={vehicleData} activeClassification={activeClassification} />
            </div>
          </div>
        )}
      </Suspense>
    </div>
  );
}
