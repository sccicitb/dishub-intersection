"use client"
import { lazy, Suspense, useEffect, useState } from "react"

const  SimpangTrafficKinerja = lazy (() => import("@/app/components/simpangTrafficKinerja"));
const TrafficKinerjaTable = lazy(() => import("@/app/components/trafficSurveyTable"));
const EkuivalensiChart = lazy(() => import("@/app/components/ekuivalensiChart"))
const KinerjaPage = () => {

  return (
    <div>
      <Suspense fallback={<div className="my-5 w-full text-center">Loading...</div>}>
        <TrafficKinerjaTable />
        <SimpangTrafficKinerja />
        <div className="lg:flex w-full">
          <EkuivalensiChart />
          <EkuivalensiChart />
        </div>
      </Suspense>
    </div>
  )
}
export default KinerjaPage;