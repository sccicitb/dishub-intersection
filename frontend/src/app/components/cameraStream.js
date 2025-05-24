'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import CCTVStream from '../components/cctvStream';
import CameraStatusTimeline from "@/app/components/cameraStatusTime";
import { maps, logCamera } from '@/lib/apiService';

const CameraStream = () => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [streamData, setStreamData] = useState({});
  const [activeCamera, setActiveCamera] = useState('');
  const [cameras, setCameras] = useState([]);
  const [cameraLogs, setCameraLogs] = useState({});


  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await maps.getAll();
        // console.log("Hasil getAll:", res); 
        const detectedCameras = res.data.buildings.filter(
          b => b.model_detection && b.camera
        );
        setCameras(detectedCameras);
      } catch (err) {
        console.error("Failed to fetch cameras:", err);
      }
    };

    fetchCameras();
  }, []);

  useEffect(() => {
    const socket = io('https://sxe-data.layanancerdas.id');

    socket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    cameras.forEach(building => {
      const cam = building.camera;
      if (cam?.socketEvent && cam?.id) {
        socket.on(cam.socketEvent, (data) => {
          setStreamData(prev => ({ ...prev, [cam.id]: data }));
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [cameras]);

  const getLogcamera = async (id) => {
    try {
      const res = await logCamera.getById(id);
      // console.log(JSON.stringify(res))
      // Asumsikan hasilnya dalam format array objek seperti: { start: ..., end: ..., status: ... }
      let logs = Array.isArray(res.data.logs) ? res.data.logs : []; 
      // const logs = res.data || [];
      
      setCameraLogs(prev => ({
        ...prev,
        [id]: logs
      }));
      // console.log("Logs untuk kamera ID", id, logs);
    } catch (err) {
      console.error("Gagal fetch data: ", err);
    }
  };

  useEffect(() => {
    if (cameras.length > 0) {
      cameras.forEach(cam => {
        if (cam?.id) {
          getLogcamera(cam.id);
        }
      });
    }
  }, [cameras]);

  useEffect(()=>{
      console.log("Logs untuk kamera ID", cameraLogs);
  },[cameraLogs])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-5">
      {cameras.map((cam) => (
        <div key={cam.id} className="bg-base-200 rounded-lg shadow-md overflow-hidden">
          <CCTVStream
            data={streamData[cam.camera.id]}
            title={`CCTV ${cam.camera.title} (${cam.name})`}
            large
            onClick={() => setActiveCamera(cam.camera.id)}
          />
          <CameraStatusTimeline cameraStatusData={cameraLogs[cam.id] || []} />
        </div>
      ))}
    </div>
  );
};

export default CameraStream;
