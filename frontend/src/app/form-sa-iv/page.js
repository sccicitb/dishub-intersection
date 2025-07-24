"use client";
import { lazy, Suspense, useEffect, useState } from "react";
import { cameras } from '@/lib/apiService';

const FaseApilTable = lazy(() => import("@/app/components/table/faseApilTable"));
const FaseLapanganTable = lazy(() => import("@/app/components/table/faseLapanganTable"));
const MapComponent = lazy(() => import("@/app/components/map"));
const SurveyInfoTable = lazy(() => import('@/app/components/surveyorTable'));
const SurveyFormSAHeader = lazy(() => import('@/app/components/form/formSurveyHeader'))
const FaseIVTable = lazy(() => import('@/app/components/table/faseIVTable'))
const FaseIVAnalisaTable = lazy(() => import('@/app/components/table/faseIVAnalisaTable'))

export const Loading = () => { return (<div className="w-full h-full m-auto text-center p-2">Loading ...</div>) }


const FaseIVPage = () => {
  const [dataCameras, setDataCameras] = useState([]);
  const [selectCameras, setSelectCameras] = useState();
  const [headerData, setHeader] = useState({});
  const [dataTableSAIV, setDataTableSAIV] = useState([]);
  const [selectedId, setSelectedId] = useState(0);

  const handleResetAll = () => {
    setSelectedId(0);
    setDataTableSAIV([])
    setHeader({
      id: 0,
      tanggal: '',
      kabupatenKota: '',
      lokasi: '',
      ruasJalanMayor: [''],
      ruasJalanMinor: [''],
      ukuranKota: '',
      perihal: '',
      periode: ''
    });
  }


  let payload;

  useEffect(() => {

    payload = {
      SAIV: { ...dataTableSAIV },
      // fase: { ...faseApil }
    };


    console.log('Payload gabungan:', payload, headerData);
    console.log('id:', selectedId);
  }, [dataTableSAIV, headerData, selectedId]);

  const handleSubmit = () => {
    console.log(payload);

    const existing = JSON.parse(localStorage.getItem('data')) || {
      data: { headerData: [], sa1: {}, sa2: {}, sa3: {}, sa4: {}, sa5: {} }
    };

    const headerId = headerData?.id;
    
    if (!existing.data.sa4) {
      existing.data.sa4 = {};
    }
    // Validasi id
    if (headerId !== undefined && headerId !== null && headerId !== 0 && headerId !== '0') {
      // Simpan payload ke sa1
      existing.data.sa4[headerId] = payload;
      localStorage.setItem('data', JSON.stringify(existing));
      console.log('Data berhasil disimpan ke sa1 dengan id:', headerId);
    } else {
      console.warn('⚠️ ID header tidak valid. Data tidak disimpan.');
    }
  };

  const fetchData = async () => {
    try {
      const camerasRes = await cameras.getAll();
      const data = camerasRes.data.cameras || [];
      setDataCameras(data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setDataCameras([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimpangSelect = () => {

  }

  const handleCameraSelect = () => {

  }

  return (
    <div>
      <div className="w-full p-8 text-xl">
        <h2>Analisis Kinerja Simpang APIL</h2>
      </div>
      <SurveyFormSAHeader setDataHeader={setHeader} setSelectedId={setSelectedId} onResetAll={handleResetAll} />
      <div className="lg:w-1/2 p-3">
        {/* <SurveyInfoTable /> */}
      </div>
      <div className="w-full p-4 text-xl">
        <h2>Form SA-IV</h2>
      </div>
      {/* <Suspense fallback={<Loading />}>
        <MapComponent title={""} onClick={handleCameraSelect} onClickSimpang={handleSimpangSelect} form />
      </Suspense> */}
      <Suspense fallback={<Loading />}>
        <FaseIVTable setFormTableIV={setDataTableSAIV} selectedId={selectedId} />
        <div className="w-full items-center flex p-6">
          <button onClick={handleSubmit} className="btn btn-sm w-full mx-auto btn-success">Submit</button>
        </div>
        <FaseIVAnalisaTable selectedId={selectedId} />
      </Suspense>
    </div>
  )
}
export default FaseIVPage;