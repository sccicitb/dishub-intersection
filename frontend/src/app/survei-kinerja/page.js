"use client"
import { lazy, Suspense, useEffect, useState } from "react"
import DataEkuivalensi from '@/data/DataEkuivalensi.json';

const  SimpangTrafficKinerja = lazy (() => import("@/app/components/simpangTrafficKinerja"));
const TrafficKinerjaTable = lazy(() => import("@/app/components/trafficSurveyTable"));
const EkuivalensiChart = lazy(() => import("@/app/components/ekuivalensiChart"))

const KinerjaPage = () => {
  const [dataChart, setDataChart] = useState([]);
  const [dataTerlindung, setDataTerlindung] = useState([]);
  const [dataTerlawan, setDataTerlawan] = useState([]);
  
  useEffect(() => {
    import('@/data/DataEkuivalensi.json').then((data) => {
      setDataChart(data.default)
      setDataTerlindung(data.default.filter((item) => item.type === "terlindungi" ? data.default.data : []))
      setDataTerlawan(data.default.filter((item) => item.type === "terlawanan" ? data.default.data : []))
    } )
  }, [])
  return (
    <div>
      <Suspense fallback={<div className="my-5 w-full text-center">Loading...</div>}>
        <TrafficKinerjaTable />
        <SimpangTrafficKinerja />
        <div className="lg:flex w-full">
          <EkuivalensiChart data={dataTerlindung}/>
          <EkuivalensiChart data={dataTerlawan}/>
        </div>
      </Suspense>
    </div>
  )
}
export default KinerjaPage;