"use client";
import { useEffect } from "react";
import MapComponent from "@/app/components/map";
import VehicleMonitoringTable from '@/app/components/vehicleMonitoringTable';

function SurveiPage() {
  return (
    <div>
      <MapComponent title={"Survei Lalu Lintas"}/>
      <VehicleMonitoringTable />
    </div>
  );
}
export default SurveiPage 