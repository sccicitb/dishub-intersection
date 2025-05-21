'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import CCTVStream from '../components/cctvStream';
import CameraStatusTimeline from "@/app/components/cameraStatusTime";
import { maps } from '@/lib/apiAccess';

const CameraStream = () => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [streamData, setStreamData] = useState({});
  const [activeCamera, setActiveCamera] = useState('');
  const [cameras, setCameras] = useState([]);

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

  const cameraStatusData = [
    { start: new Date('2023-01-01T00:00:00').getTime(), end: new Date('2023-01-01T06:00:00').getTime(), status: true },
    { start: new Date('2023-01-01T06:00:00').getTime(), end: new Date('2023-01-01T08:00:00').getTime(), status: false },
    { start: new Date('2023-01-01T08:00:00').getTime(), end: new Date('2023-01-01T12:00:00').getTime(), status: true },
    { start: new Date('2023-01-01T12:00:00').getTime(), end: new Date('2023-01-01T14:00:00').getTime(), status: false },
    { start: new Date('2023-01-01T14:00:00').getTime(), end: new Date('2023-01-01T18:00:00').getTime(), status: true },
    { start: new Date('2023-01-01T18:00:00').getTime(), end: new Date('2023-01-01T24:00:00').getTime(), status: null }
  ];

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
          <CameraStatusTimeline cameraStatusData={cameraStatusData} />
        </div>
      ))}
    </div>
  );
};

export default CameraStream;
