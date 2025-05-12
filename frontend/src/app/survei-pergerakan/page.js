"use client";
import MapComponent from "@/app/components/map";
// import VehicleMonitoringTable from '@/app/components/vehicleMonitoringTable';
import VehicleTable from "@/app/components/vehicleTable";
import ClasificationTable from "@/app/components/clasificationTable";
import SurveyInfoTable from "@/app/components/surveyorTable";
import SelectionButtons from "@/app/components/selectionButton";
import RecentVehicle from "@/app/components/recentVehicle";
import CCTVStream from '@/app/components/cctvStream';
import HourVehicleTable from '@/app/components/HourVehicleTable'
import {io} from 'socket.io-client';
import { useState, useEffect } from 'react';

function MovePage() {
  const [locationSelect, setLocationSelect] = useState("")
  const [activeTitle, setActiveTitle] = useState("Survei LHRK")
  function handleClick (T) {
    const replace = T.name.toLowerCase();
    console.log('clicked : '+ JSON.stringify(T));
    switch (replace) {
      case 'simpang piyungan':
        setLocationSelect('Simpang Piyungan');
        break;
      case 'simpang demen glagah':
        setLocationSelect('Simpang Demen Glagah');
        break;
      case 'simpang tempel':
        setLocationSelect('Simpang Tempel');
        break;
      case 'simpang prambanan':
        setLocationSelect('Simpang Prambanan');
        break;
    }
  }
  useEffect(() => {
    const before = "Survei Pergerakan "
    setActiveTitle(before + locationSelect)
  }, [locationSelect])
  return (
    <div>
      <MapComponent title={activeTitle} onClick={handleClick}/>
      <div className="w-[95%] m-auto">
        <div className="xl:grid xl:grid-cols-2 items-center place-items-center lg:gap-5 py-10">
          <SurveyInfoTable />
          <div className="w-full justify-end flex flex-col">
            <SelectionButtons/>
          </div>
        </div>
        <HourVehicleTable />
      </div>
    </div>
  );
}
export default MovePage; 