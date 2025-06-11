"use client";
import { lazy, Suspense } from "react";
const FaseApilTable = lazy(() => import("@/app/components/table/faseApilTable"))
export const Loading = () => { return (<div className="w-full h-full m-auto text-center p-2">Loading ...</div>) }
const FormSAIPage = () => {
  return (
    <div>
      <Suspense fallback={<Loading/>}>
      <FaseApilTable />
      </Suspense>
    </div>
  )
}
export default FormSAIPage;