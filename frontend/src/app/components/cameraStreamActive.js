'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import CCTVStream from '../components/cctvStream';
import CameraStatusTimeline from "@/app/components/cameraStatusTime";
import { cameras, logCamera } from '@/lib/apiService';
import AdaptiveVideoPlayer from './adaptiveCameraStream';

const CameraStreamActive = ({ activeCameraId }) => {
  const [streamData, setStreamData] = useState({});
  const [dataCameras, setDataCameras] = useState([]);
  const [dateInput, setDateInput] = useState("");
  const [socketError, setSocketError] = useState(false);

  const formatDateToInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getLogCamera = async (cameraId, filterDate = null) => {
    if (!cameraId) return;
    try {
      await logCamera.getByCameraId(cameraId, filterDate);
    } catch (err) {
      console.error("Error fetching camera logs:", err);
    }
  };

  useEffect(() => {
    const today = new Date();
    setDateInput(formatDateToInput(today));
  }, []);

  useEffect(() => {
    const fetchCameras = async () => {
      if (!activeCameraId) return;
      
      try {
        const res = await cameras.getAll();
        // Filter specifically for the active camera ID
        const detectedCameras = res.data.cameras.filter(
          cam => String(cam.id) === String(activeCameraId)
        );
        setDataCameras(detectedCameras);
      } catch (err) {
        console.error("Failed to fetch cameras:", err);
      }
    };

    fetchCameras();
  }, [activeCameraId]);

  useEffect(() => {
    // Only connect if we have a camera to watch
    if (dataCameras.length === 0) return;

    const socket = io('https://sxe-data.layanancerdas.id');

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setSocketError(false);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setSocketError(true);
    });

    dataCameras.forEach(cam => {
      if (cam?.socket_event && cam?.id && cam?.socket_event !== "not_yet_assign") {
        socket.on(cam.socket_event, (data) => {
          setStreamData(prev => ({ ...prev, [cam.id]: data }));
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [dataCameras]);

  const videoStreamCameras = dataCameras.filter(cam => cam.socket_event === "not_yet_assign");
  const cctvStreamCameras = dataCameras.filter(cam => cam.socket_event !== "not_yet_assign");

  if (!activeCameraId) {
    return <div className="text-center p-4">Silahkan pilih kamera terlebih dahulu</div>;
  }

  if (dataCameras.length === 0) {
    return <div className="text-center p-4">Memuat data kamera...</div>;
  }

  return (
    <div>
      <div className="flex flex-col gap-6 py-5">
        {videoStreamCameras.map((cam) => (
          <div key={cam.id} className="bg-base-200 rounded-lg shadow-md overflow-hidden">
            <AdaptiveVideoPlayer
              videoUrl={cam.url}
              title={`Video ${cam.name}`}
              large
            />
            <CameraStatusTimeline
              cameraId={cam.id}
              selectedDate={dateInput}
            />
          </div>
        ))}

        {cctvStreamCameras.map((cam) => (
          <div key={cam.id} className="bg-base-200 rounded-lg shadow-md overflow-hidden">
            <CCTVStream
              data={socketError ? null : streamData[cam.id]}
              title={`CCTV ${cam.name} ${socketError ? '(Connection Error)' : ''}`}
              large
            />
            <CameraStatusTimeline
              cameraId={cam.id}
              selectedDate={dateInput}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CameraStreamActive;
