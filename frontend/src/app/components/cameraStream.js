"use client"

import { useEffect, useState } from 'react'; 
import { io } from 'socket.io-client';
import CCTVStream from '../components/cctvStream';
import CameraStatusTimeline from "@/app/components/cameraStatusTime";

const CameraStream = () => {
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
  
  const cameraStatusData = [
    { 
      start: new Date('2023-01-01T00:00:00').getTime(), 
      end: new Date('2023-01-01T06:00:00').getTime(), 
      status: true  // Menyala - Hijau
    },
    { 
      start: new Date('2023-01-01T06:00:00').getTime(), 
      end: new Date('2023-01-01T08:00:00').getTime(), 
      status: false  // Mati - Merah
    },
    { 
      start: new Date('2023-01-01T08:00:00').getTime(), 
      end: new Date('2023-01-01T12:00:00').getTime(), 
      status: true  // Menyala - Hijau
    },
    { 
      start: new Date('2023-01-01T12:00:00').getTime(), 
      end: new Date('2023-01-01T14:00:00').getTime(), 
      status: false  // Mati - Merah
    },
    { 
      start: new Date('2023-01-01T14:00:00').getTime(), 
      end: new Date('2023-01-01T18:00:00').getTime(), 
      status: true  // Menyala - Hijau
    },
    { 
      start: new Date('2023-01-01T18:00:00').getTime(), 
      end: new Date('2023-01-01T24:00:00').getTime(), 
      status: null  // Tidak aktif - Abu-abu
    }
  ];

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-5">
          <div className="bg-base-200 rounded-lg shadow-md overflow-hidden">
            <CCTVStream 
              data={streamData.detection3} 
              large
              title="CCTV Camera 3" 
              onClick={() => setActiveCamera('detection3')}
            />
            <CameraStatusTimeline cameraStatusData={cameraStatusData}/>
          </div>
          <div className="bg-base-200 rounded-lg shadow-md overflow-hidden">
            <CCTVStream 
              data={streamData.detection4} 
              title="CCTV Camera 4" 
              large
              onClick={() => setActiveCamera('detection4')}
            />
            <CameraStatusTimeline cameraStatusData={cameraStatusData}/>
          </div>
          <div className="bg-base-200 rounded-lg shadow-md overflow-hidden">
            <CCTVStream 
              data={streamData.detection5} 
              title="CCTV Camera 5" 
              large
              onClick={() => setActiveCamera('detection5')}
            />
            <CameraStatusTimeline cameraStatusData={cameraStatusData}/>
          </div>
          <div className="bg-base-200 rounded-lg shadow-md overflow-hidden">
            <CCTVStream 
              data={streamData.detection} 
              title="CCTV Camera 1" 
              large
              onClick={() => setActiveCamera('detection')}
            />
            <CameraStatusTimeline cameraStatusData={cameraStatusData}/>
          </div>
      </div>
  );
}
export default CameraStream