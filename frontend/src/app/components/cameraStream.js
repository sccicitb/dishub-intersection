'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

// import VideoStream from '../components/videoStream';
import CCTVStream from '../components/cctvStream';
import CameraStatusTimeline from "@/app/components/cameraStatusTime";
import { maps, cameras, logCamera } from '@/lib/apiService';
import AdaptiveVideoPlayer from './adaptiveCameraStream';

const CameraStream = () => {
  const [streamData, setStreamData] = useState({});
  const [activeCamera, setActiveCamera] = useState('');
  const [dataCameras, setDataCameras] = useState([]);

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
      const res = await logCamera.getByCameraId(cameraId, filterDate);
      const logs = Array.isArray(res?.data?.logs) ? res.data.logs : [];

      const filteredLogs = logs;

      const offlineLogs = filteredLogs.filter(log => log.status === 0);
      return {
        all: filteredLogs,
        offline: offlineLogs,
        raw: logs
      };
    } catch (err) {
      console.error("Error fetching camera logs:", err);
      setCameraLogs(prev => ({
        ...prev,
        [cameraId]: {
          all: [],
          offline: [],
          raw: []
        }
      }));
    }
  };

  const [dateInput, setDateInput] = useState(() => formatDateToInput(new Date()));

  useEffect(() => {
    if (activeCamera && dateInput) {
      getLogCamera(activeCamera, dateInput);
    }
  }, [activeCamera, dateInput])

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await cameras.getAll();
        const detectedCameras = res.data.cameras.filter(
          b => b.status == 1
        );
        setDataCameras(detectedCameras);
      } catch (err) {
        console.error("Failed to fetch cameras:", err);
      }
    };

    fetchCameras();
  }, []);

  // Fixed: Use useSocket hook instead of hardcoded URL
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !dataCameras.length) return;

    const handleData = (data, camId) => {
      setStreamData(prev => ({ ...prev, [camId]: data }));
    };

    dataCameras.forEach(cam => {
      if (cam?.socket_event && cam?.id && cam?.socket_event !== "not_yet_assign") {
        socket.on(cam.socket_event, (data) => handleData(data, cam.id));
      }
    });

    return () => {
      dataCameras.forEach(cam => {
        if (cam?.socket_event && cam?.socket_event !== "not_yet_assign") {
          socket.off(cam.socket_event);
        }
      });
    };
  }, [socket, dataCameras]);

  useEffect(() => {
    if (dataCameras.length > 0) {
      dataCameras.forEach(cam => {
        if (cam?.id) {
          getLogCamera(cam.id, dateInput);
        }
      });
    }
  }, [dataCameras, dateInput]);

  useEffect(() => {
    const today = new Date();
    setDateInput(formatDateToInput(today));
  }, []);

  const videoStreamCameras = dataCameras.filter(cam => cam.socket_event === "not_yet_assign");
  const cctvStreamCameras = dataCameras.filter(cam => cam.socket_event !== "not_yet_assign");

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-5">
        {videoStreamCameras.map((cam) => {
          return (
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
          )
        })}

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-5">
        {cctvStreamCameras.map((cam) => {
          return (
            <div key={cam.id} className="bg-base-200 rounded-lg shadow-md overflow-hidden">
              <CCTVStream
                data={streamData[cam.id]}
                title={`CCTV ${cam.name}`}
                large
                onClick={() => setActiveCamera(cam.camera?.id || cam.id)}
              />
              <CameraStatusTimeline
                cameraId={cam.id}
                selectedDate={dateInput}
              />
            </div>
          );
        })}
      </div>
    </div >
  );
};

export default CameraStream;
