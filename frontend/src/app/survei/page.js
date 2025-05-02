"use client";
import MapComponent from "@/app/components/map";
// import VehicleMonitoringTable from '@/app/components/vehicleMonitoringTable';
import VehicleTable from "@/app/components/vehicleTable";
import SurveyInfoTable from "@/app/components/surveyorTable";
import SelectionButtons from "@/app/components/selectionButton";
import RecentVehicle from "@/app/components/recentVehicle";
import CCTVStream from '@/app/components/cctvStream';
import {io} from 'socket.io-client';
import { useState, useEffect } from 'react';

function SurveiPage() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [streamData, setStreamData] = useState({
    detection3: null,
    detection4: null,
    detection5: null,
    detection1: null
  });
  const [activeCamera, setActiveCamera] = useState('detection4');

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = io('https://sxe-data.layanancerdas.id');

    socket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
    });
    

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });
    
    // Subscribe to the three detection topics
    socket.on('result_detection_3', (data) => {
      console.log("result_detection_3: " + data);
      setStreamData(prev => ({ ...prev, detection3: data }));
    });
    
    socket.on('result_detection', (data) => {
      setStreamData(prev => ({ ...prev, detection1: data }));
    });

    socket.on('result_detection_4', (data) => {
      console.log("result_detection_4: " + data);
      setStreamData(prev => ({ ...prev, detection4: data }));
    });

    socket.on('result_detection_5', (data) => {
      console.log("result_detection_5: " + data);
      setStreamData(prev => ({ ...prev, detection5: data }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <div>
      <MapComponent title={"Survei Lalu Lintas"}/>
      <div className="w-[95%] m-auto">
        <div className="xl:grid xl:grid-cols-3 xl:max-h-[600px] flex flex-col xl:items-center xl:place-items-center gap-5 py-10">
          <RecentVehicle />
          <div className="xl:col-span-2 w-full h-full">
            <div className="bg-base-200 rounded-lg shadow-md overflow-hidden">
              <CCTVStream 
                data={streamData.detection3} 
                customLarge="h-[470px]"
                title="CCTV Camera 3" 
                onClick={() => setActiveCamera('detection3')}
              />
            </div>
          </div>
        </div>
        <div className="xl:grid xl:grid-cols-2 items-center place-items-center lg:gap-5 py-10">
          <SurveyInfoTable />
          <div className="w-full justify-end flex flex-col">
            <SelectionButtons/>
          </div>
        </div>
        <VehicleTable />
      </div>
    </div>
  );
}
export default SurveiPage 