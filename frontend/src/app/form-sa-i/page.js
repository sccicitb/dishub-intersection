"use client";
import { lazy, Suspense, useEffect, useState } from "react";
import { cameras } from '@/lib/apiService';

const FaseApilTable = lazy(() => import("@/app/components/table/faseApilTable"));
const FaseLapanganTable = lazy(() => import("@/app/components/table/faseLapanganTable"));
const MapComponent = lazy(() => import("@/app/components/map"));
const SurveyInfoTable = lazy(() => import('@/app/components/surveyorTable'));
const SurveyFormSAHeader = lazy(() => import('@/app/components/form/formSurveyHeader'))

export const Loading = () => { return (<div className="w-full h-full m-auto text-center p-2">Loading ...</div>) }


const FormSAIPage = () => {
  const [dataCameras, setDataCameras] = useState([]);
  const [selectCameras, setSelectCameras] = useState();

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
      <div>
        <div className="w-56 px-3">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Lokasi</legend>
            <select
              className="select select-sm w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100/90 focus:border-transparent"
              value={selectCameras}
              onChange={(e) => setSelectCameras(e.target.value)}
            >
              <option value="">Pilih Lokasi Camera</option>
              {
                dataCameras?.map(({ id, simpang_name, name, socket_event }) => {
                  return <option className={`${socket_event === "not_yet_assign" ? 'text-red-800/90' : 'text-green-800/90'} font-semibold`} value={id} key={id}>{simpang_name} : {name}</option>;
                })
              }
            </select>
          </fieldset>
        </div>
      </div>
      <div className="w-full p-4 text-xl">
        <h2>Analisis Kinerja Simpang APIL</h2>
      </div>
      <SurveyFormSAHeader />
      <div className="lg:w-1/2 p-3">
        {/* <SurveyInfoTable /> */}
      </div>
      <div className="w-full p-4 text-xl">
        <h2>Form SA-I</h2>
        <p className="text-[14px] py-1">Sketsa Simpang</p>
      </div>
      <Suspense fallback={<Loading />}>
        <MapComponent title={""} onClick={handleCameraSelect} onClickSimpang={handleSimpangSelect} form />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <FaseLapanganTable />
        <FaseApilTable />
      </Suspense>
    </div>
  )
}
export default FormSAIPage;