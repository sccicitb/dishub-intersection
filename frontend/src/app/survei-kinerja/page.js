"use client"
import { lazy, Suspense, useEffect, useState } from "react"

const  SimpangTrafficKinerja = lazy (() => import("@/app/components/simpangTrafficKinerja"));
const TrafficKinerjaTable = lazy(() => import("@/app/components/trafficSurveyTable"));

const KinerjaPage = () => {

  return (
    <div>
      <Suspense fallback={<div className="my-5 w-full text-center">Loading...</div>}>
        <TrafficKinerjaTable />
        <SimpangTrafficKinerja />
      </Suspense>
    </div>
  )
}
export default KinerjaPage;