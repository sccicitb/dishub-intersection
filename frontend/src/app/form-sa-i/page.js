"use client";
import { lazy, Suspense } from "react";

const FaseApilTable = lazy(() => import("@/app/components/table/faseApilTable"));
const FaseLapanganTable = lazy(() => import("@/app/components/table/faseLapanganTable"));
const MapComponent = lazy(() => import("@/app/components/map"));
const SurveyInfoTable = lazy(() => import('@/app/components/surveyorTable'));


export const Loading = () => { return (<div className="w-full h-full m-auto text-center p-2">Loading ...</div>) }

const FormSAIPage = () => {
  const handleSimpangSelect = () => {

  }

  const handleCameraSelect = () => {

  }

  return (
    <div>
      <div className="w-full p-4 text-xl">
        <h2>Analisis Kinerja Simpang APIL</h2>
      </div>
      <div className="lg:w-1/2 p-3">
        <SurveyInfoTable />
      </div>
      <div className="w-full p-4 text-xl">
        <h2>Form SA-I</h2>
        <p className="text-[14px] py-1">Sketsa Simpang</p>
      </div>
      <Suspense fallback={<Loading />}>
        <MapComponent title={""} onClick={handleCameraSelect} onClickSimpang={handleSimpangSelect} form/>
      </Suspense>
      <Suspense fallback={<Loading />}>
        <FaseLapanganTable />
        <FaseApilTable />
      </Suspense>
    </div>
  )
}
export default FormSAIPage;