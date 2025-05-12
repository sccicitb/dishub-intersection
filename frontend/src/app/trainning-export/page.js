"use client"
import {useEffect, useState} from "react"
import ExportPDF from "@/app/components/exportPdf"
const TrainningPage = () => {
  const [vehicleData, setVehicleData] = useState(null);
  
  useEffect(() => {
    import('@/app/data/sampleVehicleData.json').then((data) => {
      setVehicleData(data.default);
    });
  }, []);
  
  return(
    <div>
      <ExportPDF vehicleData={vehicleData}/>
    </div>
  )
}
export default TrainningPage;