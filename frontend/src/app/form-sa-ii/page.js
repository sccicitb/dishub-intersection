"use client"
import { lazy, Suspense, useEffect, useState } from "react"
import DataEkuivalensi from '@/data/DataEkuivalensi.json';
import EkuivalensiForm from "../components/form/ekuivalensiForm";

const SimpangTrafficKinerja = lazy(() => import("@/app/components/simpangTrafficKinerja"));
const TrafficKinerjaTable = lazy(() => import("@/app/components/trafficSurveyTable"));
const EkuivalensiChart = lazy(() => import("@/app/components/ekuivalensiChart"))
const SurveyFormSAHeader = lazy(() => import('@/app/components/form/formSurveyHeader'))

const FormSAIIPage = () => {
  const [dataChart, setDataChart] = useState([]);
  const [dataTerlindung, setDataTerlindung] = useState([]);
  const [dataTerlawan, setDataTerlawan] = useState([]);
  const [headerData, setHeader] = useState({});
  const [dataEmp, setDataEmp] = useState({});

  useEffect(() => {
    import('@/data/DataEkuivalensi.json').then((data) => {
      setDataChart(data.default)
      setDataTerlindung(data.default.filter((item) => item.type === "terlindungi" ? data.default.data : []))
      setDataTerlawan(data.default.filter((item) => item.type === "terlawanan" ? data.default.data : []))
    })
  }, [])

  useEffect(() => {
    console.log(dataEmp)
  }, [dataEmp])

  return (
    <div>
      <div className="w-full p-8 text-xl">
        <h2>Analisis Kinerja Simpang APIL</h2>
      </div>
      <SurveyFormSAHeader setDataHeader={setHeader}/>
      <EkuivalensiForm setEMP={setDataEmp}/>
      <Suspense fallback={<div className="my-5 w-full text-center">Loading...</div>}>
        <TrafficKinerjaTable dataEMP={dataEmp}/>
        <SimpangTrafficKinerja />
        <div className="w-full">
          <EkuivalensiChart data={dataTerlindung} />
          <EkuivalensiChart data={dataTerlawan} />
        </div>
      </Suspense>
    </div>
  )
}
export default FormSAIIPage;