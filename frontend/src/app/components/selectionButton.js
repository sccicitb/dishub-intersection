"use client";
import { useState, useEffect } from 'react';
import { ExportButton } from './exportExcel';

export default function SelectionButtons() {
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
  const [activePergerakan, serActivePergerakan] = useState('Semua');

  // Opsi untuk surveyor
  const surveyorOptions = ['VIANA', 'Manual', 'Semua'];

  // Opsi Pendekatan simpang
  const pendekatanOptions = ['Utara', 'Selatan', 'Timur', 'Barat', 'Semua'];
  
  // Opsi Pendekatan simpang
  const pergerakanOptions = ['Belok Kiri', 'Belok Kanan', 'Lurus', 'Semua'];
  
  // Opsi untuk jenis klasifikasi
  const classificationOptions = ['PKJI 2023 Luar Kota', 'PKJI 2023 Dalam Kota', 'Tipikal'];
  
  return (
    <div className="p-4 mx-auto space-y-6 w-full">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Pilih Surveyor</h3>
        <div className="join w-full gap-5 flex overflow-x-auto">
          {surveyorOptions.map((option) => (
            <button
              key={option}
              className={`btn join-item rounded-md flex-1 text-nowrap btn-sm w-fit px-2  ${activeSurveyor.toLowerCase() === option.toLowerCase() ? 'bg-[#7585C1] text-white' : 'outline-none'}`}
              onClick={() => setActiveSurveyor(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Pilih Pendekatan Simpang</h3>
        <div className="join w-full gap-5 flex overflow-x-auto">
          {pendekatanOptions.map((option) => (
            <button
              key={option}
              className={`btn join-item rounded-md flex-1 text-nowrap btn-sm w-fit px-2  ${activePendekatan.toLowerCase() === option.toLowerCase() ? 'bg-[#7585C1] text-white' : 'outline-none'}`}
              onClick={() => setActivePendekatan(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Pilih Arah Pergerakan</h3>
        <div className="join w-full gap-5 flex overflow-x-auto">
          {pergerakanOptions.map((option) => (
            <button
              key={option}
              className={`btn join-item rounded-md flex-1 text-nowrap btn-sm w-fit px-2  ${activePergerakan.toLowerCase() === option.toLowerCase() ? 'bg-[#7585C1] text-white' : 'outline-none'}`}
              onClick={() => serActivePergerakan(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Pilih Jenis Klasifikasi</h3>
        <div className="join w-full gap-5 flex overflow-x-auto">
          {classificationOptions.map((option) => (
            <button
              key={option}
              className={`btn join-item rounded-md flex-1 btn-sm text-nowrap w-fit px-2 ${activeClassification.toLowerCase() === option.toLowerCase() ? 'bg-[#7585C1] text-white' : 'outline-none'}`}
              onClick={() => setActiveClassification(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className='space-y-2'>
        <div className="w-full gap-5 flex overflow-x-auto join">
          <ExportButton />
        </div>
      </div>
    </div>
  );
}