"use client";
import MapComponent from "@/app/components/map";
import HourVehicleTable from '@/app/components/HourVehicleTable';
import ClasificationTable from "@/app/components/clasificationTable";
import SurveyInfoTable from "@/app/components/surveyorTable";
import SelectionButtons from "@/app/components/selectionButton";
import RecentVehicle from "@/app/components/recentVehicle";
import CCTVStream from '@/app/components/cctvStream';
import {io} from 'socket.io-client';
import { useState, useEffect } from 'react';

function SurveiSimpangPage() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [selectOption, setSelectOption] = useState('detection3');
  const [streamData, setStreamData] = useState({
    detection3: null,
    detection4: null,
    detection5: null,
    detection1: null
  });
  const [activeTitle, setActiveTitle] = useState("Simpang Tempel");
  // const [activeCamera, setActiveCamera] = useState('detection4');

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
      setStreamData(prev => ({ ...prev, detection3: data }));
    });
    
    socket.on('result_detection', (data) => {
      setStreamData(prev => ({ ...prev, detection1: data }));
    });

    socket.on('result_detection_4', (data) => {
      setStreamData(prev => ({ ...prev, detection4: data }));
    });

    socket.on('result_detection_5', (data) => {
      setStreamData(prev => ({ ...prev, detection5: data }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function handleClick (T) {
    const replace = T.name.toLowerCase();
    console.log(replace);
    console.log('clicked : '+ JSON.stringify(T));
    switch (replace) {
      case 'simpang piyungan':
        setSelectOption('detection4');
        setActiveTitle('Simpang Piyungan');
        break;
      case 'simpang demen glagah':
        setSelectOption('detection3');
        setActiveTitle('Simpang Demen Glagah');
        break;
      case 'simpang tempel':
        setSelectOption('detection5');
        setActiveTitle('Simpang Tempel');
        break;
      case 'simpang prambanan':
        setSelectOption('detection1');
        setActiveTitle('Simpang Prambanan');
        break;
    }
  }
const [vehicleData, setVehicleData] = useState(null);
  
  useEffect(() => {
    // Simulasi data dummy
    import('@/app/data/sampleVehicleData.json').then((data) => {
      setVehicleData(data.default);
    });
  }, []);
  return (
    <div>
      <MapComponent title={activeTitle} onClick={handleClick}/>
      <div className="w-[95%] m-auto">
        <div className="lg:grid lg:grid-cols-3 flex flex-col lg:items-center lg:place-items-center gap-5 py-10">
          <RecentVehicle />
          <div className="lg:col-span-2 w-full h-full items-center flex bg-black">
              <CCTVStream 
                data={streamData[selectOption]} 
                customLarge="h-[470px]"
                title="CCTV Camera 3" 
              />
          </div>
        </div>
        <div className="xl:grid xl:grid-cols-2 items-center place-items-center lg:gap-10 py-10">
          <SurveyInfoTable />
          <div className="w-full justify-end flex flex-col">
            <SelectionButtons vehicleData={vehicleData}/>
          </div>
        </div>
          <HourVehicleTable statusHour={true}/>
        <ClasificationTable />
      </div>
    </div>
  );
}
export default SurveiSimpangPage 